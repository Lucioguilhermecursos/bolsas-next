/* =========================================================================
   acbolsa — diagnóstico do Stripe
   =========================================================================

   `node scripts/stripe-check.mjs`

   Roda quando: um pagamento não virou "pago", depois de `npm update stripe`,
   ou antes de publicar. Confere chaves, modo, versão da API, conexão, webhook
   e mostra os últimos eventos/sessões. Não altera nada.

   Lê o .env.local (ou as vars já exportadas no ambiente).
   ========================================================================= */

import { readFileSync } from "node:fs";
import path from "node:path";
import Stripe from "stripe";
import { VERSAO_API, EVENTOS_TRATADOS } from "../lib/pagamento/stripe.js";

const raiz = path.resolve(import.meta.dirname, "..");

/* ---- env ---- */
for (const arquivo of [".env.local", ".env"]) {
  let txt;
  try {
    txt = readFileSync(path.join(raiz, arquivo), "utf8");
  } catch {
    continue;
  }
  for (const linha of txt.split("\n")) {
    const l = linha.trim();
    if (!l || l.startsWith("#")) continue;
    const i = l.indexOf("=");
    if (i === -1) continue;
    const k = l.slice(0, i).trim();
    let v = l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

const ok = (m) => console.log("  \x1b[32m✓\x1b[0m " + m);
const aviso = (m) => console.log("  \x1b[33m!\x1b[0m " + m);
const falha = (m) => console.log("  \x1b[31m✗\x1b[0m " + m);

let problemas = 0;

console.log("\n== Chaves ==");
const secret = process.env.STRIPE_SECRET_KEY;
const modo = secret?.includes("_live_") ? "live" : secret?.includes("_test_") ? "test" : null;

if (!secret) {
  falha("STRIPE_SECRET_KEY ausente — checkout cai no link genérico / só registra o pedido");
  problemas++;
} else {
  ok("STRIPE_SECRET_KEY presente (modo " + (modo || "?") + ")");
  if (modo === "live") aviso("modo LIVE — cobranças reais");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  falha("STRIPE_WEBHOOK_SECRET ausente — o webhook devolve 503 e nada vira 'pago'");
  problemas++;
} else {
  ok("STRIPE_WEBHOOK_SECRET presente");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  falha("SUPABASE_SERVICE_ROLE_KEY ausente — o webhook não consegue marcar o pedido");
  problemas++;
} else {
  ok("SUPABASE_SERVICE_ROLE_KEY presente");
}

console.log("\n== Versão da API ==");
const sdkPadrao = new Stripe("sk_test_x").getApiField("version");
ok("SDK stripe " + Stripe.PACKAGE_VERSION + " → versão " + sdkPadrao);
if (sdkPadrao === VERSAO_API) {
  ok("VERSAO_API em lib/pagamento/stripe.js bate com o SDK");
} else {
  aviso(
    "VERSAO_API (" + VERSAO_API + ") difere do SDK (" + sdkPadrao + ") — " +
      "atualize a constante e teste antes de publicar"
  );
  problemas++;
}

if (!secret) {
  console.log("\nSem STRIPE_SECRET_KEY, não dá para checar conexão.\n");
  process.exit(problemas ? 1 : 0);
}

const stripe = new Stripe(secret, { apiVersion: VERSAO_API });

console.log("\n== Conexão ==");
try {
  await stripe.balance.retrieve();
  ok("autenticou no Stripe");
} catch (e) {
  falha("não autenticou: " + (e?.message || e));
  process.exit(1);
}

console.log("\n== Webhooks configurados ==");
try {
  const { data } = await stripe.webhookEndpoints.list({ limit: 10 });
  if (!data.length) {
    aviso("nenhum endpoint de webhook cadastrado no Stripe");
    problemas++;
  }
  for (const w of data) {
    console.log("  • " + w.url + "  [" + w.status + "]");
    const cobre = EVENTOS_TRATADOS.every(
      (ev) => w.enabled_events.includes(ev) || w.enabled_events.includes("*")
    );
    (cobre ? ok : aviso)(
      cobre
        ? "cobre todos os eventos que a loja trata"
        : "faltam eventos: " +
            EVENTOS_TRATADOS.filter(
              (ev) => !w.enabled_events.includes(ev) && !w.enabled_events.includes("*")
            ).join(", ")
    );
  }
} catch (e) {
  aviso("não listou webhooks: " + (e?.message || e));
}

console.log("\n== Últimos 5 eventos ==");
try {
  const { data } = await stripe.events.list({ limit: 5 });
  data.forEach((e) =>
    console.log(
      "  " + new Date(e.created * 1000).toLocaleString("pt-BR") + "  " + e.type
    )
  );
  if (!data.length) console.log("  (nenhum)");
} catch (e) {
  aviso("não listou eventos: " + (e?.message || e));
}

console.log("\n== Últimas 5 sessões de checkout ==");
try {
  const { data } = await stripe.checkout.sessions.list({ limit: 5 });
  data.forEach((s) =>
    console.log(
      "  " + (s.metadata?.codigo || s.client_reference_id || s.id) +
        "  " + s.payment_status + "  " + (s.amount_total / 100).toFixed(2) + " " + s.currency
    )
  );
  if (!data.length) console.log("  (nenhuma)");
} catch (e) {
  aviso("não listou sessões: " + (e?.message || e));
}

console.log(
  "\n" + (problemas ? "\x1b[33m" + problemas + " ponto(s) de atenção\x1b[0m" : "\x1b[32mtudo certo\x1b[0m") + "\n"
);
process.exit(problemas ? 1 : 0);
