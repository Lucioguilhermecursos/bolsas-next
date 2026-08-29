/* =========================================================================
   acbolsa — /auth/confirmar
   =========================================================================

   Alias de /auth/callback. Existe para o caso de os templates de e-mail do
   Supabase serem customizados para apontar aqui (`token_hash` + `type`). O
   handler é o mesmo — trata `code` e `token_hash`.
   ========================================================================= */

export { GET } from "../callback/route";
