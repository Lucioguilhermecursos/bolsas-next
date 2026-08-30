"use client";

/* =========================================================================
   acbolsa — "entrar com o Google" (nativo)
   =========================================================================

   Usa a biblioteca oficial do Google (Google Identity Services). O login
   acontece num popup do próprio Google que mostra o domínio DESTE site — não
   passa pelo <projeto>.supabase.co. O ID token volta pro cliente e a sessão é
   criada com `signInWithIdToken`.

   Só aparece se `NEXT_PUBLIC_GOOGLE_CLIENT_ID` estiver definida (o Client ID
   "...apps.googleusercontent.com" do OAuth client no Google Cloud). O domínio
   do site precisa estar em "Authorized JavaScript origins" desse client.
   ========================================================================= */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/client";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

async function hashNonce(raw) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function carregarGsi() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existente = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existente) {
      existente.addEventListener("load", () => resolve());
      existente.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function BotaoGoogle({ next = "/conta" }) {
  const alvo = useRef(null);
  const router = useRouter();
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!CLIENT_ID || !alvo.current) return;
    let cancelado = false;

    (async () => {
      try {
        await carregarGsi();
      } catch {
        return;
      }
      if (cancelado || !alvo.current) return;

      const supabase = criarClienteNavegador();
      const nonce = crypto.randomUUID();
      const nonceHash = await hashNonce(nonce);
      if (cancelado || !alvo.current) return;

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        nonce: nonceHash,
        callback: async (resposta) => {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: resposta.credential,
            nonce,
          });
          if (error) {
            setErro("Não deu para entrar com o Google. Tente de novo ou use e-mail e senha.");
            return;
          }
          const destino = next && next.startsWith("/") ? next : "/conta";
          router.push(destino);
          router.refresh();
        },
      });

      const largura = Math.min(360, Math.max(220, alvo.current.clientWidth || 300));
      window.google.accounts.id.renderButton(alvo.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: largura,
      });
    })();

    return () => {
      cancelado = true;
    };
  }, [next, router]);

  if (!CLIENT_ID) return null;

  return (
    <div className="auth-google">
      <div ref={alvo} />
      {erro && (
        <p className="field-error" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
