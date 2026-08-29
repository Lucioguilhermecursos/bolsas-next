/* =========================================================================
   acbolsa — webhook do Stripe
   =========================================================================

   O Stripe chama esta rota quando o pagamento é concluído. Confere a
   assinatura (STRIPE_WEBHOOK_SECRET) e marca o pedido como pago.

   Sem sessão de usuário aqui — usa o cliente admin (service role) para
   escrever no pedido.

   Configurar depois: Stripe Dashboard → Developers → Webhooks → Add endpoint
     URL:    https://<seu-site>/api/stripe/webhook
     Evento: checkout.session.completed  (e checkout.session.expired)
   ========================================================================= */

import { obterStripe } from "@/lib/pagamento/stripe";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export async function POST(request) {
  const stripe = obterStripe();
  const segredo = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !segredo) {
    return new Response("Stripe não configurado.", { status: 503 });
  }

  const assinatura = request.headers.get("stripe-signature");
  const corpo = await request.text();

  let evento;
  try {
    evento = stripe.webhooks.constructEvent(corpo, assinatura, segredo);
  } catch (e) {
    return new Response("Assinatura inválida: " + (e?.message || e), { status: 400 });
  }

  const supabase = criarClienteAdmin();

  if (evento.type === "checkout.session.completed") {
    const s = evento.data.object;
    const codigo = s.metadata?.codigo || s.client_reference_id;

    if (codigo && s.payment_status === "paid") {
      await supabase
        .from("pedidos")
        .update({
          status: "pago",
          pago_em: new Date().toISOString(),
          stripe_payment_intent:
            typeof s.payment_intent === "string" ? s.payment_intent : null,
        })
        .eq("codigo", codigo);
    }
  }

  if (evento.type === "checkout.session.expired") {
    const codigo = evento.data.object.metadata?.codigo;
    if (codigo) {
      await supabase
        .from("pedidos")
        .update({ status: "expirado" })
        .eq("codigo", codigo)
        .eq("status", "registrado");
    }
  }

  return Response.json({ received: true });
}
