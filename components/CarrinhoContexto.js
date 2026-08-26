"use client";

/* =========================================================================
   acbolsa — estado do carrinho
   =========================================================================

   ---- Por que useSyncExternalStore ------------------------------------------

   O carrinho mora no localStorage, que é um estado externo ao React e vive
   fora da árvore: o checkout escreve nele, outra aba pode mudá-lo, e ele não
   existe no servidor. `useSyncExternalStore` é a API feita exatamente para
   isso — assina a fonte, lê o valor atual e aceita um valor separado para o
   render do servidor.

   ---- Hidratação -------------------------------------------------------------

   `getServerSnapshot` devolve a lista vazia. Assim o HTML do servidor (sacola
   vazia) bate com o primeiro render do cliente, e o React só troca para o
   conteúdo real depois de hidratar — sem o erro de hidratação que apareceria
   se o primeiro render já lesse o armazenamento.

   `pronto` diz se essa primeira leitura já aconteceu. Quem mostra contagem ou
   lista de itens deve esperar por ele, senão pisca "sacola vazia" por um
   quadro em toda navegação.
   ========================================================================= */

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import * as Cesta from "@/lib/carrinho";
import { useToast } from "./ToastContexto";
import useHidratado from "./useHidratado";

const CarrinhoContexto = createContext(null);

/* ---- A loja ---------------------------------------------------------------
   Guarda a lista em memória e mantém o localStorage em dia. O cache do
   instantâneo é obrigatório: `getSnapshot` precisa devolver a MESMA
   referência enquanto nada mudou, ou o React entra em laço de render. */

const VAZIO = [];

let instantaneo = VAZIO;
let lido = false;
const assinantes = new Set();

function avisar() {
  assinantes.forEach((f) => f());
}

function assinar(f) {
  assinantes.add(f);

  /* Outra aba mexeu no carrinho. O evento `storage` só dispara em ABAS
     DIFERENTES, então não há risco de laço com a nossa própria gravação. */
  function aoMudarArmazenamento(evento) {
    if (evento.key === Cesta.CHAVE_CARRINHO) {
      instantaneo = Cesta.ler();
      avisar();
    }
  }

  window.addEventListener("storage", aoMudarArmazenamento);
  return () => {
    assinantes.delete(f);
    window.removeEventListener("storage", aoMudarArmazenamento);
  };
}

function obter() {
  if (!lido) {
    instantaneo = Cesta.ler();
    lido = true;
  }
  return instantaneo;
}

function obterNoServidor() {
  return VAZIO;
}

function definir(novos) {
  instantaneo = novos;
  lido = true;
  Cesta.gravar(novos);
  avisar();
}

export function ProvedorCarrinho({ children }) {
  const itens = useSyncExternalStore(assinar, obter, obterNoServidor);
  const mostrarToast = useToast();

  /* Antes de hidratar, `itens` é a lista vazia do servidor. `pronto` diz
     quando o valor exibido passa a ser o real. */
  const pronto = useHidratado();

  /* Aplica uma operação pura de lib/carrinho: grava, publica e avisa. */
  const aplicar = useCallback(
    (operacao) => {
      const { itens: novos, erro } = operacao(obter());
      if (erro) {
        mostrarToast(erro, "erro");
        return false;
      }
      definir(novos);
      return true;
    },
    [mostrarToast]
  );

  const adicionar = useCallback(
    (id, qtd = 1) => aplicar((atuais) => Cesta.adicionar(atuais, id, qtd)),
    [aplicar]
  );

  const definirQtd = useCallback(
    (id, qtd) => aplicar((atuais) => Cesta.definirQtd(atuais, id, qtd)),
    [aplicar]
  );

  const remover = useCallback(
    (id) => aplicar((atuais) => ({ itens: Cesta.remover(atuais, id), erro: null })),
    [aplicar]
  );

  const limpar = useCallback(() => aplicar(() => ({ itens: [], erro: null })), [aplicar]);

  const valor = useMemo(
    () => ({
      itens,
      pronto,
      detalhados: Cesta.detalhar(itens),
      totalItens: Cesta.totalItens(itens),
      subtotal: Cesta.subtotal(itens),
      adicionar,
      definirQtd,
      remover,
      limpar,
    }),
    [itens, pronto, adicionar, definirQtd, remover, limpar]
  );

  return <CarrinhoContexto.Provider value={valor}>{children}</CarrinhoContexto.Provider>;
}

export function useCarrinho() {
  const contexto = useContext(CarrinhoContexto);
  if (!contexto) {
    throw new Error("useCarrinho precisa estar dentro de <ProvedorCarrinho>.");
  }
  return contexto;
}
