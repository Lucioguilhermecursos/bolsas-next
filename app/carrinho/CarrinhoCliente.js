"use client";

/* =========================================================================
   acbolsa — sacola
   =========================================================================

   Na versão anterior este arquivo tinha uma rotina inteira para atualizar
   só os números sem recriar o DOM: um innerHTML a cada clique em "+" jogava
   o foco para o body, fechava o teclado no celular e destruía o próprio
   botão em uso. O React reconcilia por chave e resolve isso sozinho — o
   `key={id}` em cada linha é o que preserva o foco.
   ========================================================================= */

import Link from "next/link";
import { formatarPreco, nomeCategoria, porId } from "@/lib/catalog";
import { useCarrinho } from "@/components/CarrinhoContexto";
import { useToast } from "@/components/ToastContexto";
import { MidiaProduto } from "@/components/Placeholder";
import { IconeSacola, IconeSeta } from "@/components/Icones";

export default function CarrinhoCliente() {
  const { detalhados, subtotal, pronto, definirQtd, remover, limpar } = useCarrinho();
  const mostrarToast = useToast();

  /* Antes da leitura do localStorage não dá para saber se a sacola está
     vazia. Mostrar "sua sacola está vazia" nesse intervalo seria mentira
     por um quadro em toda visita. */
  if (!pronto) {
    return <div className="reserva-carregando" aria-hidden="true" />;
  }

  if (!detalhados.length) {
    return (
      <div className="empty empty--pagina">
        <IconeSacola />
        <h2>Sua sacola está vazia</h2>
        <p>
          As peças que você adicionar ficam guardadas aqui, mesmo se você fechar o navegador.
        </p>
        <Link className="btn btn-primary" href="/catalogo?cat=bolsas">
          Ver as bolsas
        </Link>
      </div>
    );
  }

  function aoRemover(id) {
    const p = porId(id);
    remover(id);
    mostrarToast((p ? p.nome : "Peça") + " saiu da sacola.");
  }

  function aoEsvaziar() {
    if (window.confirm("Tirar todas as peças da sacola?")) {
      limpar();
      mostrarToast("Sacola esvaziada.");
    }
  }

  return (
    <div className="cart">
      <div>
        <div className="cart-list">
          {detalhados.map(({ produto, qtd, subtotal: linha }) => (
            <article className="cart-item" key={produto.id}>
              <div className="cart-item-media">
                <Link href={"/produto/" + produto.id}>
                  <MidiaProduto produto={produto} proporcao="square" />
                </Link>
              </div>

              <div>
                <h3>
                  <Link href={"/produto/" + produto.id}>{produto.nome}</Link>
                </h3>
                <p className="cart-item-meta">
                  {nomeCategoria(produto.cat)} · {produto.cor}
                </p>
                <p className="cart-item-meta">{produto.medidas}</p>

                <div className="cart-item-controls">
                  <div className="qty">
                    <button
                      type="button"
                      aria-label={"Diminuir quantidade de " + produto.nome}
                      disabled={qtd <= 1}
                      onClick={() => definirQtd(produto.id, qtd - 1)}
                    >
                      −
                    </button>
                    <label className="sr-only" htmlFor={"q-" + produto.id}>
                      Quantidade de {produto.nome}
                    </label>
                    <input
                      id={"q-" + produto.id}
                      type="number"
                      min="1"
                      max={produto.estoque}
                      value={qtd}
                      onChange={(e) => {
                        const v = Math.max(1, Math.floor(Number(e.target.value) || 1));
                        definirQtd(produto.id, v);
                      }}
                    />
                    <button
                      type="button"
                      aria-label={"Aumentar quantidade de " + produto.nome}
                      disabled={qtd >= produto.estoque}
                      onClick={() => definirQtd(produto.id, qtd + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="cart-item-remove"
                    type="button"
                    onClick={() => aoRemover(produto.id)}
                  >
                    Remover
                  </button>
                </div>

                {qtd >= produto.estoque && (
                  <p className="field-hint mt-2">
                    Máximo disponível em estoque.
                  </p>
                )}
              </div>

              <p className="cart-item-price price">{formatarPreco(linha)}</p>
            </article>
          ))}
        </div>

        <div className="cart-acoes">
          <Link className="link-arrow link-arrow--voltar" href="/catalogo">
            <IconeSeta />
            Continuar comprando
          </Link>
          <button className="cart-item-remove" type="button" onClick={aoEsvaziar}>
            Esvaziar sacola
          </button>
        </div>
      </div>

      {/* Campo verde: a única âncora escura da página, e o único lugar onde o
          conhaque age contra campo escuro em vez de desaparecer contra bege.
          Não é um cartão bege claro. Ver DESIGN.md. */}
      <aside className="summary">
        <h2>Resumo</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <span className="v">{formatarPreco(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Frete</span>
          <span className="v texto-suave">calculado no checkout</span>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <span className="v">{formatarPreco(subtotal)}</span>
        </div>
        <Link className="btn btn-primary btn-lg btn-block" href="/checkout">
          Finalizar compra
        </Link>
        <p className="summary-note">
          O frete é calculado pelo seu CEP na próxima etapa. Nada é cobrado antes da confirmação.
        </p>
      </aside>
    </div>
  );
}
