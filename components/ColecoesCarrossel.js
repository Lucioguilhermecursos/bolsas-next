"use client";

/* =========================================================================
   acbolsa — carrossel "Por cores"
   =========================================================================

   Faixa horizontal com scroll-snap. As setas rolam um cartão por clique;
   arrastar e as setas do teclado (com a faixa focada) também funcionam.
   As duas setas ficam sempre visíveis: no começo, a da esquerda pula para o
   fim; no fim, a da direita volta para o começo. O cartão em si é um link
   para a cor.
   ========================================================================= */

import { useRef } from "react";
import Link from "next/link";
import { Placeholder } from "@/components/Placeholder";
import { IconeSeta } from "@/components/Icones";

export default function ColecoesCarrossel({ colecoes }) {
  const faixaRef = useRef(null);

  function rolar(direcao) {
    const f = faixaRef.current;
    if (!f) return;
    const cartao = f.querySelector(".collection");
    const gap = parseFloat(getComputedStyle(f).columnGap || getComputedStyle(f).gap || "16");
    const passo = cartao ? cartao.offsetWidth + gap : f.clientWidth * 0.8;
    const noFim = f.scrollLeft + f.clientWidth >= f.scrollWidth - 4;
    const noInicio = f.scrollLeft <= 4;
    if (direcao > 0 && noFim) {
      f.scrollTo({ left: 0, behavior: "smooth" });
    } else if (direcao < 0 && noInicio) {
      f.scrollTo({ left: f.scrollWidth, behavior: "smooth" });
    } else {
      f.scrollBy({ left: direcao * passo, behavior: "smooth" });
    }
  }

  return (
    <div className="carrossel" role="region" aria-label="Coleções por cor" aria-roledescription="carrossel">
      <div className="carrossel-faixa" ref={faixaRef}>
        {colecoes.map((c) => (
          <Link key={c.nome} className="collection" href={c.destino}>
            {c.foto ? (
              <div className="ph ph--colecao">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.foto}
                  alt={"Tabby Shoulder Bag na cor " + c.nome}
                  loading="lazy"
                  decoding="async"
                />
                {c.fotoHover && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    className="foto-hover"
                    src={c.fotoHover}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
            ) : (
              <Placeholder proporcao="colecao" rotulo={"Foto da coleção " + c.nome} />
            )}
            <div className="collection-body">
              <h3>
                <span
                  className="swatch swatch--filtro"
                  style={{ background: c.hex }}
                  aria-hidden="true"
                />
                {c.nome}
              </h3>
              <IconeSeta />
            </div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="carrossel-nav carrossel-nav--antes"
        onClick={() => rolar(-1)}
        aria-label="Cor anterior"
      >
        <IconeSeta />
      </button>
      <button
        type="button"
        className="carrossel-nav carrossel-nav--depois"
        onClick={() => rolar(1)}
        aria-label="Próxima cor"
      >
        <IconeSeta />
      </button>
    </div>
  );
}
