/* =========================================================================
   acbolsa — webhook do Stripe
   =========================================================================

   Fino de propósito: a lógica do Stripe (assinatura, tipos de evento, formato
   do payload) mora em lib/pagamento/stripe.js. Aqui só: verifica, interpreta,
   grava o resultado em `pagamento_eventos` e atualiza o pedido.

   Todo evento recebido vira uma linha em `pagamento_eventos` (Supabase) — é
   onde você olha primeiro quando um pagamento não bateu.

   Configurar: Stripe → Developers → Webhooks → Add endpoint
     URL:      https://<seu-site>/api/stripe/webhook
     Eventos:  checkout.session.completed, .async_payment_succeeded,
               .async_payment_failed, .expired
   ========================================================================= */

import { verificarEvento, interpretarEvento } from "@/lib/pagamento/stripe";
import { criarClienteAdmin } from "@/lib/supabase/admin";

async function logar(linha) {
  try {
    await criarClienteAdmin().from("pagamento_eventos").insert(linha);
  } catch {
    /* Log é auxiliar — nunca deixa o webhook falhar por causa dele. */
  }
}

export async function POST(request) {
  const assinatura = request.headers.get("stripe-signature");
  const corpo = await request.text();

  const { evento, erro } = verificarEvento(corpo, assinatura);

  if (erro) {
    await logar({ tipo: "assinatura", resultado: "assinatura_invalida", detalhe: erro });
    /* 400 faz o Stripe reentregar; se for segredo errado, corrija o endpoint. */
    return new Response(erro, { status: 400 });
  }

  const supabase = criarClienteAdmin();
  const { acao, codigo, paymentIntent, motivo } = interpretarEvento(evento);
  const base = { stripe_event_id: evento.id, tipo: evento.type, pedido_codigo: codigo };

  /* Idempotência: já processamos este event.id? */
  const { data: jaVisto } = await supabase
    .from("pagamento_eventos")
    .select("id")
    .eq("stripe_event_id", evento.id)
    .maybeSingle();
  if (jaVisto) return Response.json({ recebido: true, duplicado: true });

  const patch =
    acao === "pagar"
      ? { status: "pago", pago_em: new Date().toISOString(), stripe_payment_intent: paymentIntent }
      : acao === "falhou"
        ? { status: "pagamento_falhou" }
        : acao === "expirar"
          ? { status: "expirado" }
          : null;

  if (!patch || !codigo) {
    await logar({ ...base, resultado: "ignorado", detalhe: motivo });
    return Response.json({ recebido: true, acao: "ignorar" });
  }

  /* Não rebaixa um pedido já pago (evento fora de ordem, reenvio). */
  let query = supabase.from("pedidos").update(patch).eq("codigo", codigo);
  if (acao !== "pagar") query = query.neq("status", "pago");
  const { error: erroUpdate } = await query;

  await logar({
    ...base,
    resultado: erroUpdate ? "erro" : "processado",
    detalhe: erroUpdate ? erroUpdate.message : acao + " — " + motivo,
  });

  return Response.json({ recebido: true, acao });
}
