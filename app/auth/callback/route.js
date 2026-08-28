/* =========================================================================
   acbolsa — volta do login social (OAuth)
   =========================================================================

   O Google redireciona para cá com `?code=`. Troca o code por uma sessão e
   segue para `next` (ou /conta). O link de e-mail usa outra rota
   (/auth/confirmar), porque volta com `token_hash`, não com `code`.
   ========================================================================= */

import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/conta";

  if (code && !searchParams.get("error")) {
    const supabase = await criarClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/conta", origin));
    }
  }

  return NextResponse.redirect(new URL("/entrar?erro=oauth", origin));
}
