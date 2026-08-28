/* =========================================================================
   acbolsa — recuperar senha
   ========================================================================= */

import Link from "next/link";
import RecuperarSenhaCliente from "./RecuperarSenhaCliente";

export const metadata = {
  title: "Recuperar senha",
  robots: { index: false, follow: true },
};

export default function PaginaRecuperarSenha() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <ol className="crumbs" role="list">
            <li>
              <Link href="/entrar">Entrar</Link>
            </li>
            <li aria-current="page">Recuperar senha</li>
          </ol>
          <h1>Recuperar senha</h1>
        </div>
      </div>

      <div className="container">
        <RecuperarSenhaCliente />
      </div>
    </>
  );
}
