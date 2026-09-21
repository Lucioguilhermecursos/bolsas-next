/* =========================================================================
   acbolsa — acesso ao painel do vendedor
   =========================================================================

   Não existe um "papel" (role) gravado no banco de propósito: `profiles` é
   editável pelo próprio cliente (ver 0001_auth_pedidos.sql), então uma coluna
   de role ali seria uma porta para o cliente virar admin sozinho.

   O admin é decidido por e-mail, direto do ambiente (ADMIN_EMAILS). Só quem
   configura o servidor decide quem entra.
   ========================================================================= */

import { notFound, redirect } from "next/navigation";
import { obterUsuario } from "@/lib/auth/sessao";

function listaAdmins() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function ehAdmin(usuario) {
  if (!usuario?.email) return false;
  return listaAdmins().includes(usuario.email.toLowerCase());
}

/* Devolve o usuário se for admin. Sem sessão: manda pro login. Com sessão mas
   sem permissão: 404 — não entrega nem a existência da rota. */
export async function exigirAdmin() {
  const usuario = await obterUsuario();
  if (!usuario) redirect("/entrar?next=/painel");
  if (!ehAdmin(usuario)) notFound();
  return usuario;
}
