/* =========================================================================
   acbolsa — volta dos links de autenticação
   =========================================================================

   Um handler para tudo que "volta com sessão":
     - OAuth (Google): chega com `?code=`  → exchangeCodeForSession
     - Link de e-mail (template padrão do Supabase, {{ .ConfirmationURL }}):
       o endpoint /auth/v1/verify verifica o token e redireciona pra cá com
       `?code=`  → mesmo caminho
     - Link de e-mail com template customizado (`token_hash` + `type`):
       verifyOtp direto

   `next` diz pra onde seguir depois (padrão /conta; recuperação manda
   /redefinir-senha). Assim NÃO é obrigatório editar os templates no painel.
   ========================================================================= */

import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const erro = searchParams.get("error") || searchParams.get("error_description");
  const next = searchParams.get("next") || "/conta";
  const destino = next.startsWith("/") ? next : "/conta";

  if (!erro) {
    const supabase = await criarClienteServidor();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(destino, origin));
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) return NextResponse.redirect(new URL(destino, origin));
    }
  }

  return NextResponse.redirect(new URL("/entrar?erro=link-invalido", origin));
}
