/* =========================================================================
   acbolsa — sacola
   ========================================================================= */

import Link from "next/link";
import CarrinhoCliente from "./CarrinhoCliente";

export const metadata = {
  title: "Sacola",
  description: "Sua sacola de compras na acbolsa.",
};

export default function PaginaCarrinho() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <ol className="crumbs" role="list">
            <li>
              <Link href="/">Início</Link>
            </li>
            <li aria-current="page">Sacola</li>
          </ol>
          <h1>Sua sacola</h1>
        </div>
      </div>

      <div className="container">
        <CarrinhoCliente />
      </div>
    </>
  );
}
