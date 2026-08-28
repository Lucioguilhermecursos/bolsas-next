/* =========================================================================
   acbolsa — cliente Supabase para o navegador
   =========================================================================

   Usado em Client Components (formulários de login, SessaoContexto). Lê a
   sessão dos cookies que o servidor gravou e escuta mudanças de auth.
   ========================================================================= */

import { createBrowserClient } from "@supabase/ssr";

export function criarClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
