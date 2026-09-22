"use client";

/* =========================================================================
   acbolsa — painel do vendedor: métricas
   =========================================================================

   Contagem por status (KPIs), faturamento total (pago) e dois gráficos de
   LINHA por período — pedidos e faturamento (pontos + rótulo do valor
   quando há poucos períodos; com muitos, só o tooltip ao passar o mouse,
   senão os números se atropelam). A granularidade do gráfico
   (dia/mês/trimestre/ano) não é escolhida à mão: se ajusta sozinha ao
   tamanho do período em "De"/"Até" (ver escolherGranularidade) — filtrar um
   mês mostra os dias dele; sem filtro, com meses de histórico, agrupa por
   mês; anos de histórico, por trimestre/ano. Sem isso, um filtro de "só
   agosto" com granularidade em "mês" virava uma barra só, inútil.

   Cada gráfico tem UMA série (um eixo só, nunca dois): "pedidos por período"
   em --forest, "faturamento por período" em --cognac. Cor por status nos
   KPIs reaproveita as mesmas variáveis do selo .status[data-status] usado no
   resto do painel/conta — nenhuma cor nova foi inventada.
   ========================================================================= */

import { useMemo, useState } from "react";
import { formatarPreco } from "@/lib/catalog";
import { STATUS_ROTULO, dataLocalISO } from "./PainelVendedor";

const MESES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const COR_STATUS = {
  registrado: "var(--ink-soft)",
  pago: "var(--success)",
  pagamento_falhou: "var(--cognac)",
  expirado: "var(--muted)",
  cancelado: "var(--muted)",
};

/* ---- agregação por período -------------------------------------------- */

function inicioBucket(data, granularidade) {
  const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  if (granularidade === "mes") return new Date(d.getFullYear(), d.getMonth(), 1);
  if (granularidade === "trimestre") return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
  if (granularidade === "semestre") return new Date(d.getFullYear(), d.getMonth() < 6 ? 0 : 6, 1);
  if (granularidade === "ano") return new Date(d.getFullYear(), 0, 1);
  return d; // dia
}

function chaveBucket(bucket, granularidade) {
  const y = bucket.getFullYear();
  const m2 = String(bucket.getMonth() + 1).padStart(2, "0");
  if (granularidade === "ano") return String(y);
  if (granularidade === "semestre") return y + "-S" + (bucket.getMonth() < 6 ? 1 : 2);
  if (granularidade === "trimestre") return y + "-T" + (Math.floor(bucket.getMonth() / 3) + 1);
  if (granularidade === "mes") return y + "-" + m2;
  return y + "-" + m2 + "-" + String(bucket.getDate()).padStart(2, "0");
}

function rotuloBucket(bucket, granularidade) {
  const yy = String(bucket.getFullYear()).slice(-2);
  if (granularidade === "ano") return String(bucket.getFullYear());
  if (granularidade === "semestre") return (bucket.getMonth() < 6 ? "1º sem" : "2º sem") + "/" + yy;
  if (granularidade === "trimestre") return Math.floor(bucket.getMonth() / 3) + 1 + "º tri/" + yy;
  if (granularidade === "mes") return MESES_ABREV[bucket.getMonth()] + "/" + yy;
  return String(bucket.getDate()).padStart(2, "0") + "/" + String(bucket.getMonth() + 1).padStart(2, "0");
}

function proximoBucket(bucket, granularidade) {
  const d = new Date(bucket);
  if (granularidade === "dia") d.setDate(d.getDate() + 1);
  else if (granularidade === "mes") d.setMonth(d.getMonth() + 1);
  else if (granularidade === "trimestre") d.setMonth(d.getMonth() + 3);
  else if (granularidade === "semestre") d.setMonth(d.getMonth() + 6);
  else if (granularidade === "ano") d.setFullYear(d.getFullYear() + 1);
  return d;
}

/* Uma linha por bucket entre o pedido mais antigo e o mais novo — buckets
   sem pedido entram com zero, pra virar uma linha do tempo de verdade, não
   só "os dias em que teve venda". Isso pode alongar o gráfico (e trazer a
   barra de rolagem de volta) num período com dias vazios no meio — é o
   trade-off escolhido: ver o vazio importa mais do que economizar espaço. */
function agregarPorPeriodo(pedidos, granularidade) {
  if (!pedidos.length) return [];

  let minBucket = null;
  let maxBucket = null;
  for (const p of pedidos) {
    const inicio = inicioBucket(new Date(p.data), granularidade);
    if (!minBucket || inicio < minBucket) minBucket = inicio;
    if (!maxBucket || inicio > maxBucket) maxBucket = inicio;
  }

  const buckets = new Map();
  let cursor = minBucket;
  while (cursor <= maxBucket) {
    const chave = chaveBucket(cursor, granularidade);
    buckets.set(chave, { chave, rotulo: rotuloBucket(cursor, granularidade), pedidos: 0, faturamento: 0 });
    cursor = proximoBucket(cursor, granularidade);
  }

  for (const p of pedidos) {
    const inicio = inicioBucket(new Date(p.data), granularidade);
    const b = buckets.get(chaveBucket(inicio, granularidade));
    b.pedidos += 1;
    if (p.status === "pago") b.faturamento += p.valores.total;
  }

  return Array.from(buckets.values());
}

