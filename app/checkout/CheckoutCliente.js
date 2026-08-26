"use client";

/* =========================================================================
   acbolsa — checkout
   =========================================================================

   O formulário é completo e valida de verdade, mas NÃO processa pagamento:
   não há servidor. A confirmação diz que o pedido foi REGISTRADO, nunca que
   foi cobrado. Ver PRODUCT.md — princípio "não afirmar o que não se pode
   cumprir".

   Dados de cartão nunca são gravados: os campos ficam `disabled` enquanto
   ocultos (assim não entram em FormData nem na validação do navegador), e o
   objeto do pedido guarda apenas `{ forma, parcelas }`.

   Para ligar a um backend depois: o objeto `pedido` montado em `finalizar()`
   é o que precisa ser enviado.
   ========================================================================= */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatarPreco } from "@/lib/catalog";
import {
  FRETE,
  UFS,
  calcularFrete,
  cpfValido,
  emailValido,
  gravarPedido,
  mascaraCEP,
  mascaraCPF,
  mascaraCartao,
  mascaraTelefone,
  mascaraValidade,
  validadeCartaoValida,
} from "@/lib/formulario";
import { useCarrinho } from "@/components/CarrinhoContexto";
import { useToast } from "@/components/ToastContexto";
import { MidiaProduto } from "@/components/Placeholder";
import { IconeAlerta, IconeCheck, IconeSacola } from "@/components/Icones";

const FORMAS_NOME = { pix: "PIX", cartao: "Cartão de crédito", boleto: "Boleto bancário" };

const CAMPOS_INICIAIS = {
  nome: "",
  email: "",
  tel: "",
  cpf: "",
  cep: "",
  rua: "",
  numero: "",
  compl: "",
  bairro: "",
  cidade: "",
  uf: "",
  cartaoNum: "",
  cartaoNome: "",
  cartaoVal: "",
  cartaoCvv: "",
  parcelas: "1",
};

/* Cada mensagem nomeia o problema E o que fazer — "CPF inválido" não ajuda
   ninguém a corrigir. */
const REGRAS = [
  ["nome", (v) => v.length >= 3 && v.includes(" "), "Escreva seu nome completo, como está no documento."],
  ["email", emailValido, "Esse e-mail parece incompleto. Confira se falta o @ ou o final do domínio."],
  ["tel", (v) => v.replace(/\D/g, "").length >= 10, "Informe DDD e número, com pelo menos 10 dígitos."],
  ["cpf", cpfValido, "Esse CPF não é válido. Confira os números digitados."],
  ["cep", (v) => v.replace(/\D/g, "").length === 8, "O CEP tem 8 dígitos. Confira e digite novamente."],
  ["rua", (v) => v.length >= 3, "Informe o nome da rua."],
  ["numero", (v) => v.length >= 1, 'Informe o número. Se não houver, escreva "S/N".'],
  ["bairro", (v) => v.length >= 2, "Informe o bairro."],
  ["cidade", (v) => v.length >= 2, "Informe a cidade."],
  ["uf", (v) => v !== "", "Escolha o estado."],
];

const REGRAS_CARTAO = [
  ["cartaoNum", (v) => v.replace(/\D/g, "").length === 16, "O número do cartão tem 16 dígitos."],
  ["cartaoNome", (v) => v.length >= 3, "Escreva o nome exatamente como está impresso no cartão."],
  [
    "cartaoVal",
    validadeCartaoValida,
    "Validade no formato MM/AA, e o cartão precisa estar dentro do prazo.",
  ],
  ["cartaoCvv", (v) => v.length >= 3, "O CVV tem 3 ou 4 dígitos, atrás do cartão."],
];

const MASCARAS = {
  cep: mascaraCEP,
  cpf: mascaraCPF,
  tel: mascaraTelefone,
  cartaoNum: mascaraCartao,
  cartaoVal: mascaraValidade,
  cartaoCvv: (v) => v.replace(/\D/g, "").slice(0, 4),
};

