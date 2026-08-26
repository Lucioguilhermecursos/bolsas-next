/* =========================================================================
   acbolsa — página de produto
   =========================================================================

   Sem atendente no fluxo: material, medidas e construção aparecem antes da
   decisão, não escondidos atrás de um link. Ver PRODUCT.md.

   As 21 páginas são geradas na build por `generateStaticParams` — o catálogo
   é um arquivo, então não há motivo para renderizar isto a cada visita.
   ========================================================================= */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatarPreco,
  nomeCategoria,
  porId,
  relacionados,
  todos,
  variantesDeCor,
} from "@/lib/catalog";
import { GradeProdutos } from "@/components/CartaoProduto";
import { MidiaProduto } from "@/components/Placeholder";
import { Acordeao, ItemAcordeao } from "@/components/Acordeao";
import Revelar from "@/components/Revelar";
import ComprarProduto from "./ComprarProduto";
import Galeria from "./Galeria";

export function generateStaticParams() {
  return todos().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const produto = porId(id);

  if (!produto) return { title: "Peça não encontrada" };

  return {
    title: produto.nome,
    description:
      produto.nome + " em " + produto.material.toLowerCase() + ". " + produto.medidas + ".",
  };
}

export default async function PaginaProduto({ params }) {
  const { id } = await params;
  const produto = porId(id);

  if (!produto) notFound();

  const esgotado = produto.estoque <= 0;
  const emOferta = produto.precoDe && produto.precoDe > produto.preco;

  /* A MESMA peça em outras cores. Vazio quando o modelo só existe numa cor —
     e aí o seletor não aparece, em vez de listar outras bolsas. */
  const outrasCores = variantesDeCor(produto);

  /* Parcelamento é cálculo direto sobre o preço, sem taxa afirmada. */
  const parcelas = produto.preco >= 200 ? 6 : 3;
  const valorParcela = produto.preco / parcelas;

  let nivel = "ok";
  let textoEstoque = "Em estoque, pronto para envio";
  if (esgotado) {
    nivel = "zero";
    textoEstoque = "Esgotado no momento";
  } else if (produto.estoque <= 4) {
    nivel = "baixo";
    textoEstoque = "Últimas " + produto.estoque + " unidades";
  }

  return (
    <>
      <Revelar />

      <div className="container">
        <ol className="crumbs pt-8" role="list">
          <li>
            <Link href="/">Início</Link>
          </li>
          <li>
            <Link href="/catalogo">Catálogo</Link>
          </li>
          <li>
            <Link href={"/catalogo?cat=" + produto.cat}>{nomeCategoria(produto.cat)}</Link>
          </li>
          <li aria-current="page">{produto.nome}</li>
        </ol>

        <div className="product">
          <div className="product-media">
            {produto.fotos?.length ? (
              <Galeria produto={produto} />
            ) : (
              <div className="gallery-main">
                <MidiaProduto produto={produto} eager />
              </div>
            )}
          </div>

          <div className="product-info">
            <p className="label">{nomeCategoria(produto.cat)}</p>
            <h1>{produto.nome}</h1>

            <div className="product-price">
              {emOferta && <span className="price-old price">{formatarPreco(produto.precoDe)}</span>}
              <span className="price">{formatarPreco(produto.preco)}</span>
            </div>
            <p className="product-parcel">
              ou {parcelas}× de {formatarPreco(valorParcela)} sem juros
            </p>

            <p className="product-desc">{produto.descricao}</p>

            {/* Cor — só é seletor quando a MESMA peça existe em outro couro. */}
            <div className="option-group">
              <div className="option-head">
                <h2>Cor</h2>
                <span className="valor">{produto.cor}</span>
              </div>

              {outrasCores.length ? (
                <div className="color-list">
                  <button
                    className="color-opt"
                    type="button"
                    aria-pressed="true"
                    aria-label={produto.cor + ", cor selecionada"}
                  >
                    <span style={{ background: produto.hex }} />
                  </button>
                  {outrasCores.map((p) => (
                    <Link
                      key={p.id}
                      className="color-opt"
                      href={"/produto/" + p.id}
                      replace
                      aria-label={"Ver esta peça em " + p.cor}
                      title={p.cor}
                    >
                      <span style={{ background: p.hex }} />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="field-hint">Peça única nesta cor.</p>
              )}
            </div>

            <p className="stock" data-level={nivel}>
              {textoEstoque}
            </p>

            {esgotado ? (
              <>
                <div className="buy-row">
                  <button className="btn btn-dark btn-lg btn-block" type="button" disabled>
                    Esgotado
                  </button>
                </div>
                <p className="field-hint mt-3">
                  Assine o aviso no rodapé para saber quando esta peça voltar.
                </p>
              </>
            ) : (
              <ComprarProduto produto={produto} />
            )}

            {/* Ficha técnica — o argumento da venda */}
            <div className="specs">
              <h2>Ficha técnica</h2>
              <dl>
                <div className="spec-row">
                  <dt>Material</dt>
                  <dd>{produto.material}</dd>
                </div>
                <div className="spec-row">
                  <dt>Medidas</dt>
                  <dd>{produto.medidas}</dd>
                </div>
                {produto.alca && (
                  <div className="spec-row">
                    <dt>Alça</dt>
                    <dd>{produto.alca}</dd>
                  </div>
                )}
                <div className="spec-row">
                  <dt>Cor</dt>
                  <dd>{produto.cor}</dd>
                </div>
              </dl>

              <ul className="spec-list" role="list">
                {produto.detalhes.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <Acordeao className="mt-14">
              <ItemAcordeao titulo="Cuidados com a peça">
                <p>{produto.cuidados}</p>
              </ItemAcordeao>
              <ItemAcordeao titulo="Entrega e prazos">
                <p>
                  Enviamos para todo o Brasil com código de rastreio. O prazo aparece no checkout,
                  calculado pelo seu CEP.
                </p>
              </ItemAcordeao>
              <ItemAcordeao titulo="Trocas e devoluções">
                <p>
                  Você tem 30 dias para devolver a peça sem uso e com etiqueta.{" "}
                  <Link className="link-underline" href="/ajuda#trocas">
                    Ver como funciona
                  </Link>
                  .
                </p>
              </ItemAcordeao>
            </Acordeao>
          </div>
        </div>
      </div>

      <section className="related">
        <div className="container">
          <div className="section-head mb-10">
            <h2 className="h-section">Você também pode gostar</h2>
          </div>
          <GradeProdutos produtos={relacionados(produto, 4)} reveal />
        </div>
      </section>
    </>
  );
}
