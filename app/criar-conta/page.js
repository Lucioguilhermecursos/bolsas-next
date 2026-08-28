/* =========================================================================
   acbolsa — criar conta
   ========================================================================= */

import Link from "next/link";
import CriarContaCliente from "./CriarContaCliente";

export const metadata = {
  title: "Criar conta",
  robots: { index: false, follow: true },
};

export default function PaginaCriarConta() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <ol className="crumbs" role="list">
            <li>
              <Link href="/">Início</Link>
            </li>
            <li aria-current="page">Criar conta</li>
          </ol>
          <h1>Criar conta</h1>
        </div>
      </div>

      <div className="container">
        <CriarContaCliente />
      </div>
    </>
  );
}
