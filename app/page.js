/* =========================================================================
   acbolsa — página inicial
   =========================================================================

   Server Component: o catálogo é um arquivo, então a home inteira é HTML
   estático. Só a inscrição na lista e a revelação no scroll são clientes.
   ========================================================================= */

import Link from "next/link";
import { maisVendidos, novidades, cores, porCor, porId, formatarPreco } from "@/lib/catalog";
import { GradeProdutos } from "@/components/CartaoProduto";
import ColecoesCarrossel from "@/components/ColecoesCarrossel";
import Newsletter from "@/components/Newsletter";
import Revelar from "@/components/Revelar";
import {
  IconeAtendimento,
  IconeCaminhao,
  IconeCostura,
  IconeVolta,
} from "@/components/Icones";

export const metadata = {
  title: "acbolsa — Bolsas de couro feitas para durar",
  description:
    "Bolsas e acessórios de couro da acbolsa. Peças com ficha técnica aberta: material, medidas e construção antes do preço.",
};

/* Prazos e condições ainda não confirmados pela loja: o texto fala do que é
   verificável, sem inventar número. Ver "Pendências do negócio". */
const PROMESSAS = [
  { Icone: IconeCaminhao, titulo: "Envio para todo o Brasil", texto: "Código de rastreio em todo pedido" },
  { Icone: IconeVolta, titulo: "Troca em 30 dias", texto: "Peça sem uso, com etiqueta" },
  { Icone: IconeCostura, titulo: "Couro legítimo", texto: "Ficha técnica aberta em cada peça" },
  { Icone: IconeAtendimento, titulo: "Atendimento direto", texto: "Dúvida respondida por quem conhece a peça" },
];

/* Foto do hero. Troque o arquivo em public/fotos/hero.jpg (proporção 3:4,
   o site recorta pro centro). */
const FOTO_HERO = "/fotos/hero.jpg";

/* Foto da faixa "O material". Troque pelo arquivo em public/fotos/produtos/
   que melhor mostrar o detalhe do couro e da costura. */
const FOTO_MATERIAL = "/fotos/produtos/tabby-shoulder-branco-02.jpg";

const MATERIAIS = [
  {
    termo: "Curtimento",
    valor: "Vegetal nas peças lisas, com taninos de casca. Escurece devagar e uniformemente.",
  },
  {
    termo: "Granulado",
    valor: "Textura que absorve marca de unha e canto de mesa. Escolha certa para bolsa de todo dia.",
  },
  {
    termo: "Costura",
    valor: "Ponto selaria nas laterais que sofrem tração, onde a costura corrida abriria antes.",
  },
  { termo: "Ferragem", valor: "Latão maciço em fechos e mosquetões, não zamac banhado." },
];

export default function Home() {
  /* Peça do hero: a Preto, que é a bolsa da foto do hero (public/fotos/hero.jpg).
     Cai na mais vendida se o id sumir do catálogo. */
  const estrela = porId("tabby-shoulder-preto") || maisVendidos(1)[0];

  /* Uma entrada por cor para o carrossel "Por cores". Cor com peça única vai
     direto pra página dela; com mais de uma, abre o catálogo filtrado. */
  const colecoes = cores().map((c) => {
    const daCor = porCor(c.nome);
    const peca = daCor[0];
    return {
      nome: c.nome,
      hex: c.hex,
      foto: peca?.fotos?.[0] ?? null,
      destino:
        daCor.length === 1 && peca
          ? "/produto/" + peca.id
          : "/catalogo?cor=" + encodeURIComponent(c.nome),
    };
  });

  return (
    <>
      <Revelar />

      {/* ====================================================================
          Hero — campo verde, peça em retrato, ação logo abaixo do título.
          Para usar vídeo próprio depois, insira aqui dentro:
          <video className="hero-video" autoPlay muted loop playsInline />
          ==================================================================== */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="hero-kicker label label-rule-lg">Couro legítimo</p>
            <h1>
              A bolsa que envelhece <em>com você</em>
            </h1>
            <p className="hero-lead">
              Peças de couro com ficha técnica aberta: material, medidas e construção antes do
              preço. Você decide sabendo o que está levando.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" href="/catalogo?cat=bolsas">
                Ver as bolsas
              </Link>
              <Link className="btn btn-ghost btn-lg" href="/catalogo?filtro=novidades">
                Novidades
              </Link>
            </div>
          </div>

          <div className="hero-media">
            {estrela && (
              <Link className="hero-peca" href={"/produto/" + estrela.id}>
                <div className="ph ph--hero">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={FOTO_HERO}
                    alt={estrela.nome + " em couro"}
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                <div className="hero-caption">
                  <span className="nome">{estrela.nome}</span>
                  <span className="price">{formatarPreco(estrela.preco)}</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ==== Garantias — fio único, sem cartões ==== */}
      <section aria-label="Nossas garantias">
        <div className="container">
          <ul className="promises" role="list">
            {PROMESSAS.map(({ Icone, titulo, texto }) => (
              <li className="promise" key={titulo}>
                <Icone />
                <div>
                  <h2>{titulo}</h2>
                  <p>{texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ==== Coleções — grid assimétrico ==== */}
      <section className="section field-deep">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Por cores</h2>
              <p className="lead">Escolha pelo tom que combina com você, não pela estação.</p>
            </div>
          </div>

          <ColecoesCarrossel colecoes={colecoes} />
        </div>
      </section>

      {/* ==== Faixa editorial — o argumento do material ==== */}
      <section className="section field-forest">
        <div className="container material">
          <div>
            <p className="label label-rule-lg mb-6">
              O material
            </p>
            <h2>
              Couro que conta
              <br />o tempo
            </h2>
            <p className="lead">
              Um couro de curtimento vegetal chega claro e vai fechando o tom com o uso. Não é
              desgaste — é o material fazendo o que se espera dele. Por isso a ficha técnica de cada
              peça diz de que couro ela é feita.
            </p>

            <ul className="material-list" role="list">
              {MATERIAIS.map((m) => (
                <li key={m.termo}>
                  <span className="termo">{m.termo}</span>
                  <span className="valor">{m.valor}</span>
                </li>
              ))}
            </ul>

            <Link className="btn btn-ghost mt-10" href="/ajuda#cuidados">
              Cuidados com o couro
            </Link>
          </div>

          <div className="material-media">
            <div className="ph ph--square ph--forest">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FOTO_MATERIAL}
                alt="Detalhe do couro e da costura de uma Tabby Shoulder Bag"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==== Novidades ==== */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Chegou agora</h2>
              <p className="lead">As últimas peças a entrar no catálogo.</p>
            </div>
          </div>
          <GradeProdutos produtos={novidades(4)} reveal />
        </div>
      </section>

      {/* ==== Inscrição na lista ==== */}
      <section className="section-tight field-ink">
        <div className="container signup">
          <div>
            <h2 className="signup-titulo">
              Avisamos quando
              <br />
              uma peça volta
            </h2>
            <p className="lead">Sem envio semanal. Só reposição de estoque e peças novas.</p>
          </div>

          <Newsletter />
        </div>
      </section>
    </>
  );
}
