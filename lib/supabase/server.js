/* =========================================================================
   acbolsa — cliente Supabase para o servidor
   =========================================================================

   Server Components, Server Actions e Route Handlers. `cookies()` é assíncrono
   no Next 16. O `setAll` pode lançar quando chamado de um Server Component
   (não dá para escrever cookie ali) — nesse caso o proxy já renova a sessão,
   então engolir o erro é seguro.
   ========================================================================= */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function criarClienteServidor() {
  const armazenamento = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return armazenamento.getAll();
        },
        setAll(cookiesParaGravar) {
          try {
            cookiesParaGravar.forEach(({ name, value, options }) =>
              armazenamento.set(name, value, options)
            );
          } catch {
            /* Chamado de um Server Component: o proxy cuida da renovação. */
          }
        },
      },
    }
  );
}
