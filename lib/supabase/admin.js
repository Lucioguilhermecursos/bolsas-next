/* =========================================================================
   acbolsa — cliente Supabase com service role
   =========================================================================

   Ignora RLS. Usar só quando é preciso ver/mudar dados além do que a RLS
   deixaria — o webhook do Stripe (marcar pedido como pago, sem usuário
   logado) e o painel do vendedor (ver pedidos de todo mundo, não só os
   próprios; a checagem de quem entra é lib/auth/admin.exigirAdmin).
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
