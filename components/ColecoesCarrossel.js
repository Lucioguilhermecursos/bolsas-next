"use client";

/* =========================================================================
   acbolsa — carrossel "Por cores"
   =========================================================================

   Faixa horizontal com scroll-snap e rolagem infinita para os dois lados.

   A lista é renderizada em cinco cópias idênticas. O cliente navega perto
   da cópia do meio e, quando a rolagem PARA, a faixa se recoloca no bloco
   central sem animação — como as cópias são iguais, o salto é invisível.
   Recolocar só com a rolagem parada evita cortar a animação das setas, que
   era o que fazia a rolagem para a esquerda "travar".

   As setas rolam um cartão por clique; arrastar e as setas do teclado (com
   a faixa focada) também funcionam. O cartão em si é um link para a cor.
   ========================================================================= */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Placeholder } from "@/components/Placeholder";
import { IconeSeta } from "@/components/Icones";

const COPIAS = 5;
const COPIA_CENTRO = 2;

export default function ColecoesCarrossel({ colecoes }) {
  const faixaRef = useRef(null);

  const itens = colecoes.length
    ? Array.from({ length: COPIAS }, () => colecoes).flat()
    : [];

  /* Mede, direto do DOM, o passo de um cartão e a largura de uma cópia da
     lista — em pixels reais, sem depender de arredondamento de CSS, para o
     salto de recolocação cair exato num cartão equivalente. */
  function medidas() {
    const f = faixaRef.current;
    if (!f || !colecoes.length) return null;
    const cartoes = f.querySelectorAll(".collection");
    if (cartoes.length <= colecoes.length) return null;
    const base = cartoes[0].offsetLeft;
    const passo = cartoes[1].offsetLeft - base;
    const bloco = cartoes[colecoes.length].offsetLeft - base;
    return bloco > 0 ? { passo, bloco } : null;
  }

  function recentrar() {
    const f = faixaRef.current;
    const m = medidas();
    if (!f || !m) return;
    const dentro = ((f.scrollLeft % m.bloco) + m.bloco) % m.bloco;
    const alvo = dentro + m.bloco * COPIA_CENTRO;
    if (Math.abs(alvo - f.scrollLeft) > 1) f.scrollLeft = alvo;
  }

  useEffect(() => {
    const f = faixaRef.current;
    if (!f || !colecoes.length) return;

    recentrar();
    // as fotos entram depois: remede quando a página assenta
    const inicial = setTimeout(recentrar, 250);

    let parado;
    const aoRolar = () => {
      clearTimeout(parado);
      parado = setTimeout(recentrar, 120);
    };

    f.addEventListener("scroll", aoRolar, { passive: true });
    f.addEventListener("scrollend", recentrar);
    window.addEventListener("resize", recentrar);
    return () => {
      clearTimeout(inicial);
      clearTimeout(parado);
      f.removeEventListener("scroll", aoRolar);
      f.removeEventListener("scrollend", recentrar);
      window.removeEventListener("resize", recentrar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colecoes.length]);

  function rolar(direcao) {
    const f = faixaRef.current;
    if (!f) return;
    const m = medidas();
    f.scrollBy({ left: direcao * (m ? m.passo : f.clientWidth * 0.8), behavior: "smooth" });
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
