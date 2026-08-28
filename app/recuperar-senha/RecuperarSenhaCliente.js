"use client";

/* =========================================================================
   acbolsa — pedir link de recuperação de senha
   =========================================================================

   Resposta sempre neutra: nunca diz se existe conta com aquele e-mail.
   ========================================================================= */

import { useActionState } from "react";
import Link from "next/link";
import { pedirRecuperacao } from "@/app/auth/acoes";

export default function RecuperarSenhaCliente() {
  const [estado, acao, pendente] = useActionState(pedirRecuperacao, {});

  if (estado?.ok) {
    return (
      <div className="auth-form">
        <p className="lead">
          Se houver uma conta com esse e-mail, enviamos um link para redefinir a
          senha. O link vale por uma hora.
        </p>
        <p className="auth-alt">
          <Link className="link-underline" href="/entrar">
            Voltar para entrar
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form className="auth-form" action={acao} noValidate>
      <p className="lead mb-6">
        Informe o e-mail da conta. Enviamos um link para você criar uma senha nova.
      </p>

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

      <button className="btn btn-primary btn-block mt-4" type="submit" disabled={pendente}>
        {pendente ? "Enviando…" : "Enviar link"}
      </button>

      <p className="auth-alt">
        <Link className="link-underline" href="/entrar">
          Voltar para entrar
        </Link>
      </p>
    </form>
  );
}
