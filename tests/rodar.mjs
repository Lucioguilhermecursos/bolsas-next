/* =========================================================================
   acbolsa — runner da suíte
   =========================================================================

   `npm test` chama este arquivo. Ele:
     1. Lê .env.test (projeto Supabase SÓ de teste) e injeta em process.env
     2. Builda com essas chaves (as NEXT_PUBLIC_* são embutidas em build)
     3. Roda cada suíte em ordem, herdando o mesmo process.env

   Next.js não sobrescreve variável já presente em process.env, então o
   .env.local (produção) não vaza para o build de teste.

   Rodar uma suíte isolada? `node tests/fluxo.test.mjs` — mas aí exporte
   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, TEST_USER_EMAIL e
   TEST_USER_PASSWORD antes, e garanta que o build atual usou o projeto de teste.
   ========================================================================= */

import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");

/* ---- 1. .env.test ---- */
function carregarEnv(arquivo) {
  let texto;
  try {
    texto = readFileSync(path.join(raiz, arquivo), "utf8");
  } catch {
    return;
  }
  for (const linha of texto.split("\n")) {
    const limpa = linha.trim();
    if (!limpa || limpa.startsWith("#")) continue;
    const igual = limpa.indexOf("=");
    if (igual === -1) continue;
    const chave = limpa.slice(0, igual).trim();
    let valor = limpa.slice(igual + 1).trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    if (process.env[chave] === undefined) process.env[chave] = valor;
  }
}

carregarEnv(".env.test");

const OBRIGATORIAS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "TEST_USER_EMAIL",
  "TEST_USER_PASSWORD",
];
const faltando = OBRIGATORIAS.filter((k) => !process.env[k]);
if (faltando.length) {
  console.error(
    "\n[testes] Falta configurar: " +
      faltando.join(", ") +
      "\n\nCrie `.env.test` na raiz com um SEGUNDO projeto Supabase (só de teste) e\n" +
      "um usuário já confirmado. Modelo e passos em .env.test.\n"
  );
  process.exit(1);
}

/* ---- 2. build ---- */
console.log("[testes] next build (projeto Supabase de teste)…");
const build = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  cwd: raiz,
  stdio: "inherit",
  env: process.env,
});
if (build.status !== 0) process.exit(build.status || 1);

/* ---- 3. suítes ---- */
const SUITES = [
  "tests/paridade.test.mjs",
  "tests/auth.test.mjs",
  "tests/fluxo.test.mjs",
  "tests/estilos.test.mjs",
  "tests/contraste.test.mjs",
  "tests/estrutura.test.mjs",
];

let falhou = 0;
for (const suite of SUITES) {
  console.log("\n[testes] " + suite);
  const r = spawnSync(process.execPath, [suite], {
    cwd: raiz,
    stdio: "inherit",
    env: process.env,
  });
  if (r.status !== 0) falhou++;
}

if (falhou) {
  console.error("\n[testes] " + falhou + " suíte(s) falharam.");
  process.exit(1);
}
console.log("\n[testes] tudo verde.");
