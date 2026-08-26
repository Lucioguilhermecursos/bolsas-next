"use client";

/* =========================================================================
   acbolsa — catálogo: filtros, ordenação e paginação
   =========================================================================

   O estado vive na URL. Não é detalhe de implementação: é o que faz um
   filtro ser compartilhável por link e o botão voltar do navegador se
   comportar como a visitante espera. `useSearchParams` lê, `router.replace`
   escreve, e o histórico cuida do resto — o `popstate` manual da versão
   anterior deixa de ser necessário.
   ========================================================================= */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CATEGORIAS,
  ORDEM_CATEGORIAS,
  formatarPreco,
  nomeCategoria,
  todos,
} from "@/lib/catalog";
import { GradeProdutos } from "@/components/CartaoProduto";
import { IconeCaixa, IconeFechar } from "@/components/Icones";
import Revelar from "@/components/Revelar";

const POR_PAGINA = 12;

const CATS_BOLSAS = Object.keys(CATEGORIAS).filter((k) => CATEGORIAS[k].pai === "bolsas");

/* ---------- URL -> estado -------------------------------------------------- */

function lerEstado(params) {
  const estado = {
    cats: [],
    cores: [],
    precoMin: null,
    precoMax: null,
    soEstoque: false,
    soNovo: false,
    ordem: "relevancia",
    pagina: 1,
  };

  /* `cat` aceita uma categoria única (vinda do menu) ou lista por vírgula. */
  const cat = params.get("cat");
  if (cat && cat !== "todos") {
    estado.cats = cat === "bolsas" ? CATS_BOLSAS.slice() : cat.split(",").filter((c) => CATEGORIAS[c]);
  }

  const cor = params.get("cor");
  if (cor) estado.cores = cor.split(",").filter(Boolean);

  if (params.get("min")) estado.precoMin = Number(params.get("min"));
  if (params.get("max")) estado.precoMax = Number(params.get("max"));
  if (params.get("estoque") === "1") estado.soEstoque = true;
  if (params.get("filtro") === "novidades") estado.soNovo = true;
  if (params.get("ordem")) estado.ordem = params.get("ordem");
  if (params.get("pagina")) estado.pagina = Math.max(1, Number(params.get("pagina")) || 1);

  return estado;
}

function escreverEstado(estado) {
  const p = new URLSearchParams();

  const todasBolsas =
    CATS_BOLSAS.length === estado.cats.length && CATS_BOLSAS.every((c) => estado.cats.includes(c));

  if (todasBolsas) p.set("cat", "bolsas");
  else if (estado.cats.length) p.set("cat", estado.cats.join(","));

  if (estado.cores.length) p.set("cor", estado.cores.join(","));
  if (estado.precoMin != null) p.set("min", String(estado.precoMin));
  if (estado.precoMax != null) p.set("max", String(estado.precoMax));
  if (estado.soEstoque) p.set("estoque", "1");
  if (estado.soNovo) p.set("filtro", "novidades");
  if (estado.ordem !== "relevancia") p.set("ordem", estado.ordem);
  if (estado.pagina > 1) p.set("pagina", String(estado.pagina));

  return p.toString();
}

/* ---------- Consulta ------------------------------------------------------- */

function filtrar(estado) {
  let r = todos();

  if (estado.cats.length) r = r.filter((x) => estado.cats.includes(x.cat));
  if (estado.cores.length) r = r.filter((x) => estado.cores.includes(x.cor));
  if (estado.precoMin != null) r = r.filter((x) => x.preco >= estado.precoMin);
  if (estado.precoMax != null) r = r.filter((x) => x.preco <= estado.precoMax);
  if (estado.soEstoque) r = r.filter((x) => x.estoque > 0);
  if (estado.soNovo) r = r.filter((x) => x.novo);

  switch (estado.ordem) {
    case "preco-asc":
      r.sort((a, b) => a.preco - b.preco);
      break;
    case "preco-desc":
      r.sort((a, b) => b.preco - a.preco);
      break;
    case "nome":
      r.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      break;
    case "novidades":
      r.sort((a, b) => (b.novo ? 1 : 0) - (a.novo ? 1 : 0));
      break;
    default:
      r.sort((a, b) => (b.vendas || 0) - (a.vendas || 0));
  }

  return r;
}

/* Título e descrição mudam com o filtro: quem chega por "Bolsas tote" no
   menu deve ver "Bolsas tote" como título da página, não "Catálogo". */
