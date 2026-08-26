"use client";

/* =========================================================================
   acbolsa — revelação no scroll
   =========================================================================

   O conteúdo é visível por padrão; a revelação só refina. Se o
   IntersectionObserver não existir, ou se a pessoa pediu menos movimento,
   tudo entra já visível — nada de conteúdo preso invisível por um recurso
   que não carregou.

   É um componente sem marcação própria (devolve `null`) em vez de um
   invólucro: envolver as grades num <div> extra quebraria o
   `grid-template-columns` de quem está por fora.
   ========================================================================= */

import { useEffect } from "react";

export default function Revelar() {
  useEffect(() => {
    const elementos = document.querySelectorAll(".reveal:not(.is-in)");
    if (!elementos.length) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      elementos.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("is-in");
            observador.unobserve(entrada.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    elementos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, []);

  return null;
}
