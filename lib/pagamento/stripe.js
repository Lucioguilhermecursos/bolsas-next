/* =========================================================================
   acbolsa — Stripe (ponto único)
   =========================================================================

   TUDO que fala com o Stripe passa por aqui. Se o Stripe mudar alguma coisa,
   é neste arquivo que se conserta — nada de lógica do Stripe espalhada.

   ---- Onde mexer quando o Stripe mudar --------------------------------------

   • Stripe subiu a versão da API e algo quebrou
       → `VERSAO_API` abaixo. Teste no modo de testes, depois publique.
       → `node scripts/stripe-check.mjs` mostra a versão da conta vs. a nossa.

   • Um pagamento não virou "pago" no site
       → tabela `pagamento_eventos` no Supabase: mostra cada evento recebido do
         Stripe e o que fizemos com ele (processado / ignorado / erro).
       → No painel do Stripe: Developers → Events (reenviar) e Webhooks (entregas).

   • Stripe renomeou / adicionou um evento
       → `EVENTOS_TRATADOS` e `interpretarEvento()`. Eventos fora da lista são
         registrados e respondidos com 200 (Stripe não fica retentando).

   • Mudou o formato do payload de um evento
       → `interpretarEvento()` lê com `?.` e cai em valores neutros; ajuste ali.

   • Campos da Checkout Session (line items, metadata, urls)
       → `criarSessaoCheckout()`.
   ========================================================================= */

import Stripe from "stripe";

/* Versão da API fixada de propósito: o Stripe evolui o schema e uma conta pode
   ser migrada sem aviso. Fixando aqui, o comportamento só muda quando NÓS
   trocamos este número — depois de testar.

   Deve bater com a versão do SDK instalado (veja
   `node_modules/stripe/cjs/apiVersion.js`). Ao rodar `npm update stripe`,
   atualize esta linha; `node scripts/stripe-check.mjs` avisa se divergir. */
export const VERSAO_API = "2026-08-26.dahlia";

/* Eventos de webhook que a loja realmente trata. Qualquer outro é registrado e
   respondido com 200 (recebido, sem ação). */
export const EVENTOS_TRATADOS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded", // PIX / boleto confirmam depois
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
];

let cache = null;

export function obterStripe() {
  const chave = process.env.STRIPE_SECRET_KEY;
  if (!chave) return null;
  if (!cache) cache = new Stripe(chave, { apiVersion: VERSAO_API });
  return cache;
}

export function stripeAtivo() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/* "test" | "live" | null — útil para avisos e para o script de diagnóstico. */
export function stripeModo() {
  const k = process.env.STRIPE_SECRET_KEY || "";
  if (k.startsWith("sk_live_") || k.startsWith("rk_live_")) return "live";
  if (k.startsWith("sk_test_") || k.startsWith("rk_test_")) return "test";
  return null;
}

/* Reais → centavos (inteiro), como o Stripe espera. */
export function centavos(valor) {
  return Math.round(Number(valor) * 100);
}

/* -------------------------------------------------------------------------
   Criação da sessão de checkout
   ------------------------------------------------------------------------- */

export async function criarSessaoCheckout({
  codigo,
  userId,
  email,
  linhas,
  freteValor,
  freteRegiao,
  urlSucesso,
  urlCancelamento,
}) {
  const stripe = obterStripe();
  if (!stripe) return null;

  const line_items = linhas.map((l) => ({
    quantity: l.qtd,
    price_data: {
      currency: "brl",
      unit_amount: centavos(l.preco),
      product_data: { name: l.nome + (l.cor ? " — " + l.cor : "") },
    },
  }));

  if (freteValor > 0) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "brl",
        unit_amount: centavos(freteValor),
        product_data: { name: "Frete" + (freteRegiao ? " (" + freteRegiao + ")" : "") },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "pt-BR",
    line_items,
    customer_email: email || undefined,
    client_reference_id: codigo,
    metadata: { codigo, user_id: userId || "" },
    success_url: urlSucesso,
    cancel_url: urlCancelamento,
  });

  return { url: session.url, id: session.id };
}

/* -------------------------------------------------------------------------
   Webhook
   ------------------------------------------------------------------------- */

/* Confere a assinatura. Devolve { evento } ou { erro } com motivo legível. */
export function verificarEvento(corpoBruto, assinatura) {
  const stripe = obterStripe();
  const segredo = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe) return { erro: "STRIPE_SECRET_KEY não configurada" };
  if (!segredo) return { erro: "STRIPE_WEBHOOK_SECRET não configurada" };
  if (!assinatura) return { erro: "requisição sem cabeçalho stripe-signature" };

  try {
    return { evento: stripe.webhooks.constructEvent(corpoBruto, assinatura, segredo) };
  } catch (e) {
    /* Causas comuns: segredo errado (endpoint diferente), corpo alterado por
       algum proxy, ou relógio do servidor fora de hora. */
    return { erro: "assinatura inválida — " + (e?.message || e) };
  }
}

/* Traduz o evento do Stripe para o que a loja precisa fazer, tolerante a
   mudanças de formato. Retorna:
     { acao: "pagar" | "falhou" | "expirar" | "ignorar", codigo, paymentIntent, motivo } */
export function interpretarEvento(evento) {
  const tipo = evento?.type;
  const obj = evento?.data?.object || {};
  const codigo = obj.metadata?.codigo || obj.client_reference_id || null;
  const paymentIntent = typeof obj.payment_intent === "string" ? obj.payment_intent : null;

  if (!EVENTOS_TRATADOS.includes(tipo)) {
    return { acao: "ignorar", codigo, paymentIntent, motivo: "evento fora da lista" };
  }

  if (tipo === "checkout.session.completed") {
    /* `paid` = cartão/PIX na hora. `unpaid` = boleto/PIX pendente — confirma
       depois em async_payment_succeeded. */
    if (obj.payment_status === "paid") {
      return { acao: "pagar", codigo, paymentIntent, motivo: "checkout concluído e pago" };
    }
    return { acao: "ignorar", codigo, paymentIntent, motivo: "checkout concluído, pagamento pendente" };
  }

  if (tipo === "checkout.session.async_payment_succeeded") {
    return { acao: "pagar", codigo, paymentIntent, motivo: "pagamento assíncrono confirmado" };
  }

  if (tipo === "checkout.session.async_payment_failed") {
    return { acao: "falhou", codigo, paymentIntent, motivo: "pagamento assíncrono recusado" };
  }

  if (tipo === "checkout.session.expired") {
    return { acao: "expirar", codigo, paymentIntent, motivo: "sessão de checkout expirou" };
  }

  return { acao: "ignorar", codigo, paymentIntent, motivo: "sem tratamento" };
}
