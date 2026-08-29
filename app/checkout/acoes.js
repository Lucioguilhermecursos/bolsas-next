"use server";

/* =========================================================================
   acbolsa — gravar pedido
   =========================================================================

   O pedido é montado NO SERVIDOR a partir do catálogo — preço, nome e frete
   nunca vêm do cliente. O que o cliente manda: quais peças, quantas, e os
   dados de contato/entrega.

   Pagamento:
     - Stripe (quando STRIPE_SECRET_KEY existe): cria uma Checkout Session e
       devolve a URL dela. O status vira "pago" pelo webhook.
     - Senão, EXTERNAL_CHECKOUT_BASE_URL: link genérico ?pedido=<codigo>.
     - Senão: sem URL — a confirmação avisa que o pagamento não está ligado.
   O pedido é gravado (status "registrado") de qualquer jeito.
   ========================================================================= */

import { headers } from "next/headers";
import { criarClienteServidor } from "@/lib/supabase/server";
import { obterUsuario } from "@/lib/auth/sessao";
import { porId } from "@/lib/catalog";
import { calcularFrete } from "@/lib/formulario";
import { obterStripe, stripeAtivo, centavos } from "@/lib/pagamento/stripe";

function codigoPedido() {
  return "AC" + Date.now().toString().slice(-8);
}

async function urlBase() {
  const fixa = process.env.NEXT_PUBLIC_SITE_URL;
  if (fixa) return fixa.replace(/\/$/, "");
  const h = await headers();
  return `${h.get("x-forwarded-proto") || "http"}://${h.get("host")}`;
}

async function sessaoStripe({ linhas, frete, codigo, contato, usuario, site }) {
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

  if (frete.valor > 0) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "brl",
        unit_amount: centavos(frete.valor),
        product_data: { name: "Frete (" + frete.regiao + ")" },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "pt-BR",
    line_items,
    customer_email: contato.email || usuario.email || undefined,
    client_reference_id: codigo,
    metadata: { codigo, user_id: usuario.id },
    success_url: site + "/conta?pago=" + codigo + "#pedidos",
    cancel_url: site + "/checkout",
  });

  return { url: session.url, id: session.id };
}

export async function criarPedido(dados) {
  const usuario = await obterUsuario();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo para finalizar." };

  const { itens = [], contato = {}, entrega = {} } = dados || {};

  /* Resolve cada item pelo catálogo; descarta o que não existe mais. */
  const linhas = itens
    .map((i) => {
      const p = porId(i.id);
      const qtd = Math.max(1, Math.min(Number(i.qtd) || 1, p ? p.estoque : 0));
      return p && qtd > 0
        ? { id: p.id, nome: p.nome, cor: p.cor, preco: p.preco, qtd }
        : null;
    })
    .filter(Boolean);

  if (!linhas.length) return { erro: "Não há itens válidos na sacola." };

  const cepLimpo = String(entrega.cep || "").replace(/\D/g, "");
  if (cepLimpo.length !== 8) return { erro: "Informe um CEP válido para calcular o frete." };

  const subtotal = linhas.reduce((s, l) => s + l.preco * l.qtd, 0);
  const frete = calcularFrete(cepLimpo, subtotal);
  const total = subtotal + frete.valor;
  const codigo = codigoPedido();

  const provedor = stripeAtivo()
    ? "stripe"
    : process.env.EXTERNAL_CHECKOUT_BASE_URL
      ? "externo"
      : null;

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("pedidos").insert({
    user_id: usuario.id,
    codigo,
    status: "registrado",
    cliente: {
      nome: contato.nome || "",
      email: contato.email || usuario.email || "",
      telefone: contato.telefone || "",
      cpf: contato.cpf || "",
    },
    entrega: {
      cep: entrega.cep || "",
      rua: entrega.rua || "",
      numero: entrega.numero || "",
      complemento: entrega.complemento || null,
      bairro: entrega.bairro || "",
      cidade: entrega.cidade || "",
      uf: entrega.uf || "",
      regiao: frete.regiao,
      prazo: frete.prazo,
    },
    itens: linhas,
    valores: { subtotal, frete: frete.valor, total },
    checkout_provider: provedor,
  });

  if (error) {
    return { erro: "Não foi possível registrar o pedido agora. Tente de novo." };
  }

  /* Monta o link de pagamento. Falha aqui não perde o pedido — ele fica
     "registrado" e o link pode ser refeito depois. */
  const site = await urlBase();
  let checkoutUrl = null;
  let stripeSessionId = null;

  try {
    const s = await sessaoStripe({ linhas, frete, codigo, contato, usuario, site });
    if (s) {
      checkoutUrl = s.url;
      stripeSessionId = s.id;
    }
  } catch (e) {
    console.error("Stripe checkout session:", e?.message || e);
  }

  if (!checkoutUrl && process.env.EXTERNAL_CHECKOUT_BASE_URL) {
    const b = process.env.EXTERNAL_CHECKOUT_BASE_URL;
    checkoutUrl = b + (b.includes("?") ? "&" : "?") + "pedido=" + codigo;
  }

  if (checkoutUrl) {
    await supabase
      .from("pedidos")
      .update({ checkout_url: checkoutUrl, stripe_session_id: stripeSessionId })
      .eq("codigo", codigo);
  }

  /* Guarda o último endereço no perfil, para o próximo checkout já vir preenchido. */
  await supabase
    .from("profiles")
    .update({
      telefone: contato.telefone || null,
      cpf: contato.cpf || null,
      endereco: {
        cep: entrega.cep,
        rua: entrega.rua,
        numero: entrega.numero,
        complemento: entrega.complemento || null,
        bairro: entrega.bairro,
        cidade: entrega.cidade,
        uf: entrega.uf,
      },
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", usuario.id);

  /* Ficha do cliente (tabela `clientes`): dados completos num lugar só. */
  await supabase.from("clientes").upsert(
    {
      user_id: usuario.id,
      nome: contato.nome || null,
      email: contato.email || usuario.email || null,
      telefone: contato.telefone || null,
      cpf: contato.cpf || null,
      cep: entrega.cep || null,
      rua: entrega.rua || null,
      numero: entrega.numero || null,
      complemento: entrega.complemento || null,
      bairro: entrega.bairro || null,
      cidade: entrega.cidade || null,
      uf: entrega.uf || null,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return {
    ok: true,
    pedido: {
      codigo,
      data: new Date().toISOString(),
      cliente: {
        nome: contato.nome || "",
        email: contato.email || usuario.email || "",
        telefone: contato.telefone || "",
        cpf: contato.cpf || "",
      },
      entrega: {
        cep: entrega.cep || "",
        rua: entrega.rua || "",
        numero: entrega.numero || "",
        complemento: entrega.complemento || null,
        bairro: entrega.bairro || "",
        cidade: entrega.cidade || "",
        uf: entrega.uf || "",
        regiao: frete.regiao,
        prazo: frete.prazo,
      },
      itens: linhas,
      valores: { subtotal, frete: frete.valor, total },
      status: "registrado",
      checkoutUrl,
    },
  };
}
