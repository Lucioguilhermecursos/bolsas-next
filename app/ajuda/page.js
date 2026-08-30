/* =========================================================================
   acbolsa — ajuda
   =========================================================================

   PENDENTE DE PREENCHIMENTO: as políticas abaixo estão escritas conforme o
   Código de Defesa do Consumidor, mas os dados operacionais da loja (CNPJ,
   razão social, endereço, e-mail, transportadora, prazo real) precisam ser
   preenchidos antes de publicar. Cada trecho a completar está marcado com
   [PREENCHER] — a lista consolidada está no CONTINUAR-AQUI.md.
   ========================================================================= */

import Link from "next/link";
import { IconeAlerta } from "@/components/Icones";

export const metadata = {
  title: "Ajuda",
  description: "Entrega, trocas, cuidados com a peça e as políticas da loja da acbolsa.",
};

const SECOES = [
  { id: "entrega", rotulo: "Entrega e prazos" },
  { id: "trocas", rotulo: "Trocas e devoluções" },
  { id: "cuidados", rotulo: "Cuidados com o couro" },
  { id: "pagamento", rotulo: "Formas de pagamento" },
  { id: "privacidade", rotulo: "Privacidade" },
  { id: "termos", rotulo: "Termos de uso" },
  { id: "contato", rotulo: "Falar com a gente" },
];

/* Marca visualmente o que ainda falta a dona da loja preencher. */
function Preencher({ children }) {
  return (
    <p className="texto-suave">
      <strong>[PREENCHER]</strong> {children}
    </p>
  );
}

