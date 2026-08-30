"use client";

/* =========================================================================
   acbolsa — formulário de criação de conta
   =========================================================================

   Confirmação de e-mail está ligada: o sucesso não loga a pessoa, mostra a
   tela "confirme seu e-mail" com opção de reenviar.
   ========================================================================= */

import { useActionState } from "react";
import Link from "next/link";
import { criarConta, reenviarConfirmacao } from "@/app/auth/acoes";
import BotaoGoogle from "@/components/BotaoGoogle";
import { IconeCheck } from "@/components/Icones";

const temGoogle = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export default function CriarContaCliente() {
  const [estado, acao, pendente] = useActionState(criarConta, {});

  if (estado?.etapa === "confirmar") {
    return <ConfirmeEmail email={estado.email} />;
  }

  return (
    <div className="auth-form">
      {temGoogle && (
        <>
          <BotaoGoogle />
          <div className="auth-sep" aria-hidden="true">
            <span>ou</span>
          </div>
        </>
      )}

      <form action={acao} noValidate>
      <div className="field">
        <label className="field-label" htmlFor="nome">
          Nome completo
        </label>
        <input
          className="input"
          id="nome"
          name="nome"
          type="text"
          autoComplete="name"
          required
        />
      </div>

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
          Repita a senha
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
        {pendente ? "Criando…" : "Criar conta"}
      </button>
      </form>

      <p className="auth-alt">
        Já tem conta?{" "}
        <Link className="link-underline" href="/entrar">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function ConfirmeEmail({ email }) {
  const [estado, acao, pendente] = useActionState(reenviarConfirmacao, {});

  return (
    <div className="confirm">
      <div className="confirm-mark">
        <IconeCheck />
      </div>
      <h2>Confirme seu e-mail</h2>
      <p className="lead mx-auto mt-4">
        Enviamos um link para <strong>{email}</strong>. Abra a mensagem e clique
        no link para ativar a conta — depois é só entrar.
      </p>

      <form action={acao} className="mt-8">
        <input type="hidden" name="email" value={email} />
        {estado?.reenviado ? (
          <p className="field-hint">Link reenviado. Confira também a caixa de spam.</p>
        ) : (
          <button className="btn btn-ghost" type="submit" disabled={pendente}>
            {pendente ? "Reenviando…" : "Reenviar o link"}
          </button>
        )}
      </form>
    </div>
  );
}
