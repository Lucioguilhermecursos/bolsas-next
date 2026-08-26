"use client";

/* =========================================================================
   acbolsa — galeria da peça
   =========================================================================

   Só entra em cena quando `fotos` está preenchido no catálogo. Enquanto não
   houver fotografia própria, a página mostra um único placeholder — sem
   inventar quatro ângulos que não existem.
   ========================================================================= */

import { useState } from "react";

export default function Galeria({ produto }) {
  const [atual, setAtual] = useState(0);

  return (
    <div className="gallery">
      <div className="gallery-thumbs" role="tablist" aria-label="Fotos da peça">
        {produto.fotos.map((foto, i) => (
          <button
            key={foto}
            type="button"
            role="tab"
            aria-current={i === atual ? "true" : undefined}
            aria-selected={i === atual}
            aria-label={"Foto " + (i + 1) + " de " + produto.fotos.length}
            onClick={() => setAtual(i)}
          >
            <div className="ph ph--portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt="" loading="lazy" />
            </div>
          </button>
        ))}
      </div>

      <div className="gallery-main">
        <div className="ph ph--portrait">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={produto.fotos[atual]} alt={produto.nome} width="1200" height="1500" />
        </div>
      </div>
    </div>
  );
}
