"use client";

/* =========================================================================
   acbolsa — seletor de quantidade e botão de compra
   =========================================================================

   Ilha de cliente dentro de uma página de servidor: só o que precisa de
   estado. A ficha técnica, as medidas e a descrição são HTML estático.
   ========================================================================= */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCarrinho } from "@/components/CarrinhoContexto";
import { useToast } from "@/components/ToastContexto";

export default function ComprarProduto({ produto }) {
  const [qtd, setQtd] = useState(1);
  const [carregando, setCarregando] = useState(null);
  const { adicionar } = useCarrinho();
  const mostrarToast = useToast();
  const router = useRouter();

  function ajustar(delta) {
    setQtd((atual) => Math.min(produto.estoque, Math.max(1, atual + delta)));
  }

  /* Os dois botões fazem a MESMA coisa com a sacola; o que muda é para onde
     a pessoa vai depois. "Comprar agora" não é um fluxo paralelo — se fosse,
     quem já tinha peças na sacola as perderia de vista no checkout. */
  function aoAdicionar(seguirParaCheckout) {
    if (carregando) return;
    setCarregando(seguirParaCheckout ? "comprar" : "sacola");

    /* Pequeno atraso para o estado de carregamento ser percebido. Sem
       servidor a operação é instantânea, e um botão que "pisca" não
       confirma nada para quem clicou. */
    setTimeout(() => {
      const deuCerto = adicionar(produto.id, qtd);

      if (!deuCerto) {
        /* Estoque insuficiente: o toast de erro já explicou. Fica na página
           para a pessoa poder ajustar a quantidade. */
        setCarregando(null);
        return;
      }

      if (seguirParaCheckout) {
        /* Não desliga o carregando: a navegação começa agora, e devolver o
           botão ao normal antes da página trocar parece que nada aconteceu. */
        router.push("/checkout");
        return;
      }

      setCarregando(null);
      mostrarToast(produto.nome + " foi para a sacola.");
    }, 260);
  }

  return (
    <div className="buy-row">
      <div className="qty">
        <button
          type="button"
          aria-label="Diminuir quantidade"
          disabled={qtd <= 1}
          onClick={() => ajustar(-1)}
        >
          −
        </button>
        <label className="sr-only" htmlFor="qtd">
          Quantidade
        </label>
        <input
          id="qtd"
          type="number"
          min="1"
          max={produto.estoque}
          value={qtd}
          onChange={(e) => {
            const v = Number(e.target.value);
            /* Campo vazio no meio da digitação não pode virar 1 na hora, ou
               não dá para apagar o que está escrito. Só normaliza no blur. */
            setQtd(Number.isNaN(v) ? 1 : v);
          }}
          onBlur={(e) => {
            const v = Number(e.target.value) || 1;
            setQtd(Math.min(produto.estoque, Math.max(1, Math.floor(v))));
          }}
        />
        <button
          type="button"
          aria-label="Aumentar quantidade"
          disabled={qtd >= produto.estoque}
          onClick={() => ajustar(1)}
        >
          +
        </button>
      </div>

      <button
        className={"btn btn-ghost btn-lg" + (carregando === "sacola" ? " btn-loading" : "")}
        type="button"
        onClick={() => aoAdicionar(false)}
      >
        Adicionar à sacola
      </button>

      {/* Ação principal: leva a peça para a sacola e segue direto ao
          checkout. Fica na própria linha para não espremer as outras duas. */}
      <button
        className={"btn btn-primary btn-lg buy-row-principal" + (carregando === "comprar" ? " btn-loading" : "")}
        type="button"
        onClick={() => aoAdicionar(true)}
      >
        Comprar agora
      </button>
    </div>
  );
}
