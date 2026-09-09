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

   A foto grande dá zoom no hover, com a origem seguindo o cursor. Um clique
   abre a foto em tela cheia, onde outro clique também aproxima/afasta.
   ========================================================================= */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconeFechar, IconeSeta } from "@/components/Icones";

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
  const [ampliada, setAmpliada] = useState(false);
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

  /* Zoom no hover: a origem do `scale` segue o cursor. Escreve as variáveis
     direto no elemento (sem re-render a cada pixel de movimento). */
  function aoMoverZoom(e) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--zoom-x", ((e.clientX - r.left) / r.width) * 100 + "%");
    el.style.setProperty("--zoom-y", ((e.clientY - r.top) / r.height) * 100 + "%");
  }

  return (
    <>
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
          <div className="ph ph--portrait gallery-zoom" onMouseMove={aoMoverZoom}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotos[atual]} alt={produto.nome} width="1200" height="1500" />
            <button
              type="button"
              className="gallery-abrir"
              onClick={() => setAmpliada(true)}
              aria-label="Ampliar foto em tela cheia"
            />
          </div>
        </div>
      </div>

      {ampliada && (
        <TelaCheia
          fotos={fotos}
          atual={atual}
          setAtual={setAtual}
          nome={produto.nome}
          aoFechar={() => setAmpliada(false)}
        />
      )}
    </>
  );
}

/* Foto em tela cheia. Um clique na foto aproxima/afasta (mesma origem pelo
   cursor do zoom no hover); Esc fecha; setas trocam a foto. */
function TelaCheia({ fotos, atual, setAtual, nome, aoFechar }) {
  const [zoom, setZoom] = useState(false);
  const fecharRef = useRef(null);

  const irPara = useCallback(
    (i) => {
      const n = fotos.length;
      setAtual(((i % n) + n) % n);
      setZoom(false);
    },
    [fotos.length, setAtual],
  );

  useEffect(() => {
    fecharRef.current?.focus();
    const raiz = document.documentElement;
    const overflowAnterior = raiz.style.overflow;
    raiz.style.overflow = "hidden";

    const aoTecla = (e) => {
      if (e.key === "Escape") aoFechar();
      else if (e.key === "ArrowRight") irPara(atual + 1);
      else if (e.key === "ArrowLeft") irPara(atual - 1);
    };
    window.addEventListener("keydown", aoTecla);

    return () => {
      raiz.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", aoTecla);
    };
  }, [atual, irPara, aoFechar]);

  function aoMoverZoom(e) {
    if (!zoom) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--zoom-x", ((e.clientX - r.left) / r.width) * 100 + "%");
    el.style.setProperty("--zoom-y", ((e.clientY - r.top) / r.height) * 100 + "%");
  }

  const varias = fotos.length > 1;

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={nome + " — foto em tela cheia"}
    >
      <button
        type="button"
        className="lightbox-fechar"
        onClick={aoFechar}
        aria-label="Fechar"
        ref={fecharRef}
      >
        <IconeFechar />
      </button>

      <div
        className="lightbox-palco"
        onClick={(e) => {
          if (e.target === e.currentTarget) aoFechar();
        }}
      >
        {varias && (
          <button
            type="button"
            className="lightbox-nav lightbox-nav--antes"
            onClick={() => irPara(atual - 1)}
            aria-label="Foto anterior"
          >
            <IconeSeta />
          </button>
        )}

        <button
          type="button"
          className={"lightbox-img" + (zoom ? " is-zoom" : "")}
          onMouseMove={aoMoverZoom}
          onClick={() => setZoom((z) => !z)}
          aria-label={zoom ? "Afastar" : "Aproximar"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotos[atual]} alt={nome} />
        </button>

        {varias && (
          <button
            type="button"
            className="lightbox-nav lightbox-nav--depois"
            onClick={() => irPara(atual + 1)}
            aria-label="Próxima foto"
          >
            <IconeSeta />
          </button>
        )}
      </div>

      {varias && (
        <p className="lightbox-contador">
          {atual + 1} / {fotos.length}
        </p>
      )}
    </div>,
    document.body,
  );
}
