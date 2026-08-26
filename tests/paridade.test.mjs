/* =========================================================================
   acbolsa — paridade com a versão HTML
   =========================================================================

   Compara `lib/catalog.js` com o catálogo original em
   `d:\Antigravity\bolsas\js\catalog.js`, produto a produto e helper a
   helper. Carrega os dois de verdade — não conta linha com regex.

   Se a versão HTML de referência não existir mais nesta máquina, o teste
   avisa e passa: a paridade já foi verificada, e a ausência da pasta não é
   falha do projeto.
   ========================================================================= */

import fs from "node:fs";
import vm from "node:vm";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { criarRelatorio } from "./servidor.mjs";

const HTML = "d:/Antigravity/bolsas/js/catalog.js";
const NEXT = path.resolve(import.meta.dirname, "../lib/catalog.js");

const r = criarRelatorio("paridade do catálogo");

if (!fs.existsSync(HTML)) {
  console.log("aviso: " + HTML + " não encontrado — pulando a comparação.");
  process.exit(0);
}

/* A versão HTML é um script global: avalia num contexto e colhe as consts. */
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(
  fs.readFileSync(HTML, "utf8") +
    "\n;globalThis.__out = { PRODUTOS, CATEGORIAS, ORDEM_CATEGORIAS, Catalogo, formatarPreco };",
  ctx
);
const velho = ctx.__out;
const novo = await import(pathToFileURL(NEXT).href);

r.t("mesma quantidade de produtos", novo.PRODUTOS.length, velho.PRODUTOS.length);
r.t("21 produtos", novo.PRODUTOS.length, 21);
r.t(
  "chaves de CATEGORIAS",
  JSON.stringify(Object.keys(novo.CATEGORIAS)),
  JSON.stringify(Object.keys(velho.CATEGORIAS))
);
r.t(
  "ORDEM_CATEGORIAS",
  JSON.stringify(novo.ORDEM_CATEGORIAS),
  JSON.stringify(velho.ORDEM_CATEGORIAS)
);

/* ---- Produto a produto, campo a campo ---- */
const CAMPOS = [
  "id", "nome", "cat", "preco", "precoDe", "cor", "hex", "material", "medidas",
  "alca", "detalhes", "cuidados", "descricao", "estoque", "novo", "destaque",
  "vendas", "linha", "fotos",
];

let divergencias = 0;
velho.PRODUTOS.forEach((a, i) => {
  const b = novo.PRODUTOS[i];
  if (!b) return r.anota("falta o produto " + a.id);
  for (const c of CAMPOS) {
    const x = JSON.stringify(a[c] ?? null);
    const y = JSON.stringify(b[c] ?? null);
    if (x !== y) {
      divergencias++;
      r.anota(a.id + "." + c + ": " + x + " != " + y);
    }
  }
});
r.t("todos os campos de todos os produtos batem", divergencias, 0);

/* ---- Helpers devolvem o mesmo ---- */
const C = velho.Catalogo;
const ids = (arr) => arr.map((p) => p.id).join(",");

const pares = [
  ["todos()", ids(C.todos()), ids(novo.todos())],
  ["porCategoria(tote)", ids(C.porCategoria("tote")), ids(novo.porCategoria("tote"))],
  ["porCategoria(bolsas)", ids(C.porCategoria("bolsas")), ids(novo.porCategoria("bolsas"))],
  ["porCategoria(acessorios)", ids(C.porCategoria("acessorios")), ids(novo.porCategoria("acessorios"))],
  ["novidades()", ids(C.novidades()), ids(novo.novidades())],
  ["destaques()", ids(C.destaques()), ids(novo.destaques())],
  ["maisVendidos(5, true)", ids(C.maisVendidos(5, true)), ids(novo.maisVendidos(5, true))],
  ["maisVendidos(5)", ids(C.maisVendidos(5)), ids(novo.maisVendidos(5))],
  ["buscar(couro)", ids(C.buscar("couro")), ids(novo.buscar("couro"))],
  ["buscar(preto)", ids(C.buscar("preto")), ids(novo.buscar("preto"))],
  ["buscar(sem correspondência)", ids(C.buscar("zzz")), ids(novo.buscar("zzz"))],
  [
    "variantesDeCor(hobo)",
    ids(C.variantesDeCor(C.porId("hobo-couro-castanho"))),
    ids(novo.variantesDeCor(novo.porId("hobo-couro-castanho"))),
  ],
  [
    "variantesDeCor(peça única)",
    ids(C.variantesDeCor(C.porId("tote-raffia-natural"))),
    ids(novo.variantesDeCor(novo.porId("tote-raffia-natural"))),
  ],
  [
    "relacionados()",
    ids(C.relacionados(C.porId("tote-raffia-natural"))),
    ids(novo.relacionados(novo.porId("tote-raffia-natural"))),
  ],
  ["faixaDePreco()", JSON.stringify(C.faixaDePreco()), JSON.stringify(novo.faixaDePreco())],
  ["formatarPreco(285)", velho.formatarPreco(285), novo.formatarPreco(285)],
];

for (const [nome, a, b] of pares) r.t("helper " + nome, b, a);

/* ---- As restrições duras do projeto ---- */
const PROIBIDOS =
  /herm[eè]s|louis vuitton|gucci|prada|coach|bottega|valentino|dior|chanel|picotin|monogram|tabby|strathberry/i;
const sujos = novo.PRODUTOS.filter((p) =>
  PROIBIDOS.test([p.nome, p.descricao, p.material, p.cor].join(" "))
);
r.t("nenhum nome de outra casa de moda", sujos.map((p) => p.id).join(",") || "(nenhum)", "(nenhum)");

/* As fotos podem (e devem) ser preenchidas um dia. O que NÃO pode é apontar
   para a pasta assets/ da versão anterior, que é campanha da Strathberry. */
const fotosProibidas = novo.PRODUTOS.flatMap((p) =>
  (p.fotos || [])
    .filter((f) => /assets\//i.test(f) || /strathberry/i.test(f))
    .map((f) => p.id + ": " + f)
);
r.t(
  "nenhuma foto apontando para os assets da versão anterior",
  fotosProibidas.join(", ") || "(nenhuma)",
  "(nenhuma)"
);

process.exit(r.fechar() ? 1 : 0);
