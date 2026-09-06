"use client";

/* =========================================================================
   acbolsa — galeria da peça
   =========================================================================

   Só entra em cena quando `fotos` está preenchido no catálogo. Enquanto não
   houver fotografia própria, a página mostra um único placeholder — sem
   inventar quatro ângulos que não existem.

   A coluna de miniaturas nunca passa da base da foto grande: um efeito mede
   a altura da foto principal e trava a `max-height` da tira; o excedente
   rola dentro dela.
   ========================================================================= */

import { useEffect, useRef, useState } from "react";

/* Todas as fotos da cor, reordenadas: as 6 primeiras da tira são 3 só da
   bolsa + 3 com modelo; o restante (demais fotos da bolsa, depois demais
   com modelo) vem em seguida e entra na rolagem. */
function fotosDaGaleria(produto) {
  const daBolsa = produto.fotosProduto ?? [];
  const comModelo = produto.fotosModelo ?? [];
  const ordenadas = [
    ...daBolsa.slice(0, 3),
    ...comModelo.slice(0, 3),
    ...daBolsa.slice(3),
    ...comModelo.slice(3),
  ];
  return ordenadas.length ? ordenadas : produto.fotos ?? [];
}

export default function Galeria({ produto }) {
  const fotos = fotosDaGaleria(produto);
  const [atual, setAtual] = useState(0);
  const mainRef = useRef(null);
  const thumbsRef = useRef(null);

  /* Trava a altura da tira de miniaturas na altura da foto grande e marca
     `data-rola` quando de fato sobra foto para rolar. Reage a resize e à
     carga da imagem principal (que muda a altura). */
  useEffect(() => {
    const main = mainRef.current;
    const thumbs = thumbsRef.current;
    if (!main || !thumbs) return;

    const desktop = window.matchMedia("(min-width: 700px)");

    const ajustar = () => {
      if (!desktop.matches) {
        thumbs.style.maxHeight = "";
        delete thumbs.dataset.rola;
        return;
      }
      const alturaFoto = main.getBoundingClientRect().height;
      thumbs.style.maxHeight = alturaFoto + "px";
      if (thumbs.scrollHeight - alturaFoto > 1) thumbs.dataset.rola = "";
      else delete thumbs.dataset.rola;
    };

    ajustar();

    const ro = new ResizeObserver(ajustar);
    ro.observe(main);
    ro.observe(thumbs);
    desktop.addEventListener("change", ajustar);
    const img = main.querySelector("img");
    img?.addEventListener("load", ajustar);

    return () => {
      ro.disconnect();
      desktop.removeEventListener("change", ajustar);
      img?.removeEventListener("load", ajustar);
    };
  }, [produto.id]);

  /* Ao trocar a foto pelo teclado, garante que a miniatura ativa fique
     visível dentro da tira rolável. */
  useEffect(() => {
    const btn = thumbsRef.current?.children[atual];
    btn?.scrollIntoView({ block: "nearest" });
  }, [atual]);

  return (
    <div className="gallery">
      <div
        className="gallery-thumbs"
        role="tablist"
        aria-label="Fotos da peça"
        ref={thumbsRef}
      >
        {fotos.map((foto, i) => (
          <button
            key={foto}
            type="button"
            role="tab"
            aria-current={i === atual ? "true" : undefined}
            aria-selected={i === atual}
            aria-label={"Foto " + (i + 1) + " de " + fotos.length}
            onClick={() => setAtual(i)}
          >
            <div className="ph ph--portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt="" loading="lazy" />
            </div>
          </button>
        ))}
      </div>

      <div className="gallery-main" ref={mainRef}>
        <div className="ph ph--portrait">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotos[atual]} alt={produto.nome} width="1200" height="1500" />
        </div>
      </div>
    </div>
  );
}
