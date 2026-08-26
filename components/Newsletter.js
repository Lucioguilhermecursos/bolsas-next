"use client";

/* =========================================================================
   acbolsa — inscrição na lista
   =========================================================================

   Sem servidor não há lista de verdade: o e-mail fica no localStorage e a
   confirmação diz só o que aconteceu. Quando houver backend, é aqui que o
   fetch entra — a validação e as mensagens já estão prontas.
   ========================================================================= */

import { useId, useState } from "react";
import { useToast } from "./ToastContexto";

/* Aceita o que um endereço precisa ter para ser postável: algo, arroba,
   domínio com ponto e ao menos dois caracteres finais. Validação mais
   estrita que isto rejeita endereços legítimos. */
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Newsletter() {
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState("");
  const mostrarToast = useToast();
  const idCampo = useId();
  const idErro = useId();

  function aoEnviar(e) {
    e.preventDefault();
    const email = valor.trim();

    if (!email) {
      setErro("Digite seu e-mail para receber os avisos.");
      return;
    }
    if (!FORMATO_EMAIL.test(email)) {
      setErro("Esse e-mail parece incompleto. Confira se falta o @ ou o final do domínio.");
      return;
    }

    setErro("");
    try {
      window.localStorage.setItem("acbolsa:newsletter", email);
    } catch {
      /* Armazenamento indisponível: a confirmação vale para esta sessão. */
    }
    setValor("");
    mostrarToast("Pronto. Avisamos você quando houver novidade.");
  }

  return (
    <form className="newsletter-form" onSubmit={aoEnviar} noValidate>
      <label className="sr-only" htmlFor={idCampo}>
        Seu e-mail
      </label>
      <input
        className="input"
        id={idCampo}
        type="email"
        name="email"
        placeholder="seu@email.com"
        autoComplete="email"
        value={valor}
        aria-invalid={erro ? "true" : undefined}
        aria-describedby={erro ? idErro : undefined}
        onChange={(e) => {
          setValor(e.target.value);
          if (erro) setErro("");
        }}
        required
      />
      <button className="btn btn-primary" type="submit">
        Assinar
      </button>
      {/* O erro fica fora da linha do campo (flex-basis 100%) para não
          espremer o input em tela estreita. */}
      <p className="field-error newsletter-erro" id={idErro} role="alert">
        {erro}
      </p>
    </form>
  );
}
