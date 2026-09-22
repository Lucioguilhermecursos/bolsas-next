"use client";

/* =========================================================================
   acbolsa — painel do vendedor (interface)
   =========================================================================

   Recebe os pedidos já resolvidos do servidor (app/painel/page.js). Duas
   abas: lista com busca/filtro (client-side, volume pequeno) e métricas
   (Metricas.js, que importa STATUS_ROTULO daqui).
   ========================================================================= */

import { useMemo, useState } from "react";
import { formatarPreco } from "@/lib/catalog";
import { IconeCaixa, IconeGrafico } from "@/components/Icones";
import Metricas from "./Metricas";

export const STATUS_ROTULO = {
  registrado: "Registrado",
  pago: "Pago",
  pagamento_falhou: "Pagamento recusado",
  expirado: "Pagamento expirado",
  cancelado: "Cancelado",
};

const ABAS = [
  { id: "pedidos", rotulo: "Pedidos", Icone: IconeCaixa },
  { id: "metricas", rotulo: "Métricas", Icone: IconeGrafico },
];

const PROVEDOR_ROTULO = {
  stripe: "Stripe",
  mercadopago: "Mercado Pago",
  externo: "Link externo",
};

function dataHoraBR(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* YYYY-MM-DD local (não UTC) — pra comparar com o valor de <input type="date">,
   que também é local. Um pedido feito às 21h já é "hoje" pro vendedor, mesmo
   que em UTC já seja amanhã. Exportado: Metricas.js usa o mesmo filtro de data. */
export function dataLocalISO(iso) {
  const d = new Date(iso);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export default function PainelVendedor({ pedidos }) {
  const [aba, setAba] = useState("pedidos");
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [dataDe, setDataDe] = useState("");
  const [dataAte, setDataAte] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return pedidos.filter((p) => {
      if (statusFiltro !== "todos" && p.status !== statusFiltro) return false;
      const dataPedido = dataLocalISO(p.data);
      if (dataDe && dataPedido < dataDe) return false;
      if (dataAte && dataPedido > dataAte) return false;
      if (!termo) return true;
      return (
        p.codigo.toLowerCase().includes(termo) ||
        (p.cliente?.nome || "").toLowerCase().includes(termo) ||
        (p.cliente?.email || "").toLowerCase().includes(termo)
      );
    });
  }, [pedidos, busca, statusFiltro, dataDe, dataAte]);

  const temFiltro = busca || statusFiltro !== "todos" || dataDe || dataAte;
  function limparFiltros() {
    setBusca("");
    setStatusFiltro("todos");
    setDataDe("");
    setDataAte("");
  }

  if (!pedidos.length) {
    return (
      <div className="empty py-14">
        <IconeCaixa />
        <h3>Nenhum pedido ainda</h3>
        <p>Quando alguém comprar, o pedido aparece aqui.</p>
      </div>
    );
  }

  return (
    <div className="account">
      <nav className="account-nav" aria-label="Seções do painel">
        {ABAS.map(({ id, rotulo, Icone }) => (
          <button key={id} type="button" aria-current={aba === id ? "true" : undefined} onClick={() => setAba(id)}>
            <Icone />
            {rotulo}
          </button>
        ))}
      </nav>

      <div>
        <section className="panel" hidden={aba !== "pedidos"} aria-labelledby="t-pedidos">
          <h2 id="t-pedidos" className="h-section mb-8">
            Pedidos
          </h2>

          <div className="painel-filtros">
            <div className="field flex-1">
              <label className="sr-only" htmlFor="busca">
                Buscar pedido
              </label>
              <input
                className="input"
                id="busca"
                type="text"
                placeholder="Buscar por código, nome ou e-mail"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="field field-status">
              <label className="sr-only" htmlFor="status-filtro">
                Filtrar por status
              </label>
              <select
                className="select"
                id="status-filtro"
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <option value="todos">Todos os status</option>
                {Object.entries(STATUS_ROTULO).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>
                    {rotulo}
                  </option>
                ))}
              </select>
            </div>
            <div className="field field-data">
              <label className="sr-only" htmlFor="data-de">
                De
              </label>
              <input
                className="input"
                id="data-de"
                type="date"
                value={dataDe}
                max={dataAte || undefined}
                onChange={(e) => setDataDe(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
              />
            </div>
            <div className="field field-data">
              <label className="sr-only" htmlFor="data-ate">
                Até
              </label>
              <input
                className="input"
                id="data-ate"
                type="date"
                value={dataAte}
                min={dataDe || undefined}
                onChange={(e) => setDataAte(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
              />
            </div>
          </div>

          <p className="field-hint mb-4">
            {filtrados.length} de {pedidos.length} pedido{pedidos.length === 1 ? "" : "s"}
            {temFiltro && (
              <button
                type="button"
                className="link-underline ml-3"
                style={{ background: "none", border: 0, padding: 0, font: "inherit", cursor: "pointer" }}
                onClick={limparFiltros}
              >
                Limpar filtros
              </button>
            )}
          </p>

          {filtrados.length === 0 ? (
            <p className="field-hint">Nenhum pedido encontrado para essa busca.</p>
          ) : (
            filtrados.map((p) => <PedidoAdmin key={p.codigo} p={p} />)
          )}
        </section>

        <section className="panel" hidden={aba !== "metricas"} aria-labelledby="t-metricas">
          <h2 id="t-metricas" className="h-section mb-8">
            Métricas
          </h2>
          <Metricas pedidos={pedidos} />
        </section>
      </div>
    </div>
  );
}

function PedidoAdmin({ p }) {
  return (
    <article className="order-card">
      <div className="order-card-head">
        <div>
          <p className="codigo">{p.codigo}</p>
          <p className="data">{dataHoraBR(p.data)}</p>
        </div>
        <span className="status" data-status={p.status}>
          {STATUS_ROTULO[p.status] || p.status}
        </span>
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

      <dl className="mt-4">
        <div className="spec-row">
          <dt>Cliente</dt>
          <dd>
            {p.cliente?.nome || "—"}
            <br />
            {p.cliente?.email}
            {p.cliente?.telefone ? " · " + p.cliente.telefone : ""}
          </dd>
        </div>
        {p.cliente?.cpf && (
          <div className="spec-row">
            <dt>CPF/CNPJ</dt>
            <dd>{p.cliente.cpf}</dd>
          </div>
        )}
        <div className="spec-row">
          <dt>Endereço</dt>
          <dd>
            {p.entrega.rua}, {p.entrega.numero}
            {p.entrega.complemento ? ", " + p.entrega.complemento : ""}
            <br />
            {p.entrega.bairro} · {p.entrega.cidade}/{p.entrega.uf} · {p.entrega.cep}
          </dd>
        </div>
        <div className="spec-row">
          <dt>Pagamento</dt>
          <dd>
            {PROVEDOR_ROTULO[p.pagamento.provedor] || "Sem provedor"}
            {p.pagamento.pagoEm ? " · pago em " + dataHoraBR(p.pagamento.pagoEm) : ""}
          </dd>
        </div>
        {p.pagamento.referencia && (
          <div className="spec-row">
            <dt>Referência</dt>
            <dd className="texto-suave">{p.pagamento.referencia}</dd>
          </div>
        )}
        {p.envio?.codigo && (
          <div className="spec-row">
            <dt>Rastreio</dt>
            <dd>
              {p.envio.codigo}
              {p.envio.transportadora ? " · " + p.envio.transportadora : ""}
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}
