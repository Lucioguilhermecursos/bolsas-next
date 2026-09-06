"use client";

/* =========================================================================
   acbolsa — header, menu mobile e painel de busca
   =========================================================================

   Os três vivem no mesmo componente porque compartilham estado: abrir a
   busca fecha o menu, o Esc fecha o que estiver aberto, e os dois precisam
   prender o foco e inertizar o fundo. Separá-los exigiria um quarto pedaço
   de estado só para coordená-los.
   ========================================================================= */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCarrinho } from "./CarrinhoContexto";
import { useSessao } from "./SessaoContexto";
import { sair } from "@/app/auth/acoes";
import {
  IconeBusca,
  IconeCaixa,
  IconeCaminhao,
  IconeConta,
  IconeFechar,
  IconeMenu,
  IconeSacola,
  IconeSeta,
} from "./Icones";

export const MENU = [
  { rotulo: "Novidades", href: "/catalogo?filtro=novidades" },
  { rotulo: "Todas as bolsas", href: "/catalogo?cat=bolsas" },
  { rotulo: "Ajuda", href: "/ajuda" },
];

/* Seletor dos focáveis de um painel sobreposto. */
const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])';

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);

  const menuRef = useRef(null);
  const buscaRef = useRef(null);
  const campoBuscaRef = useRef(null);
  const botaoMenuRef = useRef(null);
  const botaoBuscaRef = useRef(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { usuario } = useSessao();

  const fecharMenu = useCallback(() => {
    setMenuAberto(false);
    botaoMenuRef.current?.focus();
  }, []);

  const fecharBusca = useCallback(() => {
    setBuscaAberta(false);
    botaoBuscaRef.current?.focus();
  }, []);

  /* Fecha tudo ao navegar: sem isto o menu continua aberto por cima da
     página nova, já que o header não desmonta entre rotas.

     O ajuste acontece durante o render, comparando com a URL anterior, e não
     num efeito: assim a página nova já pinta com os painéis fechados, sem o
     quadro intermediário em que o menu ainda cobre o conteúdo. */
  const url = pathname + "?" + searchParams.toString();
  const [urlAnterior, setUrlAnterior] = useState(url);

  if (url !== urlAnterior) {
    setUrlAnterior(url);
    setMenuAberto(false);
    setBuscaAberta(false);
  }

  /* Trava a rolagem do corpo enquanto o menu cobre a página. */
  useEffect(() => {
    if (!menuAberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [menuAberto]);

  /* O menu sai de `visibility: hidden` com transição, e elemento invisível
     não recebe .focus(). Espera o transitionend antes de focar — com uma
     rede de segurança caso a transição não dispare. */
  useEffect(() => {
    if (!menuAberto) return;
    const painel = menuRef.current;
    if (!painel) return;

    const focar = () => painel.querySelector("[data-menu-close]")?.focus();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const quadro = requestAnimationFrame(focar);
      return () => cancelAnimationFrame(quadro);
    }

    painel.addEventListener("transitionend", focar, { once: true });
    const rede = setTimeout(focar, 500);
    return () => {
      painel.removeEventListener("transitionend", focar);
      clearTimeout(rede);
    };
  }, [menuAberto]);

  /* Mesmo motivo, no painel de busca. */
  useEffect(() => {
    if (!buscaAberta) return;
    const timer = setTimeout(() => campoBuscaRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [buscaAberta]);

  /* Esc fecha; Tab circula dentro do painel aberto. Sem a prisão de foco o
     Tab escapa para o conteúdo atrás, que está coberto mas alcançável. */
  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === "Escape") {
        if (menuAberto) fecharMenu();
        if (buscaAberta) fecharBusca();
        return;
      }

      if (e.key !== "Tab") return;

      const painel = menuAberto ? menuRef.current : buscaAberta ? buscaRef.current : null;
      if (!painel) return;

      const focaveis = Array.from(painel.querySelectorAll(FOCAVEIS)).filter(
        (el) => el.offsetParent !== null
      );
      if (!focaveis.length) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [menuAberto, buscaAberta, fecharMenu, fecharBusca]);

  /* Marca o item de navegação correspondente à página atual. Compara os
     parâmetros do href com os da URL: `/catalogo?cat=tote` só está ativo
     quando `cat` vale mesmo `tote`. */
  function ativo(href) {
    const [caminho, query] = href.split("?");
    if (caminho !== pathname) return false;
    if (!query) return searchParams.size === 0;
    for (const [chave, valor] of new URLSearchParams(query)) {
      if (searchParams.get(chave) !== valor) return false;
    }
    return true;
  }

  function aoEnviarBusca(e) {
    e.preventDefault();
    const termo = campoBuscaRef.current?.value.trim();
    if (!termo) return;
    setBuscaAberta(false);
    router.push("/busca?q=" + encodeURIComponent(termo));
  }

  /* O fundo sai do alcance de teclado e de leitor de tela enquanto há painel
     aberto. O header fica de fora porque contém o botão que fecha. */
  const fundoInerte = menuAberto || buscaAberta;

  return (
    <>
      <header className="site-header" inert={menuAberto ? "" : undefined}>
        <div className="container header-inner">
          <Link className="logo" href="/">
            acbolsa
          </Link>

          <ul className="nav" role="list">
            {MENU.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={ativo(item.href) ? "page" : undefined}>
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>

          <div className="header-actions">
            <button
              ref={botaoBuscaRef}
              className="icon-btn"
              type="button"
              aria-label="Buscar produtos"
              aria-expanded={buscaAberta}
              onClick={() => {
                setMenuAberto(false);
                setBuscaAberta((a) => !a);
              }}
            >
              <IconeBusca />
            </button>

            <Link
              className="icon-btn"
              href={usuario ? "/conta" : "/entrar"}
              aria-label={usuario ? "Minha conta" : "Entrar"}
            >
              <IconeConta />
            </Link>

            <ContadorSacola />

            <button
              ref={botaoMenuRef}
              className="icon-btn menu-toggle"
              type="button"
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
              aria-controls="menu-mobile"
              onClick={() => {
                setBuscaAberta(false);
                setMenuAberto(true);
              }}
            >
              <IconeMenu />
            </button>
          </div>
        </div>
      </header>

      {/* ---- Painel de busca ---- */}
      <div className="search-panel" data-open={buscaAberta} ref={buscaRef}>
        <div className="container">
          <form role="search" onSubmit={aoEnviarBusca}>
            <label className="sr-only" htmlFor="busca-campo">
              Buscar produtos
            </label>
            <input
              ref={campoBuscaRef}
              className="search-input"
              id="busca-campo"
              type="search"
              name="q"
              placeholder="Buscar por peça, material ou cor"
              autoComplete="off"
              /* Fora de vista, o campo sai da ordem de tabulação junto. */
              tabIndex={buscaAberta ? undefined : -1}
            />
            <button className="icon-btn" type="submit" aria-label="Buscar">
              <IconeSeta />
            </button>
            <button
              className="icon-btn"
              type="button"
              aria-label="Fechar busca"
              tabIndex={buscaAberta ? undefined : -1}
              onClick={fecharBusca}
            >
              <IconeFechar />
            </button>
          </form>
        </div>
      </div>

      {/* ---- Menu mobile ---- */}
      <div
        className="scrim"
        data-open={menuAberto}
        onClick={fecharMenu}
        aria-hidden="true"
      />

      <nav
        className="mobile-menu"
        id="menu-mobile"
        data-open={menuAberto}
        aria-label="Menu principal"
        ref={menuRef}
        inert={menuAberto ? undefined : ""}
      >
        <div className="mobile-menu-head">
          <span className="logo">acbolsa</span>
          <button
            className="icon-btn"
            type="button"
            data-menu-close
            aria-label="Fechar menu"
            onClick={fecharMenu}
          >
            <IconeFechar />
          </button>
        </div>

        <ul className="mobile-nav" role="list">
          {MENU.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.rotulo}</Link>
            </li>
          ))}
        </ul>

        <div className="mobile-foot">
          {usuario ? (
            <>
              <Link href="/conta">
                <IconeConta />
                <span>Minha conta</span>
              </Link>
              <Link href="/conta#pedidos">
                <IconeCaixa />
                <span>Meus pedidos</span>
              </Link>
              <form action={sair}>
                <button type="submit">
                  <IconeConta />
                  <span>Sair</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/entrar">
                <IconeConta />
                <span>Entrar</span>
              </Link>
              <Link href="/ajuda#entrega">
                <IconeCaminhao />
                <span>Entrega e prazos</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* O conteúdo da página é inertizado pelo layout, que envolve <main>. */}
      <MarcadorInerte ativo={fundoInerte} />
    </>
  );
}

/* Contagem da sacola. Só aparece depois que o carrinho foi lido do
   localStorage — antes disso o servidor e o cliente discordariam. */
function ContadorSacola() {
  const { totalItens, pronto } = useCarrinho();
  const n = pronto ? totalItens : 0;

  return (
    <Link
      className="icon-btn"
      href="/carrinho"
      aria-label={n === 0 ? "Sacola, vazia" : "Sacola, " + n + (n === 1 ? " item" : " itens")}
    >
      <IconeSacola />
      <span className="cart-count" data-count={n}>
        {n > 99 ? "99+" : n}
      </span>
    </Link>
  );
}

/* Aplica `inert` no <main> e no rodapé enquanto um painel está aberto.
   Feito por efeito porque esses elementos são irmãos do header, fora da
   árvore que este componente renderiza. */
function MarcadorInerte({ ativo }) {
  useEffect(() => {
    const alvos = [document.querySelector("main"), document.querySelector(".site-footer")].filter(
      Boolean
    );
    alvos.forEach((el) => {
      if (ativo) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
    return () => alvos.forEach((el) => el.removeAttribute("inert"));
  }, [ativo]);

  return null;
}
