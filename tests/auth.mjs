/* =========================================================================
   acbolsa — helpers de autenticação para os testes
   =========================================================================

   Os testes de checkout e conta precisam de uma sessão. Usam o usuário de
   teste (já confirmado) do projeto Supabase de teste, definido em .env.test.
   ========================================================================= */

export const TEST_EMAIL = process.env.TEST_USER_EMAIL;
export const TEST_SENHA = process.env.TEST_USER_PASSWORD;

export function exigirCredenciais() {
  if (!TEST_EMAIL || !TEST_SENHA || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error(
      "\n[testes] Rode com `npm test` (usa .env.test) ou exporte NEXT_PUBLIC_SUPABASE_URL,\n" +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY, TEST_USER_EMAIL e TEST_USER_PASSWORD.\n"
    );
    process.exit(1);
  }
}

/* Entra pela interface e espera cair numa rota logada. */
export async function entrar(page, base, { next = "/conta" } = {}) {
  await page.goto(base + "/entrar" + (next ? "?next=" + encodeURIComponent(next) : ""), {
    waitUntil: "networkidle",
  });
  await page.fill("#email", TEST_EMAIL);
  await page.fill("#senha", TEST_SENHA);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/entrar"), { timeout: 15000 }),
    page.locator('.auth-form button.btn-primary').click(),
  ]);
}

export async function sair(page, base) {
  await page.goto(base + "/conta", { waitUntil: "networkidle" });
  await Promise.all([
    page.waitForURL("**/entrar", { timeout: 15000 }),
    page.locator('.conta-head button:has-text("Sair")').click(),
  ]);
}
