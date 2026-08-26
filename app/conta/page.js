/* =========================================================================
   acbolsa — minha conta
   ========================================================================= */

import Link from "next/link";
import ContaCliente from "./ContaCliente";

export const metadata = {
  title: "Minha conta",
  robots: { index: false, follow: true },
};

export default function PaginaConta() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <ol className="crumbs" role="list">
            <li>
              <Link href="/">Início</Link>
            </li>
            <li aria-current="page">Minha conta</li>
          </ol>
          <h1>Minha conta</h1>
        </div>
      </div>

      <div className="container">
        <ContaCliente />
      </div>
    </>
  );
}