export default function PaginaAjuda() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <ol className="crumbs" role="list">
            <li>
              <Link href="/">Início</Link>
            </li>
            <li aria-current="page">Ajuda</li>
          </ol>
          <h1>Ajuda</h1>
          <p className="lead">Entrega, trocas, cuidados com a peça e as políticas da loja.</p>
        </div>
      </div>

      <div className="container doc">
        <div className="doc-layout">
          <nav className="doc-nav" aria-label="Seções desta página">
            {SECOES.map((s) => (
              <a href={"#" + s.id} key={s.id}>
                {s.rotulo}
              </a>
            ))}
          </nav>

          <div className="doc-body">
            <div className="notice mb-14">
              <IconeAlerta />
              <p>
                <strong>Texto em preparação.</strong> As políticas seguem o Código de Defesa do
                Consumidor, mas os dados da empresa e os prazos reais ainda precisam ser preenchidos
                — os trechos marcados com <strong>[PREENCHER]</strong> são os que faltam.
              </p>
            </div>

            <section id="entrega">
              <h2>Entrega e prazos</h2>
              <p>
                Enviamos para todo o Brasil. O frete e o prazo aparecem no checkout, calculados pelo
                CEP informado, e o valor final é o que você vê antes de concluir o pedido — sem
                acréscimo depois.
              </p>
              <p>
                O prazo começa a contar a partir da confirmação do pagamento, não da data do pedido.
                Peças em estoque saem em até 2 dias úteis.
              </p>
              <ul role="list">
                <li>Sudeste: 3 a 7 dias úteis</li>
                <li>Sul e Centro-Oeste: 5 a 9 dias úteis</li>
                <li>Nordeste: 7 a 12 dias úteis</li>
                <li>Norte: 9 a 15 dias úteis</li>
              </ul>
              <p>
                Frete grátis em pedidos acima de R$ 500,00. Todo envio tem código de rastreio,
                enviado por e-mail quando a peça sai para entrega.
              </p>
              <Preencher>
                transportadora utilizada e política para endereços de difícil acesso ou áreas com
                restrição de entrega.
              </Preencher>
            </section>

            <section id="trocas">
              <h2>Trocas e devoluções</h2>
              <p>
                Você tem <strong>7 dias corridos</strong> a partir do recebimento para desistir da
                compra e receber o valor integral de volta, incluindo o frete — é o direito de
                arrependimento previsto no artigo 49 do Código de Defesa do Consumidor, e vale para
                qualquer motivo, sem precisar justificar.
              </p>
              <p>
                Além desse prazo, aceitamos troca em até <strong>30 dias</strong> para peças sem
                uso, com etiqueta e na embalagem original.
              </p>
              <p>
                Se a peça chegou com defeito, o prazo é de 90 dias e a troca ou o reparo é por nossa
                conta, incluindo o frete nos dois sentidos.
              </p>
              <ul role="list">
                <li>A peça precisa estar sem sinais de uso, com etiqueta presa</li>
                <li>
                  Marcas naturais do couro não são defeito — variação de tom e de grão fazem parte
                  do material
                </li>
                <li>
                  O reembolso sai pelo mesmo meio do pagamento, em até 10 dias úteis após recebermos
                  a peça de volta
                </li>
              </ul>
              <Preencher>
                endereço para postagem da devolução e se a loja emite código de logística reversa.
              </Preencher>
            </section>

            <section id="cuidados">
              <h2>Cuidados com o couro</h2>
              <p>
                Couro é pele: resseca, mancha e escurece. Com pouco cuidado, dura anos; sem nenhum,
                endurece e racha.
              </p>
              <ul role="list">
                <li>
                  <strong>Hidratação:</strong> creme incolor para couro a cada seis meses, em camada
                  fina, com pano macio
                </li>
                <li>
                  <strong>Chuva:</strong> se molhar, seque à sombra e longe de fonte de calor.
                  Secador e sol direto endurecem o couro
                </li>
                <li>
                  <strong>Guarda:</strong> na sapatilha de tecido que acompanha a peça, com
                  enchimento dentro para não vincar. Nunca em saco plástico — o couro precisa
                  respirar
                </li>
                <li>
                  <strong>Manchas:</strong> pano levemente úmido e secagem natural. Álcool, acetona
                  e produto de limpeza doméstica removem a cor
                </li>
                <li>
                  <strong>Tons claros:</strong> jeans escuro solta corante nos primeiros usos e pode
                  transferir para o couro. É a mancha mais comum e a mais difícil de tirar
                </li>
              </ul>
              <p>
                O escurecimento do couro de curtimento vegetal não é desgaste. É a reação do
                material à luz e ao contato, e a peça fica com um tom que só ela tem.
              </p>
            </section>

            <section id="pagamento">
              <h2>Formas de pagamento</h2>
              <p>
                Ao finalizar, o pedido é registrado na sua conta e você é levada a uma página
                segura do parceiro de pagamento para concluir a compra. As formas disponíveis
                (PIX, cartão, boleto) e as condições de parcelamento aparecem nessa página.
              </p>
              <p>
                Nenhum dado de cartão é digitado ou armazenado neste site — quem cuida disso é o
                parceiro de pagamento, em ambiente próprio.
              </p>
              <div className="notice mt-6">
                <IconeAlerta />
                <p>
                  <strong>Site em preparação.</strong> Enquanto o meio de pagamento não está ligado,
                  o pedido fica registrado e a loja entra em contato pelo e-mail informado para
                  combinar o pagamento e o envio. Nenhuma cobrança é feita automaticamente.
                </p>
              </div>
              <div className="mt-6">
                <Preencher>parceiro de pagamento contratado e condições de parcelamento.</Preencher>
              </div>
            </section>

            <section id="privacidade">
              <h2>Política de privacidade</h2>
              <p>
                Esta política explica quais dados a acbolsa coleta, por que, com quem compartilha e
                quais são os seus direitos. Vale para todo o site. Ao criar uma conta ou finalizar
                uma compra, você concorda com o descrito aqui.
              </p>

              <h3>Que dados coletamos</h3>
              <ul role="list">
                <li>
                  <strong>Cadastro:</strong> nome e e-mail. Se você entrar com o Google, recebemos do
                  Google seu nome, e-mail e foto de perfil — nada além disso, e só quando você
                  escolhe esse caminho.
                </li>
                <li>
                  <strong>Pedido:</strong> telefone, CPF e endereço de entrega. O CPF é obrigatório
                  para a emissão da nota fiscal.
                </li>
                <li>
                  <strong>Uso do site:</strong> a sacola fica guardada no seu próprio navegador
                  (armazenamento local). Um cookie mantém você conectado entre visitas. Não usamos
                  cookies de publicidade nem rastreadores de terceiros.
                </li>
                <li>
                  <strong>Pagamento:</strong> os dados do cartão são digitados na página do parceiro
                  de pagamento, não neste site. A acbolsa <strong>nunca</strong> armazena número de
                  cartão, CVV ou validade.
                </li>
              </ul>

              <h3>Como usamos</h3>
              <p>
                Para criar e manter sua conta, processar e entregar seus pedidos, emitir nota
                fiscal, dar suporte e cumprir obrigações legais. Não vendemos nem cedemos seus dados
                para fins comerciais de terceiros.
              </p>

              <h3>Com quem compartilhamos</h3>
              <ul role="list">
                <li>
                  <strong>Provedor de infraestrutura</strong> (Supabase) — hospeda o banco de dados
                  da conta e dos pedidos. Os servidores podem estar fora do Brasil; a transferência
                  segue as bases legais da LGPD.
                </li>
                <li>
                  <strong>Meio de pagamento</strong> — recebe o valor e os dados necessários para a
                  cobrança quando você vai pagar.
                </li>
                <li>
                  <strong>Transportadora</strong> — recebe nome e endereço para a entrega.
                </li>
                <li>
                  <strong>Google</strong> — apenas se você usar &ldquo;Entrar com o Google&rdquo;,
                  para autenticar o acesso.
                </li>
              </ul>

              <h3>Seus direitos (LGPD — Lei 13.709/2018)</h3>
              <p>
                Você pode pedir a qualquer momento: acesso aos seus dados, correção, exclusão,
                portabilidade, informação sobre com quem foram compartilhados, e a revogação do
                consentimento. Pedidos de exclusão da conta são atendidos pelo canal de contato
                abaixo. Dados necessários para obrigações fiscais são mantidos pelo prazo exigido
                por lei mesmo após a exclusão da conta.
              </p>
              <p>
                Você mesma pode conferir e corrigir seus dados de contato e entrega na página{" "}
                <Link className="link-underline" href="/conta">
                  Minha conta
                </Link>{" "}
                — a correção vale no próximo pedido.
              </p>

              <h3>Segurança</h3>
              <p>
                O acesso à conta é protegido por senha (ou pela sua conta Google). Cada pessoa só
                enxerga os próprios pedidos e dados. A conexão com o site é criptografada (HTTPS).
              </p>

              <Preencher>
                razão social, CNPJ, endereço da empresa, e-mail do encarregado de dados (DPO) e o
                canal oficial para exercer os direitos da LGPD — obrigatórios antes de publicar.
              </Preencher>
            </section>

            <section id="termos">
              <h2>Termos de uso</h2>
              <p>
                Ao comprar nesta loja, você concorda com as condições descritas nesta página,
                incluindo prazos de entrega, política de trocas e tratamento de dados.
              </p>
              <ul role="list">
                <li>
                  As imagens buscam representar as peças com fidelidade, mas variações de tom entre
                  telas são esperadas
                </li>
                <li>
                  Preços e disponibilidade podem mudar sem aviso; vale o valor exibido no momento em
                  que o pedido é concluído
                </li>
                <li>
                  Erros evidentes de preço (valor incompatível com o produto) não obrigam a loja à
                  venda, e o pedido é cancelado com reembolso integral
                </li>
                <li>
                  Todo o conteúdo do site — textos, fotos e identidade visual — pertence à acbolsa
                </li>
              </ul>
              <Preencher>
                razão social e CNPJ da empresa responsável, e foro escolhido para eventual disputa.
              </Preencher>
            </section>

            <section id="contato">
              <h2>Falar com a gente</h2>
              <p>
                Dúvida sobre uma peça, sobre um pedido em andamento ou sobre troca: escreva e
                respondemos em até um dia útil.
              </p>
              <Preencher>
                e-mail de atendimento, WhatsApp e horário de funcionamento. Os canais que estavam no
                site anterior (WhatsApp, WeChat, LINE, Instagram) não foram confirmados para esta
                versão e por isso não aparecem aqui.
              </Preencher>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
