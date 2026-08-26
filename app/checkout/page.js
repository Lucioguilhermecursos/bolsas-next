/* =========================================================================
   acbolsa — finalizar compra
   ========================================================================= */

import CheckoutCliente from "./CheckoutCliente";

export const metadata = {
  title: "Finalizar compra",
  /* Página de dados pessoais: fora do índice de busca. */
  robots: { index: false, follow: false },
};

export default function PaginaCheckout() {
  return (
    <div className="container">
      <CheckoutCliente />
    </div>
  );
}
