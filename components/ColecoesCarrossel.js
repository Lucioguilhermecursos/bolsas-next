"use client";

/* =========================================================================
   acbolsa — carrossel "Por cores"
   =========================================================================

   Faixa horizontal com avanço automático contínuo (sem scroll-snap — ele
   brigava com os incrementos por quadro do autoplay) e rolagem infinita
   para os dois lados.

   A lista é renderizada em cinco cópias idênticas. O cliente navega perto
   da cópia do meio e, quando a rolagem manual PARA, a faixa se recoloca no
   bloco central sem animação — como as cópias são iguais, o salto é
   invisível. O próprio avanço automático se recoloca a cada quadro, sem
   depender desse "parar".

   A faixa avança sozinha, sem parar; arrastar e as setas do teclado (com
   a faixa focada) também funcionam. O cartão em si é um link para a cor.
   ========================================================================= */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Placeholder } from "@/components/Placeholder";
import { IconeSeta } from "@/components/Icones";

const COPIAS = 5;
const COPIA_CENTRO = 2;
const AUTOPLAY_SEGUNDOS_POR_CARTAO = 3.2;

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

  /* Avança sozinho, em movimento contínuo — nunca para e nunca dá aquele
     "pulo" de cartão em cartão. A velocidade é derivada do passo de um
     cartão para levar sempre o mesmo tempo (AUTOPLAY_SEGUNDOS_POR_CARTAO)
     cruzando cada um, e o próprio quadro já recoloca a faixa (subtraindo
     um bloco) assim que ela sai da cópia central — sem depender do evento
     de rolagem "parar", que nunca acontece aqui. Só fica de fora para quem
     pede menos animação no sistema, e some ao trocar de aba, pra não vir
     com um salto gigante de volta (o "dt" acumulado durante o tempo
     escondido) quando a aba volta a ficar visível. */
  useEffect(() => {
    const f = faixaRef.current;
    if (!f || !colecoes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let m = medidas();
    const remedir = () => {
      const novo = medidas();
      if (novo) m = novo;
    };
    const inicial = setTimeout(remedir, 250);
    window.addEventListener("resize", remedir);

    let ultimo = null;
    let quadro;
    const avancar = (agora) => {
      if (document.hidden) {
        ultimo = null;
      } else {
        if (ultimo !== null && m) {
          const dt = Math.min((agora - ultimo) / 1000, 0.25);
          const velocidade = m.passo / AUTOPLAY_SEGUNDOS_POR_CARTAO;
          let alvo = f.scrollLeft + velocidade * dt;
          if (alvo >= m.bloco * (COPIA_CENTRO + 1)) alvo -= m.bloco;
          f.scrollLeft = alvo;
        }
        ultimo = agora;
      }
      quadro = requestAnimationFrame(avancar);
    };
    quadro = requestAnimationFrame(avancar);

    return () => {
      cancelAnimationFrame(quadro);
      clearTimeout(inicial);
      window.removeEventListener("resize", remedir);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colecoes.length]);

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
    </div>
  );
}
