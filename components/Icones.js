/* =========================================================================
   acbolsa — ícones
   =========================================================================

   Traço de 1.4, sem preenchimento, herdando currentColor. O tamanho vem do
   CSS de quem usa (`.icon-btn svg`, `.promise svg`…), não de atributo aqui —
   um ícone de 19px no header e de 22px na barra de garantias é o mesmo
   componente.
   ========================================================================= */

/* `aria-hidden` por padrão: o ícone acompanha um rótulo de texto ou um
   aria-label no botão. Quando for a única informação, passar `aria-hidden`
   como false e dar um <title> ao redor. */
function Svg({ children, viewBox = "0 0 24 24", ...props }) {
  return (
    <svg viewBox={viewBox} aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const IconeBusca = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const IconeSacola = (p) => (
  <Svg {...p}>
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9.5 8V6a2.5 2.5 0 0 1 5 0v2" />
  </Svg>
);

export const IconeConta = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
  </Svg>
);

export const IconeMenu = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconeFechar = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const IconeSeta = (p) => (
  <Svg fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconeChevron = (p) => (
  <Svg viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
    <path d="M1 1.5 6 6.5 11 1.5" />
  </Svg>
);

export const IconeCheck = (p) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const IconeAlerta = (p) => (
  <Svg {...p}>
    <path d="M12 8v5M12 16.5v.5" />
    <circle cx="12" cy="12" r="9" />
  </Svg>
);

export const IconeCaixa = (p) => (
  <Svg {...p}>
    <path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5v-7Z" />
    <path d="m3 8.5 9 4.5 9-4.5M12 13v7" />
  </Svg>
);

export const IconeCamera = (p) => (
  <Svg {...p}>
    <path d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z" />
    <circle cx="12" cy="13" r="3.5" />
  </Svg>
);

export const IconeCaminhao = (p) => (
  <Svg {...p}>
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17" cy="18" r="1.8" />
  </Svg>
);

export const IconeVolta = (p) => (
  <Svg {...p}>
    <path d="M9 5 4 10l5 5" />
    <path d="M4 10h10a6 6 0 0 1 0 12h-3" />
  </Svg>
);

export const IconeCostura = (p) => (
  <Svg {...p}>
    <path d="M3 12h3M9 12h3M15 12h3M21 12h0" />
    <path d="M4 7c4 4 12 6 16 0M4 17c4-4 12-6 16 0" />
  </Svg>
);

export const IconeAtendimento = (p) => (
  <Svg {...p}>
    <path d="M4 13a8 8 0 0 1 16 0" />
    <path d="M4 13v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2ZM20 13v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Z" />
  </Svg>
);
