"use client";

/* =========================================================================
   acbolsa — checkout
   =========================================================================

   O formulário coleta contato e entrega e registra o pedido no Supabase
   (atrelado à conta logada). O PAGAMENTO acontece num checkout externo: a
   tela de confirmação leva a `checkout_url`. Enquanto `EXTERNAL_CHECKOUT_BASE_URL`
   não estiver configurada, a confirmação diz isso com honestidade em vez de
   um botão que não leva a lugar nenhum.

   Nenhum dado de pagamento passa por aqui — quem cuida disso é o provedor
   externo.
   ========================================================================= */

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { formatarPreco } from "@/lib/catalog";
import {
  FRETE,
  TIPOS_LOGRADOURO,
  UFS,
  calcularFrete,
  cnpjValido,
  cpfValido,
  emailValido,
  mascaraCEP,
  mascaraCpfCnpj,
  mascaraTelefone,
} from "@/lib/formulario";
import { criarPedido } from "./acoes";
import { useCarrinho } from "@/components/CarrinhoContexto";
import { useToast } from "@/components/ToastContexto";
import { Campo, paraId } from "@/components/Campo";
import { MidiaProduto } from "@/components/Placeholder";
import { IconeAlerta, IconeCheck, IconeSacola } from "@/components/Icones";

const CAMPOS_INICIAIS = {
  tipoPessoa: "PF",
  nome: "",
  razaoSocial: "",
  email: "",
  tel: "",
  cpf: "",
  cep: "",
  tipoLogradouro: "Rua",
  rua: "",
  numero: "",
  compl: "",
  bairro: "",
  cidade: "",
  uf: "",
  referencia: "",
};

/* Cada mensagem nomeia o problema E o que fazer. As regras de documento e
   razão social mudam conforme pessoa física ou jurídica. */
function regrasPara(tipoPessoa) {
  const pj = tipoPessoa === "PJ";
  return [
    ["nome", (v) => v.length >= 3 && v.includes(" "),
      pj ? "Escreva o nome do responsável pelo pedido." : "Escreva seu nome completo, como está no documento."],
    ...(pj
      ? [["razaoSocial", (v) => v.length >= 3, "Informe a razão social — é o que vai na etiqueta e na nota."]]
      : []),
    ["email", emailValido, "Esse e-mail parece incompleto. Confira se falta o @ ou o final do domínio."],
    ["tel", (v) => v.replace(/\D/g, "").length >= 10, "Informe DDD e número, com pelo menos 10 dígitos."],
    ["cpf", pj ? cnpjValido : cpfValido,
      pj ? "CNPJ inválido. Confira os 14 números." : "CPF inválido. Confira os números digitados."],
    ["cep", (v) => v.replace(/\D/g, "").length === 8, "O CEP tem 8 dígitos. Confira e digite novamente."],
    ["rua", (v) => v.length >= 3, "Informe o nome do logradouro (sem o tipo)."],
    ["numero", (v) => v.length >= 1, 'Informe o número. Se não houver, escreva "S/N".'],
    ["bairro", (v) => v.length >= 2, "Informe o bairro."],
    ["cidade", (v) => v.length >= 2, "Informe a cidade."],
    ["uf", (v) => v !== "", "Escolha o estado."],
  ];
}

const MASCARAS = {
  cep: mascaraCEP,
  cpf: mascaraCpfCnpj,
  tel: mascaraTelefone,
};

