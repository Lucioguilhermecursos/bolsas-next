"use client";

/* =========================================================================
   acbolsa — mídia do cartão em modo slideshow
   =========================================================================

   Usado só na faixa "Chegou agora" da home. As fotos da peça trocam sozinhas
   a cada 3 s; as bolinhas embaixo deixam a cliente voltar ou pular para uma
   foto. Fora dessa faixa, o cartão continua com imagem única (MidiaProduto).

   As bolinhas ficam FORA de `.ph` de propósito: `.ph` isola o próprio
   contexto de empilhamento e a camada de clique do cartão (`a::after`) cobre
   tudo que está dentro dele. Como irmãs de `.card-media`, com z-index acima
   dessa camada, elas voltam a receber clique.
   ========================================================================= */

import { useCallback, useEffect, useRef, useState } from "react";

const INTERVALO = 3000;
const MAX_FOTOS = 6;

/* Até MAX_FOTOS itens, igualmente espaçados, sempre com o primeiro (foto de
   vitrine) e o último (foto com modelo). Uma cor com 14 fotos não vira uma
   régua de 14 bolinhas. */
function amostrar(fotos) {
  if (fotos.length <= MAX_FOTOS) return fotos;
  const passo = (fotos.length - 1) / (MAX_FOTOS - 1);
  return Array.from({ length: MAX_FOTOS }, (_, k) => fotos[Math.round(k * passo)]);
}

function reduzMovimento() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function SlideshowProduto({ produto, selo, eager = false }) {
  const fotos = amostrar(produto?.fotos ?? []);
  const total = fotos.length;
  const [i, setI] = useState(0);
  const timer = useRef(null);

  const armar = useCallback(() => {
    clearInterval(timer.current);
    if (total < 2 || reduzMovimento()) return;
    timer.current = setInterval(() => setI((n) => (n + 1) % total), INTERVALO);
  }, [total]);

  useEffect(() => {
    armar();
    return () => clearInterval(timer.current);
  }, [armar]);

  function irPara(n) {
    setI(n);
    armar();
  }

  return (
    <>
      <div className="card-media">
        {selo}
        <div className="ph ph--portrait">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={fotos[i]}
            className="slideshow-img"
            src={fotos[i]}
            alt={produto.nome + " — " + produto.cor}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
      </div>

      {total > 1 && (
        <div className="card-dots" role="group" aria-label={"Fotos da peça " + produto.cor}>
          {fotos.map((f, n) => (
            <button
              key={f}
              type="button"
              className="card-dot"
              data-ativa={n === i || undefined}
              aria-label={"Ver foto " + (n + 1) + " de " + total}
              aria-current={n === i ? "true" : undefined}
              onClick={() => irPara(n)}
            />
          ))}
        </div>
      )}
    </>
  );
}