/* Sem controle manual: o agrupamento se adapta ao tamanho do intervalo, pra
   sempre render um punhado de barras legível, nunca uma barra só nem uma
   parede de 900 barras diárias. */
function escolherGranularidade(pedidos) {
  if (pedidos.length < 2) return "dia";

  let min = null;
  let max = null;
  for (const p of pedidos) {
    const d = new Date(p.data);
    if (!min || d < min) min = d;
    if (!max || d > max) max = d;
  }

  const dias = (max - min) / 86400000;
  if (dias <= 45) return "dia";
  if (dias <= 400) return "mes";
  if (dias <= 1100) return "trimestre";
  return "ano";
}

function contarPorStatus(pedidos) {
  const contagem = { registrado: 0, pago: 0, pagamento_falhou: 0, expirado: 0, cancelado: 0 };
  for (const p of pedidos) {
    if (contagem[p.status] !== undefined) contagem[p.status] += 1;
  }
  return contagem;
}

/* ---- componente --------------------------------------------------------- */

export default function Metricas({ pedidos }) {
  const [dataDe, setDataDe] = useState("");
  const [dataAte, setDataAte] = useState("");

  const pedidosNoPeriodo = useMemo(() => {
    if (!dataDe && !dataAte) return pedidos;
    return pedidos.filter((p) => {
      const d = dataLocalISO(p.data);
      if (dataDe && d < dataDe) return false;
      if (dataAte && d > dataAte) return false;
      return true;
    });
  }, [pedidos, dataDe, dataAte]);

  const granularidade = useMemo(() => escolherGranularidade(pedidosNoPeriodo), [pedidosNoPeriodo]);
  const contagem = useMemo(() => contarPorStatus(pedidosNoPeriodo), [pedidosNoPeriodo]);
  const faturamentoTotal = useMemo(
    () => pedidosNoPeriodo.filter((p) => p.status === "pago").reduce((s, p) => s + p.valores.total, 0),
    [pedidosNoPeriodo]
  );
  const periodos = useMemo(
    () => agregarPorPeriodo(pedidosNoPeriodo, granularidade),
    [pedidosNoPeriodo, granularidade]
  );

  const dadosPedidos = periodos.map((b) => ({ chave: b.chave, rotulo: b.rotulo, valor: b.pedidos }));
  const dadosFaturamento = periodos.map((b) => ({ chave: b.chave, rotulo: b.rotulo, valor: b.faturamento }));

  return (
    <div>
      <p className="metric-hero-label">Faturamento total (pedidos pagos)</p>
      <p className="metric-hero">{formatarPreco(faturamentoTotal)}</p>

      <div className="kpi-row mt-8">
        <div className="kpi-tile">
          <span className="rotulo">
            <span className="kpi-dot" style={{ background: "var(--ink)" }} />
            Total de pedidos
          </span>
          <span className="valor">{pedidosNoPeriodo.length}</span>
        </div>
        {Object.entries(STATUS_ROTULO).map(([valor, rotulo]) => (
          <div className="kpi-tile" key={valor}>
            <span className="rotulo">
              <span className="kpi-dot" style={{ background: COR_STATUS[valor] }} />
              {rotulo}
            </span>
            <span className="valor">{contagem[valor] ?? 0}</span>
          </div>
        ))}
      </div>

      {/* Filtros que escopam os KPIs acima e os gráficos abaixo: data (De/Até)
          decide QUAIS pedidos entram na conta, granularidade decide COMO
          agrupar esses pedidos nos gráficos. */}
      <div className="painel-filtros mt-9">
        <div className="field">
          <label className="sr-only" htmlFor="metricas-data-de">
            De
          </label>
          <input
            className="input"
            id="metricas-data-de"
            type="date"
            value={dataDe}
            max={dataAte || undefined}
            onChange={(e) => setDataDe(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker?.()}
          />
        </div>
        <div className="field">
          <label className="sr-only" htmlFor="metricas-data-ate">
            Até
          </label>
          <input
            className="input"
            id="metricas-data-ate"
            type="date"
            value={dataAte}
            min={dataDe || undefined}
            onChange={(e) => setDataAte(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker?.()}
          />
        </div>
        {(dataDe || dataAte) && (
          <button
            type="button"
            className="link-underline"
            style={{ background: "none", border: 0, padding: 0, font: "inherit", cursor: "pointer" }}
            onClick={() => {
              setDataDe("");
              setDataAte("");
            }}
          >
            Limpar período
          </button>
        )}
      </div>

      <div className="mt-9">
        <h3 className="metric-titulo">Pedidos por período</h3>
        <GraficoLinha dados={dadosPedidos} cor="--forest" formatarValor={(v) => v + (v === 1 ? " pedido" : " pedidos")} />
      </div>

      <div className="mt-9">
        <h3 className="metric-titulo">Faturamento por período</h3>
        <p className="field-hint mb-3">Soma dos pedidos com status pago, pela data do pedido.</p>
        <GraficoLinha dados={dadosFaturamento} cor="--cognac" formatarValor={formatarPreco} />
      </div>
    </div>
  );
}

/* ---- gráfico de linha ---------------------------------------------------

   Largura de coluna e altura do plot em pixels exatos (não % de viewBox) —
   assim o <svg> nunca estica de forma não-uniforme e os pontos continuam
   círculos, não elipses. LARGURA_COLUNA precisa bater com a largura usada
   pra posicionar cada ponto abaixo; é só um número, não uma classe CSS. */
const LARGURA_COLUNA = 56;
const ALTURA_PLOT = 170;
const ALTURA_ROTULO_EIXO = 22; // reservado embaixo pra data ("30/08")

function GraficoLinha({ dados, cor, formatarValor }) {
  const [ativo, setAtivo] = useState(null);

  if (!dados.length) {
    return <p className="field-hint">Sem pedidos para calcular esse gráfico ainda.</p>;
  }

  /* Um ponto só não tem o que formar linha — e como ele é sempre 100% do
     próprio máximo, ia parar sozinho lá no topo, sobrando um vão vazio até
     a data lá embaixo. Mostra o valor direto em vez de montar um gráfico
     que não tem o que comparar. */
  if (dados.length === 1) {
    const unico = dados[0];
    return (
      <p className="bar-chart-unico">
        <span className="linha-dot-inline" style={{ background: "var(" + cor + ")" }} />
        <strong>{formatarValor(unico.valor)}</strong>
        <span className="texto-suave">em {unico.rotulo}</span>
      </p>
    );
  }

  const max = Math.max(1, ...dados.map((d) => d.valor));
  const maiorPonto = dados.reduce((a, b) => (b.valor > a.valor ? b : a), dados[0]);

  /* Com poucos pontos, o valor fica escrito ao lado de cada um (como no
     gráfico de referência). Com muitos (granularidade "dia" numa janela
     larga), os números colidiriam — aí só o tooltip ao passar o mouse. */
  const mostrarRotulos = dados.length <= 12;

  const baseY = ALTURA_PLOT - ALTURA_ROTULO_EIXO;
  const topoY = mostrarRotulos ? 40 : 20;
  const alturaUtil = baseY - topoY;

  const pontos = dados.map((d, i) => ({
    ...d,
    x: i * LARGURA_COLUNA + LARGURA_COLUNA / 2,
    y: baseY - (d.valor / max) * alturaUtil,
  }));

  const larguraTotal = dados.length * LARGURA_COLUNA;

  return (
    <div className="bar-chart">
      <p className="bar-chart-escala">
        Maior valor no período: <strong>{formatarValor(maiorPonto.valor)}</strong> ({maiorPonto.rotulo})
      </p>
      <div className="bar-chart-track">
        <div className="linha-plot" style={{ width: larguraTotal, height: ALTURA_PLOT }}>
          <svg className="linha-svg" width={larguraTotal} height={ALTURA_PLOT} aria-hidden="true">
            <polyline
              points={pontos.map((p) => p.x + "," + p.y).join(" ")}
              fill="none"
              stroke={"var(" + cor + ")"}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>

          {pontos.map((p, i) => {
            const naBorda = i === 0 ? "esquerda" : i === pontos.length - 1 ? "direita" : "centro";
            const ancoraTexto =
              naBorda === "esquerda"
                ? { left: 0, transform: "translateX(0)" }
                : naBorda === "direita"
                  ? { left: LARGURA_COLUNA, transform: "translateX(-100%)" }
                  : { left: LARGURA_COLUNA / 2, transform: "translateX(-50%)" };

            return (
              <div
                className="linha-ponto"
                key={p.chave}
                style={{ left: i * LARGURA_COLUNA, width: LARGURA_COLUNA }}
                tabIndex={0}
                role="img"
                aria-label={p.rotulo + ": " + formatarValor(p.valor)}
                onMouseEnter={() => setAtivo(i)}
                onMouseLeave={() => setAtivo((a) => (a === i ? null : a))}
                onFocus={() => setAtivo(i)}
                onBlur={() => setAtivo((a) => (a === i ? null : a))}
              >
                <div
                  className={"linha-dot" + (ativo === i ? " linha-dot--ativo" : "")}
                  style={{ left: LARGURA_COLUNA / 2, top: p.y, background: "var(" + cor + ")" }}
                />

                {mostrarRotulos && (
                  <span className="linha-valor" style={{ top: p.y - 10, ...ancoraTexto }}>
                    {formatarValor(p.valor)}
                  </span>
                )}

                {!mostrarRotulos && ativo === i && (
                  <div className="bar-tooltip" style={{ top: p.y - 14, ...ancoraTexto, transform: ancoraTexto.transform + " translateY(-100%)" }}>
                    <strong>{formatarValor(p.valor)}</strong>
                    <span>{p.rotulo}</span>
                  </div>
                )}

                <span className="bar-label" style={{ bottom: 0, left: LARGURA_COLUNA / 2, transform: "translateX(-50%)" }}>
                  {p.rotulo}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
