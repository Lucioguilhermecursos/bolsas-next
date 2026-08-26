"use client";

/* =========================================================================
   acbolsa — "já hidratou?"
   =========================================================================

   Devolve `false` no render do servidor e no primeiro render do cliente;
   `true` depois de hidratar.

   Serve para o que só existe no navegador — localStorage, `location.hash` —
   sem quebrar a hidratação: o primeiro render precisa produzir exatamente o
   mesmo HTML dos dois lados, e só depois passar a mostrar o valor real.

   É `useSyncExternalStore` em vez de um `useState` + `useEffect` porque a
   pergunta é exatamente a que essa API responde, e ela não dispara o render
   em cascata que um setState dentro de efeito provoca.
   ========================================================================= */

import { useSyncExternalStore } from "react";

/* O valor nunca muda depois de hidratar, então não há nada a notificar. */
const semAssinatura = () => () => {};
const noCliente = () => true;
const noServidor = () => false;

export default function useHidratado() {
  return useSyncExternalStore(semAssinatura, noCliente, noServidor);
}
