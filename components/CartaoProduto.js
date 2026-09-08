/* =========================================================================
   acbolsa — cartão de produto
   =========================================================================

   Sem sombra, sem borda de caixa, texto à esquerda. A elevação no hover vem
   da escala da imagem e do fio em conhaque que preenche embaixo — não de uma
   sombra difusa.

   O link do título cobre o cartão inteiro por `::after` (ver components.css),
   o que dá alvo de clique grande sem aninhar links dentro de link, e sem
   transformar a peça num só rótulo ilegível para leitor de tela.
   ========================================================================= */

import Link from "next/link";
import { formatarPreco, nomeCategoria } from "@/lib/catalog";
import { MidiaProduto } from "./Placeholder";
import SlideshowProduto from "./SlideshowProduto";

export default function CartaoProduto({ produto, eager = false, reveal = false, slideshow = false, semPreco = false }) {
  const esgotado = produto.estoque <= 0;
  const emOferta = produto.precoDe && produto.precoDe > produto.preco;

  /* Um selo só, nesta ordem de prioridade: não adianta anunciar "Novo" numa
     peça que a cliente não pode comprar. */
  let selo = null;
  if (esgotado) selo = <span className="badge badge--out">Esgotado</span>;
  else if (emOferta) selo = <span className="badge badge--sale">Oferta</span>;
  else if (produto.novo) selo = <span className="badge">Novo</span>;

  const comSlideshow = slideshow && (produto.fotosProduto?.length ?? produto.fotos?.length) > 0;

  return (
    <article className={"card" + (reveal ? " reveal" : "")}>
      {comSlideshow ? (
        <SlideshowProduto produto={produto} selo={selo} eager={eager} />
      ) : (
        <div className="card-media">
          {selo}
          <MidiaProduto produto={produto} eager={eager} />
        </div>
      )}

      <div className="card-body">
        <p className="card-cat">{nomeCategoria(produto.cat)}</p>

        <h3 className="card-title">
          <Link href={"/produto/" + produto.id}>{produto.nome}</Link>
        </h3>

        {!semPreco && (
          <p className="card-price price">
            {emOferta && <span className="price-old">{formatarPreco(produto.precoDe)}</span>}
            {formatarPreco(produto.preco)}
          </p>
        )}

        {/* Escassez só quando é verdade e útil: abaixo de 5 unidades. */}
        {!esgotado && produto.estoque <= 4 && (
          <p className="card-meta">Últimas {produto.estoque} unidades</p>
        )}

        {produto.hex && (
          <div className="swatches">
            <span className="swatch" style={{ background: produto.hex }} title={produto.cor} />
            <span className="sr-only">Cor: {produto.cor}</span>
          </div>
        )}
      </div>
    </article>
  );
}

/* Grade de produtos. As quatro primeiras imagens sobem sem lazy — são as que
   entram na primeira dobra. */
export function GradeProdutos({
  produtos,
  eager = false,
  reveal = false,
  slideshow = false,
  semPreco = false,
  className = "",
}) {
  return (
    <div className={"grid-products " + className}>
      {produtos.map((p, i) => (
        <CartaoProduto
          key={p.id}
          produto={p}
          eager={eager && i < 4}
          reveal={reveal}
          slideshow={slideshow}
          semPreco={semPreco}
        />
      ))}
    </div>
  );
}
