"use server";

/* =========================================================================
   acbolsa — ações de autenticação
   =========================================================================

   Server Actions do fluxo de conta. Rodam sempre no servidor, então é aqui
   que a senha é entregue ao Supabase — nunca no cliente.

   Cada ação recebe `(estadoAnterior, formData)` e devolve `{ erro }` ou
   `{ ok, ... }` para o `useActionState` da tela. Sucesso que muda de página
   chama `redirect()` (que "lança" — não tem retorno depois).
   ========================================================================= */

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { criarClienteServidor } from "@/lib/supabase/server";
import { emailValido, senhaValida } from "@/lib/formulario";

async function urlBase() {
  /* Em produção, fixar NEXT_PUBLIC_SITE_URL: os links de e-mail e o retorno do
     OAuth precisam bater com a URL registrada no Supabase, e um deploy de
     preview da Vercel tem host diferente a cada vez. Sem a env, cai no host da
     requisição (bom para dev local). */
  const fixa = process.env.NEXT_PUBLIC_SITE_URL;
  if (fixa) return fixa.replace(/\/$/, "");

  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("host");
  return `${proto}://${host}`;
}

function destinoSeguro(valor) {
  return valor && valor.startsWith("/") ? valor : "/conta";
}

/* Login social. `signInWithOAuth` no servidor só monta a URL do Google e grava
   o cookie PKCE; o `redirect` manda o navegador pra lá. A volta cai em
   /auth/callback, que troca o code por sessão. */
export async function entrarComGoogle(formData) {
  const next = destinoSeguro(String(formData.get("next") || ""));
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: (await urlBase()) + "/auth/callback?next=" + encodeURIComponent(next),
    },
  });

  if (error || !data?.url) {
    redirect("/entrar?erro=oauth");
  }
  redirect(data.url);
}

export async function entrar(estadoAnterior, formData) {
  const email = String(formData.get("email") || "").trim();
  const senha = String(formData.get("senha") || "");
  const next = String(formData.get("next") || "") || "/conta";

  if (!emailValido(email) || !senha) {
    return { erro: "Informe e-mail e senha." };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    return { erro: "E-mail ou senha incorretos." };
  }

  redirect(next.startsWith("/") ? next : "/conta");
}

export async function criarConta(estadoAnterior, formData) {
  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const senha = String(formData.get("senha") || "");
  const senha2 = String(formData.get("senha2") || "");

  if (nome.length < 3 || !nome.includes(" ")) {
    return { erro: "Escreva seu nome completo." };
  }
  if (!emailValido(email)) {
    return { erro: "Esse e-mail parece incompleto." };
  }
  if (!senhaValida(senha)) {
    return { erro: "A senha precisa de 8+ caracteres, com ao menos uma letra e um número." };
  }
  if (senha !== senha2) {
    return { erro: "As duas senhas não conferem." };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome },
      emailRedirectTo: (await urlBase()) + "/auth/callback?next=/conta",
    },
  });

  if (error) {
    /* Não vaza se o e-mail já existe — mensagem genérica. */
    return { erro: "Não foi possível criar a conta agora. Confira os dados e tente de novo." };
  }

  return { ok: true, etapa: "confirmar", email };
}

export async function reenviarConfirmacao(estadoAnterior, formData) {
  const email = String(formData.get("email") || "").trim();
  if (!emailValido(email)) return { erro: "E-mail inválido." };

  const supabase = await criarClienteServidor();
  await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: (await urlBase()) + "/auth/callback?next=/conta" },
  });
  return { ok: true, reenviado: true };
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/entrar");
}

export async function pedirRecuperacao(estadoAnterior, formData) {
  const email = String(formData.get("email") || "").trim();

  if (emailValido(email)) {
    const supabase = await criarClienteServidor();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: (await urlBase()) + "/auth/callback?next=/redefinir-senha",
    });
  }

  /* Resposta neutra: não revela se existe conta com esse e-mail. */
  return { ok: true };
}

export async function redefinirSenha(estadoAnterior, formData) {
  const senha = String(formData.get("senha") || "");
  const senha2 = String(formData.get("senha2") || "");

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { erro: "O link expirou. Peça um novo em “Esqueci minha senha”." };
  }
  if (!senhaValida(senha)) {
    return { erro: "A senha precisa de 8+ caracteres, com ao menos uma letra e um número." };
  }
  if (senha !== senha2) {
    return { erro: "As duas senhas não conferem." };
  }

  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) {
    return { erro: "Não foi possível trocar a senha. Tente de novo." };
  }

  redirect("/conta");
}
