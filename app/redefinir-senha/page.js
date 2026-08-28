/* =========================================================================
   acbolsa — redefinir senha
   =========================================================================

   Só se chega aqui pelo link do e-mail de recuperação, que já cria a sessão.
   `exigirUsuario` barra quem tentar abrir direto.
   ========================================================================= */

import Link from "next/link";
import { redirect } from "next/navigation";
import { obterUsuario } from "@/lib/auth/sessao";
import RedefinirSenhaCliente from "./RedefinirSenhaCliente";

export const metadata = {
  title: "Redefinir senha",
  robots: { index: false, follow: false },
};

export default async function PaginaRedefinirSenha() {
  const usuario = await obterUsuario();
  if (!usuario) redirect("/recuperar-senha");

  return (
    <>
      <div className="page-head">
        <div className="container">
          <ol className="crumbs" role="list">
            <li>
              <Link href="/">Início</Link>
            </li>
            <li aria-current="page">Redefinir senha</li>
          </ol>
          <h1>Criar senha nova</h1>
        </div>
      </div>

      <div className="container">
        <RedefinirSenhaCliente />
      </div>
    </>
  );
}
