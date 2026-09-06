"use client";

/* =========================================================================
   acbolsa — mídia do cartão em modo slideshow
   =========================================================================

   Usado só na faixa "Chegou agora" da home. As fotos da bolsa (sem modelo)
   trocam sozinhas a cada 6 s, com cross-fade; as bolinhas embaixo deixam a
   cliente voltar ou pular para uma foto. Fora dessa faixa, o cartão segue
   com imagem única (MidiaProduto).

   As fotos ficam empilhadas dentro de `.ph` (só muda a opacidade) para o
   cross-fade não piscar. As bolinhas ficam FORA de `.ph`: `.ph` isola o
   próprio contexto de empilhamento e a camada de clique do cartão
   (`a::after`) cobre tudo lá dentro. Como irmãs de `.card-media`, com
   z-index acima dessa camada, elas voltam a receber clique.
   ========================================================================= */

import { useCallback, useEffect, useRef, useState } from "react";

const INTERVALO = 6000;
const MAX_FOTOS = 6;

/* Até MAX_FOTOS itens igualmente espaçados (com o primeiro e o último). Uma
   cor com 11 fotos de estúdio não vira uma régua de 11 bolinhas. */
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
  const fotos = amostrar(produto?.fotosProduto ?? produto?.fotos ?? []);
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
          {fotos.map((f, n) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={f}
              className="slideshow-img"
              src={f}
              alt={n === 0 ? produto.nome + " — " + produto.cor : ""}
              data-ativa={n === i || undefined}
              loading={eager && n === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
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
