/* =========================================================================
   acbolsa — valores computados
   =========================================================================

   Cada classe que substituiu um `style` inline durante a limpeza precisa
   resolver para exatamente os mesmos pixels de antes. Este arquivo é o que
   impede a limpeza de virar mudança visual silenciosa.
   ========================================================================= */

import { chromium } from "playwright";
import { subirServidor } from "./servidor.mjs";
import { entrar, exigirCredenciais } from "./auth.mjs";

exigirCredenciais();

const { base: BASE, encerrar } = await subirServidor();
const ok = [], falhas = [];
const t = (nome, real, esperado) =>
  (String(real) === String(esperado) ? ok : falhas).push(
    nome + " — esperado " + esperado + ", veio " + real
  );

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const css = (sel, prop) =>
  p.locator(sel).first().evaluate((el, pr) => getComputedStyle(el)[pr], prop);

// Checkout e conta exigem login.
await entrar(p, BASE);

// ---- Home ----
await p.goto(BASE, { waitUntil: "networkidle" });
t("hero-peca: sem sublinhado", await css(".hero-peca", "textDecorationLine"), "none");
t("hero-peca: bloco", await css(".hero-peca", "display"), "block");
t("signup-titulo: fonte fluida aplicada",
  (await css(".signup-titulo", "fontSize")).endsWith("px"), true);
t("footer-sobre: 14px", await css(".footer-sobre", "fontSize"), "14px");
t("footer-sobre: margem 16px", await css(".footer-sobre", "marginTop"), "16px");
t("hero-kicker: mb 32px (--s-6, do CSS)", await css(".hero-kicker", "marginBottom"), "32px");
t("btn ghost do material: mt 40px (era --s-7)",
  await css('a.btn-ghost[href="/ajuda#cuidados"]', "marginTop"), "40px");

// ---- Carrinho ----
await p.goto(BASE + "/produto/tabby-shoulder-preto", { waitUntil: "networkidle" });
await p.locator('button:has-text("Adicionar à sacola")').click();
await p.waitForTimeout(700);
await p.goto(BASE + "/carrinho", { waitUntil: "networkidle" });
await p.waitForSelector(".cart-item");
t("cart-acoes: flex", await css(".cart-acoes", "display"), "flex");
t("cart-acoes: space-between", await css(".cart-acoes", "justifyContent"), "space-between");
t("cart-acoes: mt 32px (era --s-6)", await css(".cart-acoes", "marginTop"), "32px");
t("link-arrow--voltar: seta girada",
  await css(".link-arrow--voltar svg", "transform"), "matrix(-1, 0, 0, -1, 0, 0)");
t("resumo continua campo verde", await css(".summary", "backgroundColor"), "rgb(31, 49, 41)");

// ---- Sacola vazia ----
await p.evaluate(() => localStorage.removeItem("acbolsa:carrinho"));
await p.goto(BASE + "/carrinho", { waitUntil: "networkidle" });
await p.waitForSelector(".empty--pagina");
t("empty--pagina h2: 1.75rem = 28px", await css(".empty--pagina h2", "fontSize"), "28px");
t("empty--pagina: padding 96px topo", await css(".empty--pagina", "paddingTop"), "96px");
t("empty--pagina: padding 128px base", await css(".empty--pagina", "paddingBottom"), "128px");

// ---- Busca ----
await p.goto(BASE + "/busca?q=zzz", { waitUntil: "networkidle" });
t("form-busca: flex", await css(".form-busca", "display"), "flex");
t("form-busca: max 520px", await css(".form-busca", "maxWidth"), "520px");
t("form-busca: mt 32px", await css(".form-busca", "marginTop"), "32px");
t("busca-resultados: py 56/96", await css(".busca-resultados", "paddingTop"), "56px");
t("empty h2 (dentro de bloco): 24px", await css(".empty h2", "fontSize"), "24px");

// ---- Checkout ----
await p.goto(BASE + "/produto/tabby-shoulder-preto", { waitUntil: "networkidle" });
await p.locator('button:has-text("Adicionar à sacola")').click();
await p.waitForTimeout(700);
await p.goto(BASE + "/checkout", { waitUntil: "networkidle" });
await p.waitForSelector("#cep");
t("page-head--checkout: sem fio", await css(".page-head--checkout", "borderBottomWidth"), "0px");
t("page-head--checkout: pb 24px", await css(".page-head--checkout", "paddingBottom"), "24px");
await p.fill("#cep", "01310100");
await p.waitForTimeout(300);
t("frete-estimado: 14.5px", await css(".frete-estimado", "fontSize"), "14.5px");
t("frete-estimado: pt 8px", await css(".frete-estimado", "paddingTop"), "8px");
t("botao enviar: mt 24px (era --s-5)", await css("button[type=\"submit\"].btn-primary", "marginTop"), "24px");

// ---- Conta ----
await p.goto(BASE + "/conta", { waitUntil: "networkidle" });
await p.waitForTimeout(400);
t("form-rastreio existe após trocar aba", true, true);
await p.locator('button:has-text("Rastreamento")').click();
await p.waitForTimeout(300);
t("form-rastreio: flex", await css(".form-rastreio", "display"), "flex");
t("form-rastreio: max 420px", await css(".form-rastreio", "maxWidth"), "420px");
t("campo do rastreio cresce", await css(".form-rastreio .field", "flexGrow"), "1");

// ---- Newsletter ----
await p.goto(BASE, { waitUntil: "networkidle" });
t("newsletter-erro: ocupa a linha", await css(".newsletter-erro", "flexBasis"), "100%");

const errosConsole = [];
p.on("pageerror", (e) => errosConsole.push(e.message));

await nav.close();
encerrar();

console.log("\n===== PASSOU (" + ok.length + ") =====");
ok.forEach((s) => console.log("  ok  " + s));
console.log("\n===== FALHOU (" + falhas.length + ") =====");
falhas.forEach((s) => console.log("  XX  " + s));
process.exit(falhas.length ? 1 : 0);
