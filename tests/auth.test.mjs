/* =========================================================================
   acbolsa — autenticação
   =========================================================================

   Login, criação de conta (com confirmação de e-mail ligada), recuperação de
   senha e proteção de rota. Roda contra o projeto Supabase de teste.
   ========================================================================= */

import { chromium } from "playwright";
import { subirServidor } from "./servidor.mjs";
import { entrar, sair, exigirCredenciais, TEST_EMAIL } from "./auth.mjs";

exigirCredenciais();

const { base: BASE, encerrar } = await subirServidor();
const ok = [], falhas = [];
const t = (nome, cond, extra = "") =>
  (cond ? ok : falhas).push(nome + (extra ? " — " + extra : ""));

const navegador = await chromium.launch();

try {
  // ---------- 1. Rota protegida redireciona ----------
  {
    const ctx = await navegador.newContext();
    const p = await ctx.newPage();
    await p.goto(BASE + "/conta", { waitUntil: "networkidle" });
    t("deslogado: /conta manda para /entrar", p.url().includes("/entrar"), p.url());
    t("deslogado: preserva o destino em ?next", p.url().includes("next=%2Fconta"), p.url());

    await p.goto(BASE + "/checkout", { waitUntil: "networkidle" });
    t("deslogado: /checkout manda para /entrar", p.url().includes("/entrar"), p.url());
    await ctx.close();
  }

  // ---------- 2. Login: senha errada ----------
  {
    const ctx = await navegador.newContext();
    const p = await ctx.newPage();
    await p.goto(BASE + "/entrar", { waitUntil: "networkidle" });
    await p.fill("#email", TEST_EMAIL);
    await p.fill("#senha", "senha-errada-123");
    await p.locator('.auth-form button.btn-primary').click();
    await p.waitForSelector(".field-error", { timeout: 8000 });
    const erro = await p.locator(".field-error").innerText();
    t("login: senha errada mostra erro", /incorret/i.test(erro), erro);
    t("login: continua em /entrar", p.url().includes("/entrar"));
    await ctx.close();
  }

  // ---------- 3. Login: credenciais certas ----------
  {
    const ctx = await navegador.newContext();
    const p = await ctx.newPage();
    await entrar(p, BASE);
    t("login: entra e vai para /conta", p.url().includes("/conta"), p.url());
    t("conta: mostra o botão Sair", await p.locator('.conta-head button:has-text("Sair")').isVisible());

    await sair(p, BASE);
    t("logout: volta para /entrar", p.url().includes("/entrar"), p.url());

    await p.goto(BASE + "/conta", { waitUntil: "networkidle" });
    t("logout: /conta protege de novo", p.url().includes("/entrar"));
    await ctx.close();
  }

  // ---------- 4. Logado não vê telas de auth ----------
  {
    const ctx = await navegador.newContext();
    const p = await ctx.newPage();
    await entrar(p, BASE);
    await p.goto(BASE + "/entrar", { waitUntil: "networkidle" });
    t("logado: /entrar redireciona para /conta", p.url().includes("/conta"), p.url());
    await ctx.close();
  }

  // ---------- 5. Criar conta: validação e tela de confirmação ----------
  {
    const ctx = await navegador.newContext();
    const p = await ctx.newPage();
    await p.goto(BASE + "/criar-conta", { waitUntil: "networkidle" });

    // senha fraca
    await p.fill("#nome", "Fulana de Teste");
    await p.fill("#email", "quem@exemplo.com");
    await p.fill("#senha", "abc");
    await p.fill("#senha2", "abc");
    await p.locator('.auth-form button.btn-primary').click();
    await p.waitForSelector(".field-error", { timeout: 8000 });
    t(
      "criar conta: recusa senha fraca",
      /8|letra|número/i.test(await p.locator(".field-error").innerText())
    );

    // dados válidos, e-mail único de descarte
    const emailNovo = "teste+" + Date.now() + "@example.com";
    await p.fill("#senha", "senhaBoa123");
    await p.fill("#senha2", "senhaBoa123");
    await p.fill("#email", emailNovo);
    await p.locator('.auth-form button.btn-primary').click();
    await p.waitForSelector(".confirm", { timeout: 12000 });
    const corpo = await p.locator(".confirm").innerText();
    t("criar conta: cai na tela de confirmação de e-mail", /confirme seu e-mail/i.test(corpo), corpo.slice(0, 60));
    t("criar conta: mostra o e-mail informado", corpo.includes(emailNovo));
    await ctx.close();
  }

  // ---------- 6. Recuperação de senha: resposta neutra ----------
  {
    const ctx = await navegador.newContext();
    const p = await ctx.newPage();
    await p.goto(BASE + "/recuperar-senha", { waitUntil: "networkidle" });
    await p.fill("#email", "seja-la-quem-for@example.com");
    await p.locator('.auth-form button.btn-primary').click();
    await p.waitForSelector(".lead", { timeout: 8000 });
    t(
      "recuperar senha: resposta neutra",
      /se houver uma conta/i.test(await p.locator(".auth-form .lead, .auth-form").first().innerText())
    );
    await ctx.close();
  }
} finally {
  await navegador.close();
  encerrar();
}

console.log("\n===== PASSOU (" + ok.length + ") =====");
ok.forEach((s) => console.log("  ok  " + s));
console.log("\n===== FALHOU (" + falhas.length + ") =====");
falhas.forEach((s) => console.log("  XX  " + s));
process.exit(falhas.length ? 1 : 0);
