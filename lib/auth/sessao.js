/* =========================================================================
   acbolsa — camada de acesso à sessão (DAL)
   =========================================================================

   Ponto único onde o servidor pergunta "quem é a pessoa desta requisição".
   `cache()` do React deduplica a chamada dentro de um mesmo render.

   `getUser()` (e não `getSession()`) porque ele revalida o token no Supabase
   — `getSession` confia no cookie, que o cliente pode forjar.

   Só-servidor por construção: `next/headers` lança se importado no cliente.
   ========================================================================= */

import { cache } from "react";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";

export const obterUsuario = cache(async () => {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function exigirUsuario(next) {
  const usuario = await obterUsuario();
  if (!usuario) {
    redirect(next ? "/entrar?next=" + encodeURIComponent(next) : "/entrar");
  }
  return usuario;
}
