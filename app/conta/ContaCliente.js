"use client";

/* =========================================================================
   acbolsa — minha conta
   =========================================================================

   Sem login: lê os pedidos que o checkout gravou neste navegador. O aviso no
   topo da página diz isso à cliente em vez de deixá-la achar que perdeu o
   histórico ao trocar de aparelho.
   ========================================================================= */

import { useState } from "react";
import Link from "next/link";
import { formatarPreco } from "@/lib/catalog";
import { CHAVE_PEDIDOS, lerPedidos } from "@/lib/formulario";
import { useToast } from "@/components/ToastContexto";
import useHidratado from "@/components/useHidratado";
import { IconeAlerta, IconeCaixa, IconeCaminhao, IconeConta } from "@/components/Icones";

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

/* localStorage e `location.hash` não existem no servidor. Enquanto não
   hidrata, renderiza a mesma coisa que o servidor renderizou; depois disso o
   `key` troca e o componente de dentro nasce já com os valores certos — sem
   um efeito sincronizando estado depois do primeiro render. */
export default function ContaCliente() {
  const hidratado = useHidratado();

  if (!hidratado) return <Conta pedidos={[]} abaInicial="pedidos" pronto={false} key="servidor" />;

  const alvo = window.location.hash.replace("#", "");
  return (
    <Conta
      key="cliente"
      pedidos={lerPedidos()}
      abaInicial={ABAS.some((a) => a.id === alvo) ? alvo : "pedidos"}
      pronto
    />
  );
}

function Conta({ pedidos, abaInicial, pronto }) {
  const [aba, setAba] = useState(abaInicial);

  function abrirAba(id) {
    setAba(id);
    /* `replaceState` em vez de push: alternar aba não é navegação que a
       pessoa espera desfazer com o botão voltar. */
    window.history.replaceState(null, "", "#" + id);
  }

  return (
    <>
      <div className="notice mt-8">
        <IconeAlerta />
        <p>
          <strong>Esta área ainda não tem login.</strong> Sem servidor, os pedidos ficam guardados
          apenas neste navegador — quem abrir o site em outro aparelho não os verá.
        </p>
      </div>

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
            {pronto && <ListaPedidos pedidos={pedidos} />}
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
            {pronto && <MeusDados ultimo={pedidos[0]} />}
          </section>
        </div>
      </div>
    </>
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
      setErro(
        "Não encontramos esse código neste navegador. Confira o código no e-mail de confirmação."
      );
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

      {/* Sem integração com transportadora: mostra o que a loja realmente
          sabe, e diz de onde virá o resto. */}
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

function MeusDados({ ultimo }) {
  const mostrarToast = useToast();

  if (!ultimo) {
    return (
      <div className="empty py-14">
        <IconeConta />
        <h3>Nenhum dado salvo</h3>
        <p>
          Seus dados de entrega ficam guardados aqui depois do primeiro pedido, para você não
          digitar tudo de novo.
        </p>
      </div>
    );
  }

  function apagar() {
    if (
      !window.confirm(
        "Apagar todos os pedidos e dados guardados neste navegador? Isso não pode ser desfeito."
      )
    ) {
      return;
    }
    try {
      window.localStorage.removeItem(CHAVE_PEDIDOS);
    } catch {
      /* Armazenamento indisponível: não havia o que apagar. */
    }
    mostrarToast("Dados apagados deste navegador.");
    setTimeout(() => window.location.reload(), 800);
  }

  return (
    <>
      <div className="order-box order-box--solto">
        <dl>
          <div className="spec-row">
            <dt>Nome</dt>
            <dd>{ultimo.cliente.nome}</dd>
          </div>
          <div className="spec-row">
            <dt>E-mail</dt>
            <dd>{ultimo.cliente.email}</dd>
          </div>
          <div className="spec-row">
            <dt>Telefone</dt>
            <dd>{ultimo.cliente.telefone}</dd>
          </div>
          <div className="spec-row">
            <dt>Endereço</dt>
            <dd>
              {ultimo.entrega.rua}, {ultimo.entrega.numero}
              {ultimo.entrega.complemento && " — " + ultimo.entrega.complemento}
              <br />
              {ultimo.entrega.bairro}
              <br />
              {ultimo.entrega.cidade}/{ultimo.entrega.uf} — {ultimo.entrega.cep}
            </dd>
          </div>
        </dl>
      </div>

      <p className="field-hint mt-4">
        Dados do último pedido, guardados neste navegador.
      </p>

      {/* LGPD: a pessoa precisa conseguir apagar o que foi guardado sobre
          ela, sem depender de e-mail para a loja. */}
      <button className="btn btn-ghost mt-6" type="button" onClick={apagar}>
        Apagar meus dados deste navegador
      </button>
    </>
  );
}
