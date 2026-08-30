"use client";

/* =========================================================================
   acbolsa — formulário de entrada
   =========================================================================

   `useSearchParams` para o `?next=` (para onde voltar depois de entrar) e o
   `?erro=` que o route handler de confirmação usa quando o link falha.
   ========================================================================= */

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { entrar } from "@/app/auth/acoes";
import BotaoGoogle from "@/components/BotaoGoogle";

const temGoogle = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

const MENSAGENS_ERRO = {
  "link-invalido": "Esse link expirou ou já foi usado. Entre com e-mail e senha.",
  oauth: "Não deu para entrar com o Google. Tente de novo ou use e-mail e senha.",
};

export default function EntrarCliente() {
  const params = useSearchParams();
  const next = params.get("next") || "";
  const erroUrl = MENSAGENS_ERRO[params.get("erro")];

  const [estado, acao, pendente] = useActionState(entrar, {});
  const erro = estado?.erro || erroUrl;

  return (
    <div className="auth-form">
      {temGoogle && (
        <>
          <BotaoGoogle next={next} />
          <div className="auth-sep" aria-hidden="true">
            <span>ou</span>
          </div>
        </>
      )}

      <form action={acao} noValidate>
        <input type="hidden" name="next" value={next} />

        <div className="field">
          <label className="field-label" htmlFor="email">
            E-mail
          </label>
          <input
            className="input"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="senha">
            Senha
          </label>
          <input
            className="input"
            id="senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            required
          />
          <p className="field-hint">
            <Link className="link-underline" href="/recuperar-senha">
              Esqueci minha senha
            </Link>
          </p>
        </div>

        {erro && (
          <p className="field-error" role="alert">
            {erro}
          </p>
        )}

        <button className="btn btn-primary btn-block mt-4" type="submit" disabled={pendente}>
          {pendente ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="auth-alt">
        Não tem conta?{" "}
        <Link className="link-underline" href="/criar-conta">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
