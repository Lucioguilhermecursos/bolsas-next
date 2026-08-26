/* =========================================================================
   acbolsa — carrinho
   =========================================================================

   Persistido em localStorage. Estrutura gravada: [{ id, qtd }] — só o id e a
   quantidade. O produto é resolvido pelo catálogo na leitura, de modo que
   mudança de preço ou de nome no catálogo aparece no carrinho de quem já
   tinha a peça guardada, e produto removido do catálogo simplesmente sai.

   Este arquivo é só a camada de armazenamento; o estado que a interface
   observa vive em `components/CarrinhoContexto.js`.
   ========================================================================= */

import { porId } from "./catalog";

export const CHAVE_CARRINHO = "acbolsa:carrinho";

/* Lê o que está gravado. Sempre devolve array — localStorage indisponível
   (modo privado), JSON corrompido ou formato antigo caem no vazio. */
export function ler() {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE_CARRINHO);
    const dados = bruto ? JSON.parse(bruto) : [];
    if (!Array.isArray(dados)) return [];
    return dados
      .filter((i) => i && typeof i.id === "string")
      .map((i) => ({ id: i.id, qtd: Math.max(1, Number(i.qtd) || 1) }));
  } catch {
    return [];
  }
}

export function gravar(itens) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
  } catch {
    /* Modo privado ou armazenamento cheio: o carrinho segue só em memória. */
  }
}

/* ---- Operações puras sobre a lista ---------------------------------------
   Recebem e devolvem a lista, sem tocar em armazenamento nem em interface.
   O motivo de devolverem `{ itens, erro }` é que a regra de estoque precisa
   ser comunicada à cliente — o carrinho não pode falhar em silêncio. */

export function adicionar(itens, id, qtd = 1) {
  const produto = porId(id);
  if (!produto) return { itens, erro: "Esta peça não está mais disponível." };

  const existente = itens.find((i) => i.id === id);
  const noCarrinho = existente ? existente.qtd : 0;

  if (noCarrinho + qtd > produto.estoque) {
    const resta = produto.estoque - noCarrinho;
    return {
      itens,
      erro:
        resta > 0
          ? "Só restam " + resta + " unidades desta peça."
          : "Você já tem todo o estoque disponível no carrinho.",
    };
  }

  const novos = existente
    ? itens.map((i) => (i.id === id ? { ...i, qtd: i.qtd + qtd } : i))
    : itens.concat({ id, qtd });

  return { itens: novos, erro: null };
}

export function definirQtd(itens, id, qtd) {
  if (qtd <= 0) return { itens: remover(itens, id), erro: null };

  const produto = porId(id);
  let erro = null;

  if (produto && qtd > produto.estoque) {
    erro = "Estoque disponível: " + produto.estoque + " unidades.";
    qtd = produto.estoque;
  }

  return { itens: itens.map((i) => (i.id === id ? { ...i, qtd } : i)), erro };
}

export function remover(itens, id) {
  return itens.filter((i) => i.id !== id);
}

/* ---- Consultas ------------------------------------------------------------ */

/* Itens com o produto resolvido. Descarta o que não existe mais no catálogo. */
export function detalhar(itens) {
  return itens
    .map((i) => {
      const produto = porId(i.id);
      return produto
        ? { produto, qtd: i.qtd, subtotal: produto.preco * i.qtd }
        : null;
    })
    .filter(Boolean);
}

export function totalItens(itens) {
  return itens.reduce((s, i) => s + i.qtd, 0);
}

export function subtotal(itens) {
  return detalhar(itens).reduce((s, i) => s + i.subtotal, 0);
}
