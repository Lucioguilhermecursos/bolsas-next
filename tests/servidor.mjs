/* =========================================================================
   acbolsa — servidor de teste
   =========================================================================

   Sobe o build de produção numa porta própria, espera responder, devolve a
   base e garante que o processo morra no fim — inclusive se o teste quebrar
   no meio.

   Porta 3187 em vez de 3000: se alguém estiver com `npm run dev` aberto, os
   testes não brigam pela porta nem, pior, rodam contra o servidor de
   desenvolvimento sem ninguém perceber.
   ========================================================================= */

import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

export const PORTA = 3187;
export const BASE = "http://localhost:" + PORTA;

/* Chama o next.js diretamente com o Node em execução, em vez de passar por
   `npx` com `shell: true` — que dispara aviso de escape no Node 22+ e ainda
   deixaria um processo intermediário entre nós e o servidor, dificultando
   matá-lo no fim. */
const NEXT_BIN = path.resolve(
  import.meta.dirname,
  "../node_modules/next/dist/bin/next"
);

export async function subirServidor() {
  const proc = spawn(process.execPath, [NEXT_BIN, "start", "-p", String(PORTA)], {
    stdio: "ignore",
    cwd: path.resolve(import.meta.dirname, ".."),
    /* Fora do Windows, o próprio processo vira líder de um grupo — assim dá
       para derrubar os filhos junto, com `kill(-pid)`. */
    detached: process.platform !== "win32",
  });

  /* O `next start` FORKA processos de trabalho. Matar só o pai deixaria os
     filhos segurando a porta, e a próxima suíte subiria contra um servidor
     velho — ou nem subiria. Por isso a árvore inteira vai junto. */
  let encerrado = false;
  const encerrar = () => {
    if (encerrado || proc.exitCode !== null) return;
    encerrado = true;
    try {
      if (process.platform === "win32") {
        /* /T = árvore, /F = à força. É o único jeito confiável no Windows. */
        spawnSync("taskkill", ["/pid", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
      } else {
        process.kill(-proc.pid, "SIGTERM");
      }
    } catch {
      /* Já morreu sozinho. */
    }
  };

  /* Rede de segurança: se o teste lançar, o servidor não fica órfão. */
  process.on("exit", encerrar);
  process.on("SIGINT", () => {
    encerrar();
    process.exit(130);
  });
  process.on("uncaughtException", (e) => {
    encerrar();
    throw e;
  });

  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE + "/", { signal: AbortSignal.timeout(1000) });
      if (r.ok) return { base: BASE, encerrar };
    } catch {
      /* ainda subindo */
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  encerrar();
  throw new Error(
    "O servidor não respondeu em " + BASE + " após 30s. Rodou `npm run build` antes?"
  );
}

/* ---- Relatório ------------------------------------------------------------ */

export function criarRelatorio(titulo) {
  const ok = [];
  const falhas = [];

  return {
    /* `t(nome, condição)` ou `t(nome, real, esperado)`. */
    t(nome, a, b) {
      const passou = arguments.length >= 3 ? String(a) === String(b) : Boolean(a);
      const detalhe =
        arguments.length >= 3 && !passou ? " — esperado " + b + ", veio " + a : "";
      (passou ? ok : falhas).push(nome + detalhe);
      return passou;
    },
    anota(msg) {
      falhas.push(msg);
    },
    fechar() {
      console.log("\n" + titulo + ": " + ok.length + " ok, " + falhas.length + " falhas");
      if (falhas.length) {
        console.log("");
        falhas.forEach((f) => console.log("  FALHOU  " + f));
      }
      return falhas.length;
    },
  };
}
