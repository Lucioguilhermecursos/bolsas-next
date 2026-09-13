"use client";

/* =========================================================================
   acbolsa — carrossel "Por cores"
   =========================================================================

   Loop infinito só de CSS: a lista de cores é renderizada duas vezes e a
   faixa desliza de 0% a -50% da própria largura (que é sempre o dobro de
   uma cópia) num @keyframes linear e infinito, definido em pages.css —
   como as duas cópias são idênticas, o instante em que a animação reinicia
   é invisível.

   Não há JS no movimento. JS só entra pra pausar a faixa enquanto o dedo
   toca ela no celular — no desktop o mouse já pausa sozinho via :hover no
   CSS, e :active não é confiável pra isso em todo navegador móvel.

   A segunda cópia é decorativa (só preenche o loop visualmente), então sai
   do tab e do leitor de tela via aria-hidden + tabIndex. Cada cartão é um
   link para a cor.
   ========================================================================= */

import { useState } from "react";
import Link from "next/link";
import { Placeholder } from "@/components/Placeholder";
import { IconeSeta } from "@/components/Icones";

// Ajuste aqui pra mudar a velocidade: segundos que um cartão leva pra
// atravessar a tela. A duração total da volta escala com a quantidade de
// cores, pra manter esse mesmo ritmo não importa o tamanho do catálogo.
const SEGUNDOS_POR_CARTAO = 3.2;

export default function ColecoesCarrossel({ colecoes }) {
  const [tocando, setTocando] = useState(false);

  const itens = colecoes.length ? [...colecoes, ...colecoes] : [];
  const duracao = colecoes.length * SEGUNDOS_POR_CARTAO;

  return (
    <div className="carrossel" role="region" aria-label="Coleções por cor" aria-roledescription="carrossel">
      <div
        className={"carrossel-faixa" + (tocando ? " carrossel-faixa--pausado" : "")}
        style={{ "--carrossel-duracao": duracao + "s" }}
        onTouchStart={() => setTocando(true)}
        onTouchEnd={() => setTocando(false)}
        onTouchCancel={() => setTocando(false)}
      >
        {itens.map((c, i) => {
          const decorativo = i >= colecoes.length;
          return (
            <Link
              key={c.nome + "-" + i}
              className="collection"
              href={c.destino}
              aria-hidden={decorativo || undefined}
              tabIndex={decorativo ? -1 : undefined}
            >
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
          );
        })}
      </div>
    </div>
  );
}
