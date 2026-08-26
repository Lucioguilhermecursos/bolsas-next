"use client";

/* =========================================================================
   acbolsa — blocos expansíveis
   =========================================================================

   Vários podem ficar abertos ao mesmo tempo: quem está comparando cuidados
   e prazo de troca não quer que abrir um feche o outro.
   ========================================================================= */

import { useState } from "react";
import { IconeChevron } from "./Icones";

export function Acordeao({ children, ...props }) {
  return (
    <div className="accordion" {...props}>
      {children}
    </div>
  );
}

export function ItemAcordeao({ titulo, children, aberto: inicial = false }) {
  const [aberto, setAberto] = useState(inicial);

  return (
    <div className="accordion-item" data-open={aberto}>
      <button type="button" aria-expanded={aberto} onClick={() => setAberto((a) => !a)}>
        {titulo}
        <IconeChevron />
      </button>
      <div className="accordion-panel">{children}</div>
    </div>
  );
}
