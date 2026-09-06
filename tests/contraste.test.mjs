/* =========================================================================
   acbolsa — contraste (WCAG AA)
   =========================================================================

   Mede o contraste REAL de cada texto renderizado: sobe a árvore até achar
   um fundo opaco, compõe alfa, e aplica o limiar certo por tamanho e peso.

   Existe porque o texto do rodapé já ficou em 2.69:1 em TODAS as páginas com
   a exceção de contraste declarada e aparentemente correta. Ver a seção de
   contraste no CONTINUAR-AQUI.md.
   ========================================================================= */

import { chromium } from "playwright";
import { subirServidor } from "./servidor.mjs";
import { entrar, exigirCredenciais } from "./auth.mjs";

exigirCredenciais();

const { base: BASE, encerrar } = await subirServidor();

/* /conta é medida à parte, já logada (ver abaixo). */
const PAGINAS = [
  ["/", "home"],
  ["/catalogo", "catálogo"],
  ["/catalogo?cor=Vinho", "catálogo filtrado"],
  ["/produto/tabby-shoulder-preto", "produto"],
  ["/produto/tabby-shoulder-jacquard-azul", "produto jacquard"],
  ["/carrinho", "sacola vazia"],
  ["/busca?q=couro", "busca"],
  ["/busca?q=zzz", "busca sem resultado"],
  ["/entrar", "entrar"],
  ["/criar-conta", "criar conta"],
  ["/recuperar-senha", "recuperar senha"],
  ["/ajuda", "ajuda"],
];

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();

const MEDIDOR = `(() => {
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
  const lum = ([r,g,b]) => 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
  const rgb = (s) => (s.match(/[\\d.]+/g) || []).map(Number);

  /* Mistura uma cor com alfa sobre o fundo já resolvido. */
  const sobre = (fg, bg) => {
    const a = fg.length > 3 ? fg[3] : 1;
    return [0,1,2].map(i => fg[i]*a + bg[i]*(1-a));
  };

  /* Sobe a árvore até achar um fundo opaco de verdade. */
  const fundoDe = (el) => {
    let pilha = [], n = el;
    while (n && n !== document.documentElement) {
      const c = rgb(getComputedStyle(n).backgroundColor);
      if (c.length && (c.length < 4 || c[3] > 0)) {
        pilha.push(c);
        if (c.length < 4 || c[3] === 1) break;
      }
      n = n.parentElement;
    }
    let acc = [255,255,255];
    for (const c of pilha.reverse()) acc = sobre(c, acc);
    return acc;
  };

  const razao = (a, b) => {
    const [x,y] = [lum(a), lum(b)].sort((m,n) => n-m);
    return (x + 0.05) / (y + 0.05);
  };

  const achados = [];
  for (const el of document.querySelectorAll('body *')) {
    /* Só elementos com texto próprio visível. */
    const texto = [...el.childNodes]
      .filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
    if (!texto) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;

    const fg = sobre(rgb(s.color), fundoDe(el));
    const bg = fundoDe(el);
    const px = parseFloat(s.fontSize);
    const peso = Number(s.fontWeight) || 400;
    /* WCAG: 18pt (24px), ou 14pt (18.66px) em negrito, é "texto grande". */
    const grande = px >= 24 || (px >= 18.66 && peso >= 700);
    const minimo = grande ? 3 : 4.5;
    const c = razao(fg, bg);

    if (c < minimo) {
      achados.push({
        texto: texto.slice(0, 45),
        classe: (el.className || el.tagName).toString().slice(0, 40),
        cor: s.color, fundo: 'rgb(' + bg.map(Math.round).join(',') + ')',
        px, peso, razao: c.toFixed(2), minimo,
      });
    }
  }
  return achados;
})()`;

let total = 0;
for (const [url, nome] of PAGINAS) {
  await p.goto(BASE + url, { waitUntil: "networkidle" });
  const achados = await p.evaluate(MEDIDOR);
  if (achados.length) {
    console.log("\n### " + nome + "  (" + url + ")");
    for (const a of achados) {
      total++;
      console.log(
        "  " + a.razao + ":1 (min " + a.minimo + ")  " + a.px + "px/" + a.peso +
        "  ." + a.classe + "\n      \"" + a.texto + "\"\n      " + a.cor + " sobre " + a.fundo
      );
    }
  }
}

/* Páginas atrás de login. */
await entrar(p, BASE);
for (const [url, nome] of [["/conta", "conta"]]) {
  await p.goto(BASE + url, { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const achados = await p.evaluate(MEDIDOR);
  if (achados.length) {
    console.log("\n### " + nome + "  (" + url + ")");
    for (const a of achados) {
      total++;
      console.log(
        "  " + a.razao + ":1 (min " + a.minimo + ")  " + a.px + "px/" + a.peso +
        "  ." + a.classe + "\n      \"" + a.texto + "\"\n      " + a.cor + " sobre " + a.fundo
      );
    }
  }
}

/* Estados que só existem depois de interação. */
console.log("\n### estados interativos");
await p.goto(BASE + "/produto/tabby-shoulder-preto", { waitUntil: "networkidle" });
await p.locator('button:has-text("Adicionar à sacola")').click();
await p.waitForTimeout(800);
for (const [url, nome] of [["/carrinho", "sacola com item"], ["/checkout", "checkout"]]) {
  await p.goto(BASE + url, { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const achados = await p.evaluate(MEDIDOR);
  if (achados.length) {
    console.log("\n  -- " + nome);
    for (const a of achados) {
      total++;
      console.log(
        "  " + a.razao + ":1 (min " + a.minimo + ")  " + a.px + "px/" + a.peso +
        "  ." + a.classe + "\n      \"" + a.texto + "\"\n      " + a.cor + " sobre " + a.fundo
      );
    }
  }
}

await nav.close();
encerrar();
console.log(
  "\ncontraste: " +
    (total
      ? total + " textos abaixo do mínimo WCAG AA"
      : "nenhum texto abaixo do mínimo WCAG AA")
);
process.exit(total ? 1 : 0);