export function tituloDe(estado) {
  if (estado.soNovo && !estado.cats.length) {
    return { nome: "Novidades", desc: "As últimas peças a entrar no catálogo." };
  }
  if (estado.cats.length === 1) {
    const nome = CATEGORIAS[estado.cats[0]].nome;
    return { nome, desc: "Peças em " + nome.toLowerCase() + ", com ficha técnica aberta." };
  }
  if (
    estado.cats.length === CATS_BOLSAS.length &&
    CATS_BOLSAS.every((c) => estado.cats.includes(c))
  ) {
    return { nome: "Bolsas", desc: "Toda a linha de bolsas, de mini a tote." };
  }
  return { nome: "Catálogo", desc: "Todas as peças, com material e medidas em cada ficha." };
}

/* ---------- Componente ----------------------------------------------------- */

export default function CatalogoCliente() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const estado = lerEstado(params);
  const { nome: tituloPagina, desc } = tituloDe(estado);

  const [painelAberto, setPainelAberto] = useState(false);
  const botaoFiltrosRef = useRef(null);
  const fecharFiltrosRef = useRef(null);
  const toolbarRef = useRef(null);

  /* Navega para o novo estado. `replace` não empilha uma entrada por
     caractere digitado no campo de preço; a mudança de página usa `push`
     para o voltar devolver a página anterior da lista. */
  const irPara = useCallback(
    (novo, empilhar = false) => {
      const query = escreverEstado(novo);
      const url = pathname + (query ? "?" + query : "");
      if (empilhar) router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [pathname, router]
  );

  const alterar = useCallback(
    (mudancas, empilhar = false) => irPara({ ...estado, pagina: 1, ...mudancas }, empilhar),
    [estado, irPara]
  );

  function limparTudo() {
    irPara({
      cats: [],
      cores: [],
      precoMin: null,
      precoMax: null,
      soEstoque: false,
      soNovo: false,
      ordem: estado.ordem,
      pagina: 1,
    });
  }

  /* ---- Painel de filtros no celular ---- */

  const fecharPainel = useCallback(() => {
    setPainelAberto(false);
    botaoFiltrosRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!painelAberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fecharFiltrosRef.current?.focus();
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [painelAberto]);

  useEffect(() => {
    if (!painelAberto) return;
    function aoTeclar(e) {
      if (e.key === "Escape") fecharPainel();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [painelAberto, fecharPainel]);

  /* ---- Resultados ---- */

  const resultados = filtrar(estado);
  const totalPaginas = Math.max(1, Math.ceil(resultados.length / POR_PAGINA));
  const paginaAtual = Math.min(estado.pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const daPagina = resultados.slice(inicio, inicio + POR_PAGINA);

  let contagem;
  if (!resultados.length) contagem = "Nenhuma peça encontrada";
  else if (resultados.length <= POR_PAGINA)
    contagem = resultados.length + (resultados.length === 1 ? " peça" : " peças");
  else
    contagem =
      "Exibindo " + (inicio + 1) + "–" + (inicio + daPagina.length) + " de " + resultados.length + " peças";

  const catalogo = todos();

  /* Cores derivadas do catálogo, sem lista fixa: cor nova em produto novo
     aparece no filtro sozinha. */
  const cores = [];
  catalogo.forEach((p) => {
    if (p.cor && !cores.some((c) => c.nome === p.cor)) cores.push({ nome: p.cor, hex: p.hex });
  });
  cores.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const nFiltros =
    estado.cats.length +
    estado.cores.length +
    (estado.precoMin != null || estado.precoMax != null ? 1 : 0) +
    (estado.soEstoque ? 1 : 0) +
    (estado.soNovo ? 1 : 0);

  /* "Bolsas" inteiro vindo do menu não é filtro que a visitante escolheu:
     vira o título da página, não seis marcadores para ela desfazer. */
  const eCategoriaInteira =
    estado.cats.length === CATS_BOLSAS.length && CATS_BOLSAS.every((c) => estado.cats.includes(c));

  return (
    <>
      <Revelar key={params.toString()} />

      <div className="page-head">
        <div className="container">
          <ol className="crumbs" role="list">
            <li>
              <Link href="/">Início</Link>
            </li>
            {tituloPagina === "Catálogo" ? (
              <li aria-current="page">Catálogo</li>
            ) : (
              <>
                <li>
                  <Link href="/catalogo">Catálogo</Link>
                </li>
                <li aria-current="page">{tituloPagina}</li>
              </>
            )}
          </ol>
          <h1>{tituloPagina}</h1>
          <p className="lead">{desc}</p>
        </div>
      </div>

      {/* ---- Barra de controles ---- */}
      <div>
        <div className="container">
          <div className="toolbar" ref={toolbarRef}>
            <p className="toolbar-count" aria-live="polite">
              {contagem}
            </p>

            <div className="toolbar-right">
              <button
                ref={botaoFiltrosRef}
                className="filter-toggle"
                type="button"
                aria-expanded={painelAberto}
                aria-controls="painel-filtros"
                onClick={() => setPainelAberto(true)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                Filtrar
                {nFiltros > 0 && <span className="n">{nFiltros}</span>}
              </button>

              <label className="sr-only" htmlFor="ordenar">
                Ordenar por
              </label>
              <select
                className="select"
                id="ordenar"
                value={estado.ordem}
                onChange={(e) => alterar({ ordem: e.target.value })}
              >
                <option value="relevancia">Mais relevantes</option>
                <option value="novidades">Novidades primeiro</option>
                <option value="preco-asc">Menor preço</option>
                <option value="preco-desc">Maior preço</option>
                <option value="nome">Nome (A–Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="shop">
          {/* ---- Filtros ---- */}
          <aside className="filters" id="painel-filtros" data-open={painelAberto} aria-label="Filtros">
            <div className="filters-head">
              <span className="label">Filtrar</span>
              <button
                ref={fecharFiltrosRef}
                className="icon-btn"
                type="button"
                aria-label="Fechar filtros"
                onClick={fecharPainel}
              >
                <IconeFechar />
              </button>
            </div>

            <div className="filters-body">
              <div className="filter-group">
                <h2>Formato</h2>
                <div className="filter-list">
                  {ORDEM_CATEGORIAS.filter((c) => catalogo.some((p) => p.cat === c)).map((c) => (
                    <label key={c}>
                      <input
                        type="checkbox"
                        value={c}
                        checked={estado.cats.includes(c)}
                        onChange={(e) =>
                          alterar({
                            cats: e.target.checked
                              ? estado.cats.concat(c)
                              : estado.cats.filter((x) => x !== c),
                          })
                        }
                      />
                      <span>{CATEGORIAS[c].nome}</span>
                      <span className="n">{catalogo.filter((p) => p.cat === c).length}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h2>Cor</h2>
                <div className="filter-list">
                  {cores.map((cor) => (
                    <label key={cor.nome}>
                      <input
                        type="checkbox"
                        value={cor.nome}
                        checked={estado.cores.includes(cor.nome)}
                        onChange={(e) =>
                          alterar({
                            cores: e.target.checked
                              ? estado.cores.concat(cor.nome)
                              : estado.cores.filter((x) => x !== cor.nome),
                          })
                        }
                      />
                      {/* Só a cor fica inline: ela vem do catálogo. */}
                      <span
                        className="swatch swatch--filtro"
                        style={{ background: cor.hex }}
                        aria-hidden="true"
                      />
                      <span>{cor.nome}</span>
                      <span className="n">{catalogo.filter((p) => p.cor === cor.nome).length}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* O `key` remonta os campos quando o preço muda por fora —
                  marcador removido, "limpar tudo" — o que reinicia o estado
                  local a partir das props sem efeito de sincronização. */}
              <FiltroPreco
                key={estado.precoMin + ":" + estado.precoMax}
                min={estado.precoMin}
                max={estado.precoMax}
                aoMudar={(min, max) => alterar({ precoMin: min, precoMax: max })}
              />

              <div className="filter-group">
                <h2>Disponibilidade</h2>
                <div className="filter-list">
                  <label>
                    <input
                      type="checkbox"
                      checked={estado.soEstoque}
                      onChange={(e) => alterar({ soEstoque: e.target.checked })}
                    />
                    <span>Somente em estoque</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={estado.soNovo}
                      onChange={(e) => alterar({ soNovo: e.target.checked })}
                    />
                    <span>Novidades</span>
                  </label>
                </div>
              </div>

              <button className="filter-clear" type="button" onClick={limparTudo}>
                Limpar todos os filtros
              </button>
            </div>

            <div className="filters-foot">
              <button className="btn btn-dark btn-block" type="button" onClick={fecharPainel}>
                Ver resultados
              </button>
            </div>
          </aside>

          {/* ---- Resultados ---- */}
          <div>
            <div className="chips">
              {!eCategoriaInteira &&
                estado.cats.map((c) => (
                  <Chip
                    key={c}
                    rotulo={nomeCategoria(c)}
                    aoRemover={() => alterar({ cats: estado.cats.filter((x) => x !== c) })}
                  />
                ))}

              {estado.cores.map((c) => (
                <Chip
                  key={c}
                  rotulo={c}
                  aoRemover={() => alterar({ cores: estado.cores.filter((x) => x !== c) })}
                />
              ))}

              {(estado.precoMin != null || estado.precoMax != null) && (
                <Chip
                  rotulo={
                    (estado.precoMin != null ? formatarPreco(estado.precoMin) : "qualquer") +
                    " – " +
                    (estado.precoMax != null ? formatarPreco(estado.precoMax) : "qualquer")
                  }
                  descricao="Remover filtro de preço"
                  aoRemover={() => alterar({ precoMin: null, precoMax: null })}
                />
              )}

              {estado.soEstoque && (
                <Chip rotulo="Em estoque" aoRemover={() => alterar({ soEstoque: false })} />
              )}

              {estado.soNovo && (
                <Chip rotulo="Novidades" aoRemover={() => alterar({ soNovo: false })} />
              )}
            </div>

            {daPagina.length ? (
              <GradeProdutos produtos={daPagina} eager reveal />
            ) : (
              <div className="empty">
                <IconeCaixa />
                <h2>Nada com esses filtros</h2>
                <p>Tente ampliar a faixa de preço ou tirar um dos formatos selecionados.</p>
                <button className="btn btn-ghost" type="button" onClick={limparTudo}>
                  Limpar filtros
                </button>
              </div>
            )}

            <Paginacao
              pagina={paginaAtual}
              total={totalPaginas}
              aoIr={(n) => {
                irPara({ ...estado, pagina: n }, true);
                toolbarRef.current?.scrollIntoView({ block: "start" });
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Marcador de filtro ativo --------------------------------------- */

function Chip({ rotulo, descricao = "Remover filtro", aoRemover }) {
  return (
    <button className="chip" type="button" onClick={aoRemover}>
      {rotulo}
      <IconeFechar />
      <span className="sr-only">{descricao}</span>
    </button>
  );
}

/* ---------- Faixa de preço --------------------------------------------------
   Estado local no campo, com espera de 420ms antes de mexer na URL: refiltrar
   a cada tecla digitada faria a grade piscar e encheria o histórico. */

function FiltroPreco({ min, max, aoMudar }) {
  const [valorMin, setValorMin] = useState(min == null ? "" : String(min));
  const [valorMax, setValorMax] = useState(max == null ? "" : String(max));
  const primeiraVez = useRef(true);

  useEffect(() => {
    if (primeiraVez.current) {
      primeiraVez.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const novoMin = valorMin === "" ? null : Number(valorMin);
      const novoMax = valorMax === "" ? null : Number(valorMax);
      if (novoMin !== min || novoMax !== max) aoMudar(novoMin, novoMax);
    }, 420);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valorMin, valorMax]);

  return (
    <div className="filter-group">
      <h2>Preço</h2>
      <div className="range-row">
        <label className="sr-only" htmlFor="preco-min">
          Preço mínimo
        </label>
        <input
          className="input"
          id="preco-min"
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="Mín."
          value={valorMin}
          onChange={(e) => setValorMin(e.target.value)}
        />
        <span aria-hidden="true">até</span>
        <label className="sr-only" htmlFor="preco-max">
          Preço máximo
        </label>
        <input
          className="input"
          id="preco-max"
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="Máx."
          value={valorMax}
          onChange={(e) => setValorMax(e.target.value)}
        />
      </div>
    </div>
  );
}

/* ---------- Paginação ------------------------------------------------------- */

function Paginacao({ pagina, total, aoIr }) {
  if (total <= 1) return <nav className="pagination" aria-label="Paginação" />;

  /* Janela de páginas com reticências: primeira, última, e as vizinhas da
     atual. Uma lista de 40 botões não ajuda ninguém. */
  const paginas = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - pagina) <= 1) paginas.push(i);
    else if (paginas[paginas.length - 1] !== "…") paginas.push("…");
  }

  return (
    <nav className="pagination" aria-label="Paginação">
      <button
        type="button"
        disabled={pagina === 1}
        aria-label="Página anterior"
        onClick={() => aoIr(pagina - 1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>

      {paginas.map((p, i) =>
        p === "…" ? (
          <span className="gap" aria-hidden="true" key={"gap" + i}>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === pagina ? "page" : undefined}
            aria-label={"Página " + p}
            onClick={() => aoIr(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        disabled={pagina === total}
        aria-label="Próxima página"
        onClick={() => aoIr(pagina + 1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </nav>
  );
}
