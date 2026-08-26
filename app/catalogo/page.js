/* =========================================================================
   acbolsa — catálogo
   =========================================================================

   A página em si é servidor: só resolve o título a partir dos parâmetros da
   URL, para que `generateMetadata` acerte o <title> de um link compartilhado
   ("Bolsas tote — acbolsa", não "Catálogo"). A interação inteira está em
   `CatalogoCliente`, atrás de um Suspense porque lê `useSearchParams`.
   ========================================================================= */

import { Suspense } from "react";
import CatalogoCliente from "./CatalogoCliente";
import { CATEGORIAS } from "@/lib/catalog";

const CATS_BOLSAS = Object.keys(CATEGORIAS).filter((k) => CATEGORIAS[k].pai === "bolsas");

/* Mesma regra de nomeação do cliente, aplicada aos parâmetros cruus da URL.
   Duplicado de propósito: o servidor não pode importar do módulo "use client"
   sem arrastar o componente inteiro para o bundle do servidor. */
function tituloDosParametros(searchParams) {
  const cat = searchParams.cat;
  const novidades = searchParams.filtro === "novidades";

  const cats =
    !cat || cat === "todos"
      ? []
      : cat === "bolsas"
        ? CATS_BOLSAS
        : String(cat).split(",").filter((c) => CATEGORIAS[c]);

  if (novidades && !cats.length) {
    return { nome: "Novidades", desc: "As últimas peças a entrar no catálogo." };
  }
  if (cats.length === 1) {
    const nome = CATEGORIAS[cats[0]].nome;
    return { nome, desc: "Peças em " + nome.toLowerCase() + ", com ficha técnica aberta." };
  }
  if (cats.length === CATS_BOLSAS.length && CATS_BOLSAS.every((c) => cats.includes(c))) {
    return { nome: "Bolsas", desc: "Toda a linha de bolsas, de mini a tote." };
  }
  return {
    nome: "Catálogo",
    desc: "Todas as bolsas e acessórios de couro da acbolsa. Filtre por formato, cor e faixa de preço.",
  };
}

export async function generateMetadata({ searchParams }) {
  const { nome, desc } = tituloDosParametros(await searchParams);
  return { title: nome, description: desc };
}

export default function PaginaCatalogo() {
  return (
    <Suspense fallback={<div className="section container" />}>
      <CatalogoCliente />
    </Suspense>
  );
}
