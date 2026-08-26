/* =========================================================================
   acbolsa — endereço não encontrado
   =========================================================================

   Estado honesto, com saída: diz o que aconteceu e leva de volta ao
   catálogo, em vez de deixar a visitante num beco.
   ========================================================================= */

import Link from "next/link";
import { IconeCaixa } from "@/components/Icones";

export const metadata = {
  title: "Peça não encontrada",
};

export default function NaoEncontrado() {
  return (
    <div className="container">
      <div className="empty empty--pagina">
        <IconeCaixa />
        <h1>Não encontramos essa peça</h1>
        <p>Ela pode ter saído do catálogo ou o endereço veio incompleto.</p>
        <Link className="btn btn-primary" href="/catalogo">
          Ver o catálogo
        </Link>
      </div>
    </div>
  );
}
