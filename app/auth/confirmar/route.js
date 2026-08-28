/* =========================================================================
   acbolsa — confirmação de e-mail e link de recuperação
   =========================================================================

   Para onde os e-mails do Supabase apontam. Troca o `token_hash` do link por
   uma sessão (verifyOtp) e redireciona:
     - type=email    → e-mail confirmado, cai logado em /conta
     - type=recovery → sessão temporária, segue para /redefinir-senha

   Os templates precisam ser ajustados no painel do Supabase para usar esta
   rota — ver README / plano.
   ========================================================================= */

import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") || "/conta";

  if (tokenHash && type) {
    const supabase = await criarClienteServidor();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/conta", origin));
    }
  }

  return NextResponse.redirect(new URL("/entrar?erro=link-invalido", origin));
}
