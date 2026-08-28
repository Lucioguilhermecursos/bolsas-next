/* =========================================================================
   acbolsa — entrar
   ========================================================================= */

import { Suspense } from "react";
import Link from "next/link";
import EntrarCliente from "./EntrarCliente";

export const metadata = {
  title: "Entrar",
  robots: { index: false, follow: true },
};

export default function PaginaEntrar() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <ol className="crumbs" role="list">
            <li>
              <Link href="/">Início</Link>
            </li>
            <li aria-current="page">Entrar</li>
          </ol>
          <h1>Entrar</h1>
        </div>
      </div>

      <div className="container">
        <Suspense fallback={<div className="auth-form" aria-hidden="true" />}>
          <EntrarCliente />
        </Suspense>
      </div>
    </>
  );
}
