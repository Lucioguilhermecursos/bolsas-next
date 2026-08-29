/* =========================================================================
   acbolsa — cliente Supabase com service role
   =========================================================================

   Ignora RLS. Usar SÓ em contexto sem usuário logado onde isso é necessário
   — hoje só o webhook do Stripe, que precisa marcar o pedido como pago.
   NUNCA importar isto em Client Component: a chave é secreta.
   ========================================================================= */

import { createClient } from "@supabase/supabase-js";

export function criarClienteAdmin() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error("SUPABASE_SERVICE_ROLE_KEY não definida.");

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, chave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
