/* =========================================================================
   acbolsa — renovação de sessão no proxy
   =========================================================================

   Roda antes de toda rota casada (ver proxy.js na raiz). Renova o token do
   Supabase e devolve os cookies atualizados no `response`, além do `user`
   para a checagem otimista de rota protegida.

   Regra do @supabase/ssr: não colocar lógica entre criar o client e chamar
   `getUser()`, e sempre devolver o `supabaseResponse` (com seus cookies) —
   senão a sessão do navegador e a do servidor saem de sincronia.
   ========================================================================= */

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function atualizarSessao(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesParaGravar) {
          cookiesParaGravar.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesParaGravar.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
