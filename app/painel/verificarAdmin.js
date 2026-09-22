"use server";

/* =========================================================================
   acbolsa — "sou admin?" pro header (Client Component)
   =========================================================================

   O Header lê a sessão no navegador (SessaoContexto), de propósito — o
   layout fica estático, sem cookie lido no servidor. Mas ADMIN_EMAILS é uma
   env var sem NEXT_PUBLIC_, então não existe no bundle do cliente; a única
   forma seria descobrir a lista inteira inspecionando o JS, o que a gente
   não quer nem por um e-mail só. Esta Server Action é o intermediário: o
   Header chama, o servidor decide, só o "sim"/"não" volta.
   ========================================================================= */

import { obterUsuario } from "@/lib/auth/sessao";
import { ehAdmin } from "@/lib/auth/admin";

export async function souAdmin() {
  const usuario = await obterUsuario();
  return ehAdmin(usuario);
}
