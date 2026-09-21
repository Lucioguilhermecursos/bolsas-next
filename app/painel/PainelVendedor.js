"use client";

/* =========================================================================
   acbolsa — painel do vendedor (interface)
   =========================================================================

   Recebe os pedidos já resolvidos do servidor (app/painel/page.js). Aqui só
   mora busca e filtro por status — client-side, porque o volume é pequeno.
   ========================================================================= */

import { useMemo, useState } from "react";
import { formatarPreco } from "@/lib/catalog";
import { IconeCaixa } from "@/components/Icones";

const STATUS_ROTULO = {
  registrado: "Registrado",
  pago: "Pago",
  pagamento_falhou: "Pagamento recusado",
  expirado: "Pagamento expirado",
  cancelado: "Cancelado",
};

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

export default function PainelVendedor({ pedidos }) {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return pedidos.filter((p) => {
      if (statusFiltro !== "todos" && p.status !== statusFiltro) return false;
      if (!termo) return true;
      return (
        p.codigo.toLowerCase().includes(termo) ||
        (p.cliente?.nome || "").toLowerCase().includes(termo) ||
        (p.cliente?.email || "").toLowerCase().includes(termo)
      );
    });
  }, [pedidos, busca, statusFiltro]);

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
    <div>
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
        <div className="field">
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
      </div>

      <p className="field-hint mb-4">
        {filtrados.length} de {pedidos.length} pedido{pedidos.length === 1 ? "" : "s"}
      </p>

      {filtrados.length === 0 ? (
        <p className="field-hint">Nenhum pedido encontrado para essa busca.</p>
      ) : (
        filtrados.map((p) => <PedidoAdmin key={p.codigo} p={p} />)
      )}
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
