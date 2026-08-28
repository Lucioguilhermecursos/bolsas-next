"use client";

/* =========================================================================
   acbolsa — minha conta (interface)
   =========================================================================

   Recebe pedidos e perfil já resolvidos do servidor (app/conta/page.js). Aqui
   só mora o estado de interface: qual aba está aberta e a busca de rastreio.
   ========================================================================= */

import { useState } from "react";
import Link from "next/link";
import { formatarPreco } from "@/lib/catalog";
import { IconeCaixa, IconeCaminhao, IconeConta } from "@/components/Icones";

const ABAS = [
  { id: "pedidos", rotulo: "Meus pedidos", Icone: IconeCaixa },
  { id: "rastreio", rotulo: "Rastreamento", Icone: IconeCaminhao },
  { id: "dados", rotulo: "Meus dados", Icone: IconeConta },
];

function dataBR(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ContaCliente({ pedidos, perfil, email }) {
  const [aba, setAba] = useState("pedidos");

  function abrirAba(id) {
    setAba(id);
    window.history.replaceState(null, "", "#" + id);
  }

  return (
    <div className="account">
      <nav className="account-nav" aria-label="Seções da conta">
        {ABAS.map(({ id, rotulo, Icone }) => (
          <button
            key={id}
            type="button"
            aria-current={aba === id ? "true" : undefined}
            onClick={() => abrirAba(id)}
          >
            <Icone />
            {rotulo}
          </button>
        ))}
      </nav>

      <div>
        <section className="panel" hidden={aba !== "pedidos"} aria-labelledby="t-pedidos">
          <h2 id="t-pedidos" className="h-section mb-8">
            Meus pedidos
          </h2>
          <ListaPedidos pedidos={pedidos} />
        </section>

        <section className="panel" hidden={aba !== "rastreio"} aria-labelledby="t-rastreio">
          <h2 id="t-rastreio" className="h-section mb-4">
            Rastrear entrega
          </h2>
          <p className="lead mb-8">
            Informe o código do pedido para ver a situação da entrega.
          </p>
          <Rastreio pedidos={pedidos} />
        </section>

        <section className="panel" hidden={aba !== "dados"} aria-labelledby="t-dados">
          <h2 id="t-dados" className="h-section mb-8">
            Meus dados
          </h2>
          <MeusDados perfil={perfil} email={email} ultimo={pedidos[0]} />
        </section>
      </div>
    </div>
  );
}

function ListaPedidos({ pedidos }) {
  if (!pedidos.length) {
    return (
      <div className="empty py-14">
        <IconeCaixa />
        <h3>Você ainda não fez pedidos</h3>
        <p>Quando fizer, o resumo de cada um aparece aqui.</p>
        <Link className="btn btn-primary" href="/catalogo?cat=bolsas">
          Ver as bolsas
        </Link>
      </div>
    );
  }

  return pedidos.map((p) => (
    <article className="order-card" key={p.codigo}>
      <div className="order-card-head">
        <div>
          <p className="codigo">{p.codigo}</p>
          <p className="data">{dataBR(p.data)}</p>
        </div>
        <span className="status">{p.status === "registrado" ? "Registrado" : p.status}</span>
      </div>

      <div className="order-itens">
        {p.itens.map((i) => (
          <div className="order-item" key={i.id}>
            <span>
              {i.qtd}× {i.nome} <span className="texto-suave">· {i.cor}</span>
            </span>
            <span className="price">{formatarPreco(i.preco * i.qtd)}</span>
          </div>
        ))}
      </div>

      <div className="order-total">
        <span>Total</span>
        <span className="price">{formatarPreco(p.valores.total)}</span>
      </div>

      <p className="field-hint mt-3">
        Entrega em {p.entrega.cidade}/{p.entrega.uf} · {p.entrega.prazo}
      </p>

      {p.checkoutUrl && p.status === "registrado" && (
        <a className="btn btn-primary btn-sm mt-4" href={p.checkoutUrl}>
          Ir para o pagamento
        </a>
      )}
    </article>
  ));
}

function Rastreio({ pedidos }) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [achado, setAchado] = useState(null);

  function aoEnviar(e) {
    e.preventDefault();
    setErro("");
    setAchado(null);

    const busca = codigo.trim().toUpperCase();
    if (!busca) {
      setErro("Digite o código do pedido, que começa com AC.");
      return;
    }

    const pedido = pedidos.find((p) => p.codigo.toUpperCase() === busca);
    if (!pedido) {
      setErro("Não encontramos esse código na sua conta. Confira o código no e-mail de confirmação.");
      return;
    }
    setAchado(pedido);
  }

  return (
    <>
      <form className="form-rastreio" onSubmit={aoEnviar} noValidate>
        <div className="field flex-1">
          <label className="sr-only" htmlFor="codigo">
            Código do pedido
          </label>
          <input
            className="input"
            id="codigo"
            type="text"
            placeholder="AC00000000"
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value);
              if (erro) setErro("");
            }}
          />
        </div>
        <button className="btn btn-dark" type="submit">
          Buscar
        </button>
      </form>

      <p className="field-error mt-3" role="alert">
        {erro}
      </p>

      {achado && (
        <div className="mt-10">
          <div className="order-box order-box--solto">
            <dl>
              <div className="spec-row">
                <dt>Pedido</dt>
                <dd>{achado.codigo}</dd>
              </div>
              <div className="spec-row">
                <dt>Situação</dt>
                <dd>Registrado, aguardando confirmação de pagamento</dd>
              </div>
              <div className="spec-row">
                <dt>Destino</dt>
                <dd>
                  {achado.entrega.cidade}/{achado.entrega.uf} — {achado.entrega.cep}
                </dd>
              </div>
              <div className="spec-row">
                <dt>Prazo</dt>
                <dd>
                  {achado.entrega.prazo} <span className="texto-suave">(a contar do envio)</span>
                </dd>
              </div>
            </dl>
            <p className="field-hint mt-4">
              O código de rastreio da transportadora é enviado por e-mail quando a peça sai para
              entrega.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function MeusDados({ perfil, email, ultimo }) {
  const nome = perfil?.nome || ultimo?.cliente?.nome;
  const telefone = perfil?.telefone || ultimo?.cliente?.telefone;
  const endereco = perfil?.endereco || ultimo?.entrega;

  if (!nome && !endereco) {
    return (
      <div className="empty py-14">
        <IconeConta />
        <h3>Nada por aqui ainda</h3>
        <p>
          Seus dados de entrega ficam guardados aqui depois do primeiro pedido, para você não
          digitar tudo de novo.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="order-box order-box--solto">
        <dl>
          <div className="spec-row">
            <dt>Nome</dt>
            <dd>{nome || "—"}</dd>
          </div>
          <div className="spec-row">
            <dt>E-mail</dt>
            <dd>{email}</dd>
          </div>
          <div className="spec-row">
            <dt>Telefone</dt>
            <dd>{telefone || "—"}</dd>
          </div>
          {endereco && (
            <div className="spec-row">
              <dt>Endereço</dt>
              <dd>
                {endereco.rua}, {endereco.numero}
                {endereco.complemento && " — " + endereco.complemento}
                <br />
                {endereco.bairro}
                <br />
                {endereco.cidade}/{endereco.uf} — {endereco.cep}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <p className="field-hint mt-4">
        Guardado da sua conta e do último pedido. Para corrigir, é só preencher no próximo
        checkout.
      </p>
    </>
  );
}