export default function CheckoutCliente({ inicial }) {
  const { detalhados, subtotal, pronto, limpar } = useCarrinho();
  const mostrarToast = useToast();

  const [campos, setCampos] = useState({ ...CAMPOS_INICIAIS, ...(inicial || {}) });
  const [erros, setErros] = useState({});
  const [termos, setTermos] = useState(false);
  const [erroTermos, setErroTermos] = useState("");
  const [enviando, iniciarEnvio] = useTransition();
  const [pedido, setPedido] = useState(null);

  const formRef = useRef(null);

  const frete =
    campos.cep.replace(/\D/g, "").length === 8 ? calcularFrete(campos.cep, subtotal) : null;
  const total = subtotal + (frete ? frete.valor : 0);

  useEffect(() => {
    if (pedido) document.title = "Pedido registrado | acbolsa";
  }, [pedido]);

  function mudar(nome, valor) {
    const mascara = MASCARAS[nome];
    setCampos((atuais) => ({ ...atuais, [nome]: mascara ? mascara(valor) : valor }));
    if (erros[nome]) setErros((atuais) => ({ ...atuais, [nome]: "" }));
  }

  function validar() {
    const novos = {};
    regrasPara(campos.tipoPessoa).forEach(([nome, teste, mensagem]) => {
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

    iniciarEnvio(async () => {
      const resultado = await criarPedido({
        itens: detalhados.map((i) => ({ id: i.produto.id, qtd: i.qtd })),
        contato: {
          tipo: campos.tipoPessoa,
          nome: campos.nome,
          razaoSocial: campos.tipoPessoa === "PJ" ? campos.razaoSocial : null,
          email: campos.email,
          telefone: campos.tel,
          cpf: campos.cpf,
        },
        entrega: {
          cep: campos.cep,
          tipoLogradouro: campos.tipoLogradouro,
          rua: campos.rua,
          numero: campos.numero,
          complemento: campos.compl || null,
          bairro: campos.bairro,
          cidade: campos.cidade,
          uf: campos.uf,
          pais: "BR",
          referencia: campos.referencia || null,
        },
      });

      if (resultado?.erro) {
        mostrarToast(resultado.erro, "erro");
        return;
      }

      /* O `pedido` já carrega uma cópia dos itens, então a confirmação
         continua de pé depois de esvaziar a sacola. */
      limpar();
      setPedido(resultado.pedido);
      window.scrollTo(0, 0);
    });
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

            <fieldset className="tipo-pessoa">
              <legend className="field-label">Comprando como</legend>
              {[
                ["PF", "Pessoa física"],
                ["PJ", "Pessoa jurídica"],
              ].map(([valor, rotulo]) => (
                <label className="radio-inline" key={valor} data-selected={campos.tipoPessoa === valor}>
                  <input
                    type="radio"
                    name="tipo-pessoa"
                    value={valor}
                    checked={campos.tipoPessoa === valor}
                    onChange={() => {
                      setCampos((a) => ({ ...a, tipoPessoa: valor }));
                      setErros((a) => ({ ...a, cpf: "", razaoSocial: "" }));
                    }}
                  />
                  <span>{rotulo}</span>
                </label>
              ))}
            </fieldset>

            <div className="form-grid">
              <Campo
                nome="nome"
                rotulo={campos.tipoPessoa === "PJ" ? "Nome do responsável" : "Nome completo"}
                obrigatorio
                erro={erros.nome}
              >
                <input className="input" type="text" autoComplete="name" {...campoProps("nome")} />
              </Campo>

              {campos.tipoPessoa === "PJ" && (
                <Campo
                  nome="razaoSocial"
                  rotulo="Razão social"
                  obrigatorio
                  erro={erros.razaoSocial}
                  dica="Como está no cartão CNPJ — é o que vai na etiqueta e na nota."
                >
                  <input
                    className="input"
                    type="text"
                    autoComplete="organization"
                    {...campoProps("razaoSocial", { describedBy: "d-razao-social" })}
                  />
                </Campo>
              )}

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
                rotulo={campos.tipoPessoa === "PJ" ? "CNPJ" : "CPF"}
                obrigatorio
                erro={erros.cpf}
                dica="Obrigatório para a nota fiscal e para liberar a encomenda na alfândega."
              >
                <input
                  className="input"
                  type="text"
                  inputMode="numeric"
                  placeholder={campos.tipoPessoa === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
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

              <Campo nome="tipoLogradouro" rotulo="Tipo" obrigatorio erro={erros.tipoLogradouro} largura={1}>
                <select className="select" {...campoProps("tipoLogradouro")}>
                  {TIPOS_LOGRADOURO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo nome="rua" rotulo="Logradouro" obrigatorio erro={erros.rua} largura={1}>
                <input
                  className="input"
                  type="text"
                  autoComplete="address-line1"
                  placeholder="Só o nome — sem 'Rua', 'Av.'…"
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
                  placeholder="Apto, bloco, casa"
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

              <Campo nome="uf" rotulo="Estado" obrigatorio erro={erros.uf} largura={1}>
                <select className="select" autoComplete="address-level1" {...campoProps("uf")}>
                  <option value="">Selecione</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo
                nome="referencia"
                rotulo="Ponto de referência"
                erro={erros.referencia}
                largura={1}
                dica="Opcional. Ajuda o entregador a achar o endereço."
              >
                <input
                  className="input"
                  type="text"
                  placeholder="Ex.: ao lado da padaria"
                  {...campoProps("referencia", { describedBy: "d-referencia" })}
                />
              </Campo>
            </div>
          </section>

          {/* ---- 3. Pagamento ---- */}
          <section className="form-section">
            <h2>Pagamento</h2>
            <div className="notice mb-6">
              <IconeAlerta />
              <p>
                O pagamento é feito em uma página segura do nosso parceiro de checkout. Ao
                registrar o pedido você é levada até lá — <strong>nenhum dado de cartão passa
                por este site</strong>.
              </p>
            </div>
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
            disabled={enviando}
          >
            Registrar pedido e ir para o pagamento
          </button>
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

function Confirmacao({ pedido }) {
  return (
    <div className="confirm">
      <div className="confirm-mark">
        <IconeCheck />
      </div>
      <h1>Pedido registrado</h1>
      <p className="lead mx-auto mt-4">
        Guardamos o pedido <strong>{pedido.codigo}</strong> na sua conta.{" "}
        {pedido.checkoutUrl
          ? "Falta o pagamento — o botão abaixo leva à página segura do checkout."
          : "O pagamento externo ainda não está configurado; a acbolsa entra em contato pelo e-mail informado para combinar o pagamento e o envio."}
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
            <dt>Total</dt>
            <dd>
              <strong>{formatarPreco(pedido.valores.total)}</strong>
            </dd>
          </div>
        </dl>
      </div>

      <div className="confirm-acoes">
        {pedido.checkoutUrl ? (
          <a className="btn btn-primary" href={pedido.checkoutUrl}>
            Ir para o pagamento
          </a>
        ) : (
          <button className="btn btn-primary" type="button" disabled>
            Pagamento externo em configuração
          </button>
        )}
        <Link className="btn btn-ghost" href="/conta#pedidos">
          Ver meus pedidos
        </Link>
      </div>
    </div>
  );
}
