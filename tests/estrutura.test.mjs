/* =========================================================================
   acbolsa — teclado e semântica
   =========================================================================

   Foco visível (com Tab de verdade — `.focus()` por script não dispara
   `:focus-visible`), prisão e devolução de foco nos painéis, alvo de toque
   de 24px, hierarquia de cabeçalhos, landmarks, rótulos e ids duplicados.
   ========================================================================= */

import { chromium } from "playwright";
import { subirServidor } from "./servidor.mjs";

const { base: BASE, encerrar } = await subirServidor();
const problemas = [];
const anota = (pagina, tipo, msg) => problemas.push({ pagina, tipo, msg });

const PAGINAS = [
  ["/", "home"], ["/catalogo", "catálogo"], ["/produto/tabby-shoulder-preta", "produto"],
  ["/carrinho", "sacola"], ["/busca?q=couro", "busca"], ["/conta", "conta"],
  ["/sobre", "sobre"], ["/ajuda", "ajuda"],
];

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();

const AUDITAR = `(() => {
  const out = { h: [], semRotulo: [], alvos: [], landmarks: {}, imgs: [], live: [], dupIds: [], tabPos: [] };

  /* Cabeçalhos e a ordem deles. */
  document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
    const r = h.getBoundingClientRect();
    if (r.width && r.height) out.h.push({ n: Number(h.tagName[1]), txt: h.textContent.trim().slice(0,40) });
  });

  /* Controles sem nome acessível. */
  const nomeDe = (el) => {
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
    const lb = el.getAttribute('aria-labelledby');
    if (lb) return lb.split(/\\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ');
    if (el.id) { const l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (l) return l.textContent; }
    if (el.closest('label')) return el.closest('label').textContent;
    if (el.tagName === 'BUTTON' || el.tagName === 'A') return el.textContent;
    if (el.title) return el.title;
    return '';
  };

  document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]').forEach(el => {
    const r = el.getBoundingClientRect();
    /* checkVisibility pega o que getBoundingClientRect não pega: .reveal
       ainda em opacity 0 e painéis deslocados por transform. */
    const vis = r.width > 0 && r.height > 0 &&
                el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    if (!vis) return;
    if (el.type === 'hidden') return;
    if (!nomeDe(el).trim()) {
      out.semRotulo.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,35), id: el.id });
    }
    /* Alvo de toque: 24x24 é o mínimo do WCAG 2.2 (2.5.8).
       Ignora quem tem ::after esticado cobrindo um bloco maior — é o caso do
       título do cartão de produto, cujo alvo real é o cartão inteiro. */
    const ap = getComputedStyle(el, '::after');
    const cobreBloco = ap.position === 'absolute' && ap.inset === '0px';
    /* Input dentro de <label>: o alvo real é o rótulo inteiro, porque clicar
       nele alterna o controle. É o caso das caixas de filtro do catálogo. */
    const lab = el.closest('label');
    const alvo = lab ? lab.getBoundingClientRect() : r;
    if (!cobreBloco && (alvo.width < 24 || alvo.height < 24)) {
      out.alvos.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,35),
                       w: Math.round(r.width), h: Math.round(r.height), txt: el.textContent.trim().slice(0,25) });
    }
    /* tabindex positivo quebra a ordem natural. */
    const ti = el.getAttribute('tabindex');
    if (ti && Number(ti) > 0) out.tabPos.push({ tag: el.tagName, ti });
  });

  /* Landmarks. */
  out.landmarks = {
    main: document.querySelectorAll('main').length,
    nav: document.querySelectorAll('nav').length,
    header: document.querySelectorAll('body > header, body > * > header').length,
    footer: document.querySelectorAll('footer').length,
    h1: document.querySelectorAll('h1').length,
  };

  /* Imagens sem alt. */
  document.querySelectorAll('img').forEach(i => {
    if (!i.hasAttribute('alt')) out.imgs.push(i.getAttribute('src')?.slice(0,40) || '(sem src)');
  });

  /* Regiões vivas. */
  document.querySelectorAll('[aria-live],[role=status],[role=alert]').forEach(el => {
    out.live.push((el.getAttribute('role')||'') + ' ' + (el.getAttribute('aria-live')||'') +
                  ' .' + (el.className||'').toString().slice(0,30));
  });

  /* IDs duplicados quebram label/for e aria-describedby. */
  const vistos = {};
  document.querySelectorAll('[id]').forEach(el => {
    vistos[el.id] = (vistos[el.id] || 0) + 1;
  });
  out.dupIds = Object.entries(vistos).filter(([,n]) => n > 1).map(([id,n]) => id + ' ×' + n);

  return out;
})()`;

for (const [url, nome] of PAGINAS) {
  await p.goto(BASE + url, { waitUntil: "networkidle" });
  await p.waitForTimeout(300);
  const r = await p.evaluate(AUDITAR);

  if (r.landmarks.h1 !== 1) anota(nome, "h1", "a página tem " + r.landmarks.h1 + " <h1> (esperado 1)");
  if (r.landmarks.main !== 1) anota(nome, "landmark", r.landmarks.main + " <main>");

  /* Salto de nível de cabeçalho. */
  for (let i = 1; i < r.h.length; i++) {
    if (r.h[i].n - r.h[i-1].n > 1) {
      anota(nome, "hierarquia", "h" + r.h[i-1].n + " -> h" + r.h[i].n + ' em "' + r.h[i].txt + '"');
    }
  }
  r.semRotulo.forEach(c => anota(nome, "sem rótulo", c.tag + " ." + c.cls + (c.id ? " #" + c.id : "")));
  r.alvos.forEach(a => anota(nome, "alvo pequeno", a.tag + " ." + a.cls + " " + a.w + "×" + a.h + 'px "' + a.txt + '"'));
  r.imgs.forEach(i => anota(nome, "img sem alt", i));
  r.dupIds.forEach(d => anota(nome, "id duplicado", d));
  r.tabPos.forEach(t => anota(nome, "tabindex positivo", t.tag + " tabindex=" + t.ti));
}

