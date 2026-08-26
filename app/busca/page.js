/* =========================================================================
   acbolsa — busca
   ========================================================================= */

import { Suspense } from "react";
import BuscaCliente from "./BuscaCliente";

export async function generateMetadata({ searchParams }) {
  const { q } = await searchParams;
  const termo = (q || "").trim();
  return {
    title: termo ? '"' + termo + '"' : "Busca",
    /* Página de resultado não entra no índice: gera URL infinita e nenhuma
       delas é conteúdo próprio. */
    robots: { index: false, follow: true },
  };
}

export default function PaginaBusca() {
  return (
    <Suspense fallback={<div className="section container" />}>
      <BuscaCliente />
    </Suspense>
  );
}
