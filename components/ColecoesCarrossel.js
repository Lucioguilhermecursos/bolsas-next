"use client";

/* =========================================================================
   acbolsa — carrossel "Por cores"
   =========================================================================

   Faixa horizontal com scroll-snap e rolagem infinita para os dois lados:
   a lista é renderizada em três cópias idênticas e o cliente navega sempre
   pela cópia do meio. Ao chegar perto de uma ponta, a faixa salta uma cópia
   inteira sem animação — como as cópias são iguais, o salto é invisível e
   dá para começar a rolar tanto para a esquerda quanto para a direita.

   As setas rolam um cartão por clique; arrastar e as setas do teclado (com
   a faixa focada) também funcionam. O cartão em si é um link para a cor.
   ========================================================================= */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Placeholder } from "@/components/Placeholder";
import { IconeSeta } from "@/components/Icones";

export default function ColecoesCarrossel({ colecoes }) {
  const faixaRef = useRef(null);
  const blocoRef = useRef(0); // largura de UMA cópia da lista, em px

  const itens = colecoes.length
    ? [...colecoes, ...colecoes, ...colecoes]
    : [];

  function passoCartao() {
    const f = faixaRef.current;
    if (!f) return 0;
    const cartao = f.querySelector(".collection");
    const gap = parseFloat(getComputedStyle(f).columnGap || getComputedStyle(f).gap || "16");
    return cartao ? cartao.offsetWidth + gap : f.clientWidth * 0.8;
  }

  function irParaMeio() {
    const f = faixaRef.current;
    if (!f || !colecoes.length) return;
    blocoRef.current = passoCartao() * colecoes.length;
    if (blocoRef.current) f.scrollLeft = blocoRef.current;
  }

  useEffect(() => {
    const f = faixaRef.current;
    if (!f || !colecoes.length) return;

    irParaMeio();
    // as fotos entram depois e podem mexer nas larguras: remede e recentra
    const t = setTimeout(irParaMeio, 250);

    function aoRolar() {
      const bloco = blocoRef.current;
      if (!bloco) return;
      if (f.scrollLeft < bloco * 0.5) f.scrollLeft += bloco;
      else if (f.scrollLeft >= bloco * 1.5) f.scrollLeft -= bloco;
    }

    f.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", irParaMeio);
    return () => {
      clearTimeout(t);
      f.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", irParaMeio);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colecoes.length]);

  function rolar(direcao) {
    const f = faixaRef.current;
    if (!f) return;
    f.scrollBy({ left: direcao * passoCartao(), behavior: "smooth" });
  }

  return (
    <div className="carrossel" role="region" aria-label="Coleções por cor" aria-roledescription="carrossel">
      <div className="carrossel-faixa" ref={faixaRef}>
        {itens.map((c, i) => (
          <Link key={c.nome + "-" + i} className="collection" href={c.destino}>
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