/* ---- Foco visível em todo elemento focável da home ---- */
await p.goto(BASE, { waitUntil: "networkidle" });
/* Precisa ser Tab de verdade: `.focus()` por script NÃO ativa :focus-visible,
   e o anel do sistema é declarado justamente nesse seletor. */
for (let i = 0; i < 35; i++) {
  await p.keyboard.press("Tab");
  const r = await p.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    const anel = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none';
    return anel ? null : (el.tagName + ' .' + (el.className||'').toString().slice(0,30));
  });
  if (r) anota("home", "sem anel de foco", r);
}

/* ---- Ordem de tabulação e skip link ---- */
await p.goto(BASE, { waitUntil: "networkidle" });
await p.keyboard.press("Tab");
const primeiro = await p.evaluate(() => document.activeElement.textContent?.trim().slice(0, 30));
if (!/pular/i.test(primeiro || "")) anota("home", "skip link", 'primeiro Tab foi para "' + primeiro + '"');

/* O skip link precisa mesmo levar o foco ao conteúdo. */
await p.keyboard.press("Enter");
await p.waitForTimeout(300);
const apos = await p.evaluate(() => ({
  hash: location.hash,
  ativo: document.activeElement.tagName + " " + (document.activeElement.id || ""),
}));
if (apos.hash !== "#conteudo") anota("home", "skip link", "não navegou para #conteudo (hash=" + apos.hash + ")");

/* ---- Menu mobile: foco preso e devolvido ---- */
const m = await ctx.newPage();
await m.setViewportSize({ width: 390, height: 844 });
await m.goto(BASE, { waitUntil: "networkidle" });
await m.locator("[aria-label='Abrir menu']").click();
await m.waitForTimeout(700);
/* Tab várias vezes: o foco não pode escapar do painel. */
let escapou = false;
for (let i = 0; i < 25; i++) {
  await m.keyboard.press("Tab");
  const dentro = await m.evaluate(() => !!document.activeElement.closest("#menu-mobile"));
  if (!dentro) { escapou = true; break; }
}
if (escapou) anota("mobile", "armadilha de foco", "o Tab escapou do menu aberto");
await m.keyboard.press("Escape");
await m.waitForTimeout(500);
const devolvido = await m.evaluate(() => document.activeElement.getAttribute("aria-label"));
if (devolvido !== "Abrir menu") anota("mobile", "foco devolvido", "após Esc o foco foi para: " + devolvido);

/* ---- Painel de busca ---- */
await p.goto(BASE, { waitUntil: "networkidle" });
await p.locator("[aria-label='Buscar produtos']").click();
await p.waitForTimeout(400);
const focoBusca = await p.evaluate(() => document.activeElement.id);
if (focoBusca !== "busca-campo") anota("busca", "foco ao abrir", "foco foi para #" + focoBusca);
await p.keyboard.press("Escape");
await p.waitForTimeout(300);
const devolvidoBusca = await p.evaluate(() => document.activeElement.getAttribute("aria-label"));
if (devolvidoBusca !== "Buscar produtos") anota("busca", "foco devolvido", "após Esc: " + devolvidoBusca);

/* ---- Formulário: erro é anunciado e o foco vai para o campo ---- */
await p.goto(BASE + "/produto/clutch-couro-preta", { waitUntil: "networkidle" });
await p.locator('button:has-text("Adicionar à sacola")').click();
await p.waitForTimeout(700);
await p.goto(BASE + "/checkout", { waitUntil: "networkidle" });
await p.waitForSelector("#nome");
await p.locator('button:has-text("Registrar pedido")').click();
await p.waitForTimeout(500);
const focoErro = await p.evaluate(() => document.activeElement.id);
if (!focoErro) anota("checkout", "foco no erro", "o foco não foi para o primeiro campo inválido");
const descrito = await p.evaluate(() => {
  const c = document.getElementById("nome");
  return { invalido: c.getAttribute("aria-invalid"), desc: c.getAttribute("aria-describedby") };
});
if (descrito.invalido !== "true") anota("checkout", "aria-invalid", "campo com erro sem aria-invalid");
if (!descrito.desc) anota("checkout", "aria-describedby", "campo com erro sem aria-describedby");

await nav.close();
encerrar();

if (!problemas.length) {
  console.log("===== nenhum problema estrutural encontrado =====");
} else {
  const porTipo = {};
  problemas.forEach((x) => (porTipo[x.tipo] = porTipo[x.tipo] || []).push(x));
  console.log("===== " + problemas.length + " achados =====");
  for (const [tipo, lista] of Object.entries(porTipo)) {
    console.log("\n## " + tipo + " (" + lista.length + ")");
    const vistos = new Set();
    lista.forEach((x) => {
      const k = x.msg;
      if (vistos.has(k)) return;
      vistos.add(k);
      const paginas = lista.filter((y) => y.msg === k).map((y) => y.pagina);
      console.log("  " + x.msg + "  [" + (paginas.length > 3 ? paginas.length + " páginas" : paginas.join(", ")) + "]");
    });
  }
}

process.exit(problemas.length ? 1 : 0);
