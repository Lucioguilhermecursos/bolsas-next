"use client";

/* =========================================================================
   acbolsa — carrossel "Por cores"
   =========================================================================

   Faixa horizontal com scroll-snap. As setas rolam um cartão por clique;
   arrastar e as setas do teclado (com a faixa focada) também funcionam.
   O cartão em si é um link para a cor.
   ========================================================================= */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Placeholder } from "@/components/Placeholder";
import { IconeSeta } from "@/components/Icones";

export default function ColecoesCarrossel({ colecoes }) {
  const faixaRef = useRef(null);
  const [temAntes, setTemAntes] = useState(false);
  const [temDepois, setTemDepois] = useState(true);

  const medir = useCallback(() => {
    const f = faixaRef.current;
    if (!f) return;
    setTemAntes(f.scrollLeft > 4);
    setTemDepois(f.scrollLeft + f.clientWidth < f.scrollWidth - 4);
  }, []);

  useEffect(() => {
    medir();
    const f = faixaRef.current;
    if (!f) return;
    f.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      f.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [medir]);

  function rolar(direcao) {
    const f = faixaRef.current;
    if (!f) return;
    const cartao = f.querySelector(".collection");
    const gap = parseFloat(getComputedStyle(f).columnGap || getComputedStyle(f).gap || "16");
    const passo = cartao ? cartao.offsetWidth + gap : f.clientWidth * 0.8;
    f.scrollBy({ left: direcao * passo, behavior: "smooth" });
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
        disabled={!temAntes}
        aria-label="Cor anterior"
      >
        <IconeSeta />
      </button>
      <button
        type="button"
        className="carrossel-nav carrossel-nav--depois"
        onClick={() => rolar(1)}
        disabled={!temDepois}
        aria-label="Próxima cor"
      >
        <IconeSeta />
      </button>
    </div>
  );
}
