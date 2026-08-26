/* =========================================================================
   acbolsa — nossa história
   =========================================================================

   Página inteiramente estática: o argumento da marca é o couro e a
   construção, e isso não muda a cada visita.
   ========================================================================= */

import Link from "next/link";
import { Placeholder } from "@/components/Placeholder";

export const metadata = {
  title: "Nossa história",
  description:
    "Como a acbolsa escolhe couro, constrói suas peças e por que a ficha técnica fica aberta em cada produto.",
};

const COUROS = [
  {
    titulo: "Curtimento vegetal",
    texto:
      "Curtido com taninos de casca de árvore, num processo que leva semanas em vez de horas. Chega claro e escurece devagar com a luz e o uso, até um tom que nenhuma outra peça igual vai ter. É o couro das nossas bolsas lisas.",
  },
  {
    titulo: "Couro granulado",
    texto:
      "A textura em grão absorve marca de unha, canto de mesa e chave solta dentro da bolsa. É menos elegante numa foto de estúdio e muito melhor na vida real. Usamos nas peças de uso diário.",
  },
  {
    titulo: "Raffia",
    texto:
      "Fibra natural trançada à mão, com couro nas partes que sofrem — base, vivos e alça. Cada trama sai um pouco diferente da outra, e isso é característica do trabalho manual, não defeito.",
  },
];

const CONSTRUCAO = [
  {
    termo: "Ponto selaria",
    texto:
      "Nas laterais, onde o peso puxa. É uma costura em que cada ponto se fecha sozinho: se um arrebentar, os vizinhos seguram. A costura corrida, mais barata e mais rápida, abre em cascata a partir de um ponto rompido.",
  },
  {
    termo: "Latão maciço",
    texto:
      "Fechos, mosquetões e argolas em latão, não em zamac banhado. O banho do zamac descasca e o metal por baixo esfarela; o latão escurece, e escurecer é diferente de estragar.",
  },
  {
    termo: "Base reforçada",
    texto:
      "O fundo é a primeira parte a ceder, porque apoia no chão e carrega o peso todo. Nas peças de corpo mole, a base leva reforço interno para a bolsa não perder a linha depois de alguns meses.",
  },
];

export default function PaginaSobre() {
  return (
    <>
      {/* ---- Abertura ---- */}
      <section className="section field-forest">
        <div className="container">
          <div className="medida-editorial">
            <p className="label label-rule-lg mb-6">
              Nossa história
            </p>
            <h1 className="h-page mb-6">
              Uma bolsa não deveria
              <br />
              durar uma estação
            </h1>
            <p className="lead">
              A acbolsa começou de uma frustração simples: peças bonitas de vitrine que abriam a
              costura no terceiro mês. A resposta foi trabalhar com couro de verdade e mostrar a
              ficha técnica antes do preço — para quem compra saber exatamente o que está levando.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Como escolhemos o couro ---- */}
      <section className="section" id="materiais">
        <div className="container material material--topo">
          <div>
            <h2 className="mb-6">
              Como escolhemos
              <br />o couro
            </h2>

            <div className="prose prose--longa texto-suave">
              <p>
                Couro não é um material só. O mesmo animal dá peles com comportamentos
                completamente diferentes, e a escolha muda o que a bolsa vai ser depois de dois anos
                de uso.
              </p>
              <p>Trabalhamos com dois tipos, e cada peça diz na ficha qual é o dela.</p>
            </div>

            <div className="material-list-blocks">
              {COUROS.map((c) => (
                <div className="material-block" key={c.titulo}>
                  <h3>{c.titulo}</h3>
                  <p>{c.texto}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="material-media">
            <Placeholder proporcao="tall" rotulo="Detalhe do couro e da costura" />
          </div>
        </div>
      </section>

      {/* ---- Construção ---- */}
      <section className="section field-deep">
        <div className="container">
          <div className="section-head medida-editorial">
            <div>
              <h2>O que sustenta a peça</h2>
              <p className="lead">
                Três decisões de construção que não aparecem na foto, mas decidem quanto tempo a
                bolsa dura.
              </p>
            </div>
          </div>

          <dl className="construction-list">
            {CONSTRUCAO.map((c) => (
              <div className="editorial-row" key={c.termo}>
                <dt>{c.termo}</dt>
                <dd>{c.texto}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- Ficha aberta ---- */}
      <section className="section">
        <div className="container medida-leitura">
          <h2 className="mb-6">
            Por que a ficha
            <br />
            fica aberta
          </h2>
          <div className="prose prose--longa texto-suave">
            <p>
              Comprar bolsa pela internet é comprar no escuro: a foto não diz o peso, nem a textura,
              nem se cabe o que você carrega. A saída convencional é compensar com adjetivo —
              &quot;premium&quot;, &quot;sofisticada&quot;, &quot;atemporal&quot; — que não informa
              nada.
            </p>
            <p>
              Preferimos o outro caminho. Cada peça mostra material, medidas em centímetros, queda
              da alça, o que tem dentro e como cuidar. Se a bolsa não serve para o que você precisa,
              é melhor você descobrir antes de comprar do que depois.
            </p>
            <p>
              É também por isso que não vendemos nada sob o nome de outra marca. O argumento aqui é
              o couro e a construção; se precisássemos de uma etiqueta emprestada para justificar o
              preço, o produto não estaria pronto.
            </p>
          </div>

          <Link className="btn btn-primary mt-10" href="/catalogo?cat=bolsas">
            Ver as peças
          </Link>
        </div>
      </section>
    </>
  );
}
