"use client";

/* =========================================================================
   acbolsa — formulário de senha nova
   ========================================================================= */

import { useActionState } from "react";
import { redefinirSenha } from "@/app/auth/acoes";

export default function RedefinirSenhaCliente() {
  const [estado, acao, pendente] = useActionState(redefinirSenha, {});

  return (
    <form className="auth-form" action={acao} noValidate>
      <div className="field">
        <label className="field-label" htmlFor="senha">
          Nova senha
        </label>
        <input
          className="input"
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          required
          aria-describedby="d-senha"
        />
        <p className="field-hint" id="d-senha">
          Pelo menos 8 caracteres, com uma letra e um número.
        </p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="senha2">
          Repita a nova senha
        </label>
        <input
          className="input"
          id="senha2"
          name="senha2"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>

      {estado?.erro && (
        <p className="field-error" role="alert">
          {estado.erro}
        </p>
      )}

      <button className="btn btn-primary btn-block mt-4" type="submit" disabled={pendente}>
        {pendente ? "Salvando…" : "Salvar senha"}
      </button>
    </form>
  );
}
