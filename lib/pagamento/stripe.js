/* =========================================================================
   acbolsa — Stripe
   =========================================================================

   Cliente Stripe só-servidor, criado sob demanda. Enquanto `STRIPE_SECRET_KEY`
   não estiver definida, `obterStripe()` devolve `null` e o checkout cai no
   comportamento antigo (link genérico ou aviso). Assim dá para deixar o código
   pronto e ligar o Stripe depois só preenchendo as env vars.
   ========================================================================= */

import Stripe from "stripe";

let cache = null;

export function obterStripe() {
  const chave = process.env.STRIPE_SECRET_KEY;
  if (!chave) return null;
  if (!cache) cache = new Stripe(chave);
  return cache;
}

export function stripeAtivo() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/* Reais → centavos (inteiro), como o Stripe espera. */
export function centavos(valor) {
  return Math.round(Number(valor) * 100);
}