export default function CheckoutCliente() {
  const { detalhados, subtotal, pronto, limpar } = useCarrinho();
  const mostrarToast = useToast();

  const [campos, setCampos] = useState(CAMPOS_INICIAIS);
  const [erros, setErros] = useState({});
  const [pagamento, setPagamento] = useState("pix");
  const [termos, setTermos] = useState(false);
  const [erroTermos, setErroTermos] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [pedido, setPedido] = useState(null);

  const formRef = useRef(null);

  const frete = campos.cep.replace(/\D/g, "").length === 8 ? calcularFrete(campos.cep, subtotal) : null;
  const total = subtotal + (frete ? frete.valor : 0);

  useEffect(() => {
    if (pedido) document.title = "Pedido registrado | acbolsa";
  }, [pedido]);

  function mudar(nome, valor) {
    const mascara = MASCARAS[nome];
    setCampos((atuais) => ({ ...atuais, [nome]: mascara ? mascara(valor) : valor }));
    /* O erro some assim que a pessoa corrige, não só no próximo envio. */
    if (erros[nome]) setErros((atuais) => ({ ...atuais, [nome]: "" }));
  }

  function validar() {
    const novos = {};
    const regras = pagamento === "cartao" ? REGRAS.concat(REGRAS_CARTAO) : REGRAS;

    regras.forEach(([nome, teste, mensagem]) => {
      if (!teste(String(campos[nome] ?? "").trim())) novos[nome] = mensagem;
    });

    setErros(novos);

    const faltaTermos = !termos;
    setErroTermos(faltaTermos ? "É preciso aceitar os termos para concluir o pedido." : "");

    return { nomes: Object.keys(novos), faltaTermos };
  }

  function aoEnviar(e) {
    e.preventDefault();

    const { nomes, faltaTermos } = validar();
    const quantos = nomes.length + (faltaTermos ? 1 : 0);

    if (quantos) {
      const primeiro = formRef.current?.querySelector(
        nomes.length ? "#" + paraId(nomes[0]) : "#termos"
      );
      primeiro?.focus();
      primeiro?.scrollIntoView({ block: "center" });
      mostrarToast(
        "Faltam " + quantos + (quantos === 1 ? " campo" : " campos") + " para concluir.",
        "erro"
      );
      return;
    }

    if (!frete) {
      mostrarToast("Informe um CEP válido para calcular o frete.", "erro");
      formRef.current?.querySelector("#cep")?.focus();
      return;
    }

    setEnviando(true);
    setTimeout(finalizar, 700);
  }

  function finalizar() {
    /* Este é o objeto a enviar ao backend, quando houver um. */
    const novo = {
      codigo: "AC" + Date.now().toString().slice(-8),
      data: new Date().toISOString(),
      cliente: {
        nome: campos.nome,
        email: campos.email,
        telefone: campos.tel,
        cpf: campos.cpf,
      },
      entrega: {
        cep: campos.cep,
        rua: campos.rua,
        numero: campos.numero,
        complemento: campos.compl || null,
        bairro: campos.bairro,
        cidade: campos.cidade,
        uf: campos.uf,
        regiao: frete.regiao,
        prazo: frete.prazo,
      },
      /* Dados de cartão NÃO entram no pedido salvo: sem servidor e sem
         gateway, guardá-los no navegador seria irresponsável. */
      pagamento: {
        forma: pagamento,
        parcelas: pagamento === "cartao" ? Number(campos.parcelas || 1) : 1,
      },
      itens: detalhados.map((i) => ({
        id: i.produto.id,
        nome: i.produto.nome,
        cor: i.produto.cor,
        preco: i.produto.preco,
        qtd: i.qtd,
      })),
      valores: { subtotal, frete: frete.valor, total: subtotal + frete.valor },
      status: "registrado",
    };

    /* O `pedido` já carrega uma cópia dos itens, então a confirmação
       continua de pé depois de esvaziar a sacola. */
    gravarPedido(novo);
    limpar();
    setEnviando(false);
    setPedido(novo);
    window.scrollTo(0, 0);
  }

  /* ---- Confirmação ---- */
  if (pedido) return <Confirmacao pedido={pedido} />;

  if (!pronto) return <div className="reserva-carregando" aria-hidden="true" />;

  /* ---- Sem itens: não há checkout a fazer ---- */
  if (!detalhados.length) {
    return (
      <div className="empty py-32">
        <IconeSacola />
        <h1>Não há nada para finalizar</h1>
        <p>Sua sacola está vazia. Escolha uma peça e volte aqui.</p>
        <Link className="btn btn-primary" href="/catalogo?cat=bolsas">
          Ver as bolsas
        </Link>
      </div>
    );
  }

  const campoProps = (nome, extras = {}) => ({
    id: paraId(nome),
    name: paraId(nome),
    value: campos[nome],
    onChange: (e) => mudar(nome, e.target.value),
    "aria-invalid": erros[nome] ? "true" : undefined,
    "aria-describedby": erros[nome] ? "e-" + paraId(nome) : extras.describedBy,
  });

  return (
    <>
      <div className="page-head page-head--checkout">
        <ol className="crumbs" role="list">
          <li>
            <Link href="/carrinho">Sacola</Link>
          </li>
          <li aria-current="page">Finalizar</li>
        </ol>
        <h1>Finalizar compra</h1>
      </div>

      <div className="checkout">
        <form noValidate onSubmit={aoEnviar} ref={formRef}>
          <div className="steps" aria-label="Etapas do pedido">
            <span className="step" aria-current="step">
              <span className="n">1</span>Seus dados
            </span>
            <span className="sep" aria-hidden="true" />
            <span className="step">
              <span className="n">2</span>Entrega
            </span>
            <span className="sep" aria-hidden="true" />
            <span className="step">
              <span className="n">3</span>Pagamento
            </span>
          </div>

          {/* ---- 1. Contato ---- */}
          <section className="form-section">
            <h2>Seus dados</h2>
            <div className="form-grid">
              <Campo nome="nome" rotulo="Nome completo" obrigatorio erro={erros.nome}>
                <input className="input" type="text" autoComplete="name" {...campoProps("nome")} />
              </Campo>

              <Campo nome="email" rotulo="E-mail" obrigatorio erro={erros.email} largura={1}>
                <input className="input" type="email" autoComplete="email" {...campoProps("email")} />
              </Campo>

              <Campo nome="tel" rotulo="Telefone" obrigatorio erro={erros.tel} largura={1}>
                <input
                  className="input"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="(11) 90000-0000"
                  {...campoProps("tel")}
                />
              </Campo>

              <Campo
                nome="cpf"
                rotulo="CPF"
                obrigatorio
                erro={erros.cpf}
                dica="Necessário para emitir a nota fiscal."
              >
                <input
                  className="input"
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  {...campoProps("cpf", { describedBy: "d-cpf" })}
                />
              </Campo>
            </div>
          </section>

          {/* ---- 2. Entrega ---- */}
          <section className="form-section">
            <h2>Endereço de entrega</h2>
            <div className="form-grid">
              <Campo nome="cep" rotulo="CEP" obrigatorio erro={erros.cep} largura={1}>
                <input
                  className="input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="00000-000"
                  {...campoProps("cep")}
                />
              </Campo>

              {frete && (
                <div className="field">
                  <span className="field-label">Entrega estimada</span>
                  <p className="frete-estimado">
                    {frete.regiao} · {frete.prazo}
                  </p>
                </div>
              )}

              <Campo nome="rua" rotulo="Endereço" obrigatorio erro={erros.rua}>
                <input
                  className="input"
                  type="text"
                  autoComplete="address-line1"
                  placeholder="Rua, avenida, travessa"
                  {...campoProps("rua")}
                />
              </Campo>

              <Campo nome="numero" rotulo="Número" obrigatorio erro={erros.numero} largura={1}>
                <input className="input" type="text" inputMode="numeric" {...campoProps("numero")} />
              </Campo>

              <Campo nome="compl" rotulo="Complemento" largura={1}>
                <input
                  className="input"
                  type="text"
                  autoComplete="address-line2"
                  placeholder="Apto, bloco, referência"
                  {...campoProps("compl")}
                />
              </Campo>

              <Campo nome="bairro" rotulo="Bairro" obrigatorio erro={erros.bairro} largura={1}>
                <input className="input" type="text" {...campoProps("bairro")} />
              </Campo>

              <Campo nome="cidade" rotulo="Cidade" obrigatorio erro={erros.cidade} largura={1}>
                <input
                  className="input"
                  type="text"
                  autoComplete="address-level2"
                  {...campoProps("cidade")}
                />
              </Campo>

              <Campo nome="uf" rotulo="Estado" obrigatorio erro={erros.uf}>
                <select className="select" autoComplete="address-level1" {...campoProps("uf")}>
                  <option value="">Selecione</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>
          </section>

          {/* ---- 3. Pagamento ---- */}
          <section className="form-section">
            <h2>Pagamento</h2>

            <div className="notice mb-6">
              <IconeAlerta />
              <p>
                <strong>Esta loja ainda não processa pagamentos.</strong> O pedido é registrado e
                você recebe o resumo, mas nenhuma cobrança é feita e nenhum dado de cartão é enviado
                a lugar nenhum.
              </p>
            </div>

            <div className="pay-list" role="radiogroup" aria-label="Forma de pagamento">
              {[
                { valor: "pix", titulo: "PIX", nota: "Aprovação imediata. O código aparece após a confirmação." },
                { valor: "cartao", titulo: "Cartão de crédito", nota: "Parcelamento em até 6× sem juros." },
                { valor: "boleto", titulo: "Boleto bancário", nota: "Compensação em até 3 dias úteis." },
              ].map((opcao) => (
                <label className="pay-opt" key={opcao.valor} data-selected={pagamento === opcao.valor}>
                  <input
                    type="radio"
                    name="pagamento"
                    value={opcao.valor}
                    checked={pagamento === opcao.valor}
                    onChange={() => setPagamento(opcao.valor)}
                  />
                  <span>
                    <span className="titulo">{opcao.titulo}</span>
                    <span className="nota">{opcao.nota}</span>
                  </span>
                </label>
              ))}
            </div>

            {/* Campos de cartão — só existem no DOM quando a opção é
                escolhida. Não basta escondê-los: enquanto ocultos eles não
                podem ser preenchidos, validados nem enviados, e a promessa
                de que o dado não sai daqui vira estrutura, não intenção. */}
            {pagamento === "cartao" && (
              <div className="pay-detail">
                <div className="form-grid">
                  <Campo
                    nome="cartaoNum"
                    rotulo="Número do cartão"
                    obrigatorio
                    erro={erros.cartaoNum}
                  >
                    <input
                      className="input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="0000 0000 0000 0000"
                      {...campoProps("cartaoNum")}
                    />
                  </Campo>

                  <Campo
                    nome="cartaoNome"
                    rotulo="Nome impresso no cartão"
                    obrigatorio
                    erro={erros.cartaoNome}
                  >
                    <input className="input" type="text" autoComplete="off" {...campoProps("cartaoNome")} />
                  </Campo>

                  <Campo nome="cartaoVal" rotulo="Validade" obrigatorio erro={erros.cartaoVal} largura={1}>
                    <input
                      className="input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="MM/AA"
                      {...campoProps("cartaoVal")}
                    />
                  </Campo>

                  <Campo nome="cartaoCvv" rotulo="CVV" obrigatorio erro={erros.cartaoCvv} largura={1}>
                    <input
                      className="input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="000"
                      maxLength={4}
                      {...campoProps("cartaoCvv")}
                    />
                  </Campo>

                  <Campo nome="parcelas" rotulo="Parcelas">
                    <select className="select" {...campoProps("parcelas")}>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}× de {formatarPreco(total / n)}
                          {n === 1 ? " à vista" : " sem juros"}
                        </option>
                      ))}
                    </select>
                  </Campo>
                </div>
              </div>
            )}
          </section>

          <label className="checkbox mt-10">
            <input
              id="termos"
              type="checkbox"
              checked={termos}
              onChange={(e) => {
                setTermos(e.target.checked);
                setErroTermos("");
              }}
            />
            <span>
              Li e aceito os{" "}
              <Link className="link-underline" href="/ajuda#termos">
                termos de uso
              </Link>{" "}
              e a{" "}
              <Link className="link-underline" href="/ajuda#privacidade">
                política de privacidade
              </Link>
              .
            </span>
          </label>
          <p className="field-error" role="alert">
            {erroTermos}
          </p>

          <button
            className={"btn btn-primary btn-lg btn-block mt-6" + (enviando ? " btn-loading" : "")}
            type="submit"
          >
            Registrar pedido
          </button>

          <p className="field-hint mt-3 text-center">
            Nenhuma cobrança será feita.
          </p>
        </form>

        {/* ---- Resumo ---- */}
        <aside className="summary">
          <h2>Seu pedido</h2>

          <div className="summary-items">
            {detalhados.map(({ produto, qtd, subtotal: linha }) => (
              <div className="summary-item" key={produto.id}>
                <MidiaProduto produto={produto} proporcao="square" />
                <div>
                  <div className="nome">{produto.nome}</div>
                  <div className="qtd">
                    {qtd} × {formatarPreco(produto.preco)}
                  </div>
                </div>
                <span className="v">{formatarPreco(linha)}</span>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span className="v">{formatarPreco(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Frete</span>
            <span className="v">
              {!frete ? "informe o CEP" : frete.gratis ? "grátis" : formatarPreco(frete.valor)}
            </span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span className="v">{formatarPreco(total)}</span>
          </div>
          <p className="summary-note">
            Frete grátis em pedidos acima de {formatarPreco(FRETE.gratisAcima)}.
          </p>
        </aside>
      </div>
    </>
  );
}

/* Nomes de estado em camelCase viram ids em kebab: `cartaoNum` -> `cartao-num`,
   preservando os ids da versão anterior. */
function paraId(nome) {
  return nome.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function Campo({ nome, rotulo, obrigatorio, erro, dica, largura = 2, children }) {
  const id = paraId(nome);
  return (
    <div className={"field" + (largura === 2 ? " span-2" : "")}>
      <label className="field-label" htmlFor={id}>
        {rotulo}
        {obrigatorio && (
          <span className="req" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {dica && (
        <p className="field-hint" id={"d-" + id}>
          {dica}
        </p>
      )}
      <p className="field-error" id={"e-" + id} role="alert">
        {erro}
      </p>
    </div>
  );
}

function Confirmacao({ pedido }) {
  return (
    <div className="confirm">
      <div className="confirm-mark">
        <IconeCheck />
      </div>
      <h1>Pedido registrado</h1>
      <p className="lead mx-auto mt-4">
        Guardamos os dados do seu pedido. Como esta loja ainda não processa pagamentos,{" "}
        <strong>nenhuma cobrança foi feita</strong> — a acbolsa entra em contato pelo e-mail
        informado para combinar o pagamento e o envio.
      </p>

      <div className="order-box">
        <dl>
          <div className="spec-row">
            <dt>Código</dt>
            <dd>{pedido.codigo}</dd>
          </div>
          <div className="spec-row">
            <dt>Itens</dt>
            <dd>
              {pedido.itens.map((i) => (
                <span key={i.id}>
                  {i.qtd}× {i.nome}
                  <br />
                </span>
              ))}
            </dd>
          </div>
          <div className="spec-row">
            <dt>Entrega</dt>
            <dd>
              {pedido.entrega.rua}, {pedido.entrega.numero}
              <br />
              {pedido.entrega.bairro} — {pedido.entrega.cidade}/{pedido.entrega.uf}
              <br />
              {pedido.entrega.cep}
            </dd>
          </div>
          <div className="spec-row">
            <dt>Prazo</dt>
            <dd>{pedido.entrega.prazo}</dd>
          </div>
          <div className="spec-row">
            <dt>Pagamento</dt>
            <dd>
              {FORMAS_NOME[pedido.pagamento.forma] || pedido.pagamento.forma}
              {pedido.pagamento.parcelas > 1 && " em " + pedido.pagamento.parcelas + "×"}{" "}
              <span className="texto-suave">(a combinar)</span>
            </dd>
          </div>
          <div className="spec-row">
            <dt>Total</dt>
            <dd>
              <strong>{formatarPreco(pedido.valores.total)}</strong>
            </dd>
          </div>
        </dl>
      </div>

      <div className="confirm-acoes">
        <Link className="btn btn-primary" href="/conta#pedidos">
          Ver meus pedidos
        </Link>
        <Link className="btn btn-ghost" href="/catalogo">
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}
