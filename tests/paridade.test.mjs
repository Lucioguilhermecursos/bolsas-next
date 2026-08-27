/* =========================================================================
   acbolsa — sanidade do catálogo
   =========================================================================

   O catálogo deixou de ser um port da versão HTML: agora é um único modelo,
   a Tabby Shoulder Bag, em várias cores (decisão do usuário, 25/08/2026).
   Este teste protege as invariantes desse formato e as restrições que
   continuam valendo. Não precisa de navegador.

   O nome do script continua `test:paridade` só para não mexer no
   package.json e no fluxo de quem já roda os testes.
   ========================================================================= */

import { pathToFileURL } from "node:url";
import path from "node:path";
import { criarRelatorio } from "./servidor.mjs";

const NEXT = path.resolve(import.meta.dirname, "../lib/catalog.js");
const c = await import(pathToFileURL(NEXT).href);
const r = criarRelatorio("sanidade do catálogo");

/* ---- Estrutura ---- */
r.t("tem produtos", c.PRODUTOS.length > 0);
r.t("chaves de CATEGORIAS", JSON.stringify(Object.keys(c.CATEGORIAS)), '["ombro"]');
r.t("ORDEM_CATEGORIAS", JSON.stringify(c.ORDEM_CATEGORIAS), '["ombro"]');

const CAMPOS = [
  "id", "nome", "cat", "preco", "cor", "hex", "material", "medidas", "alca",
  "detalhes", "cuidados", "descricao", "estoque", "linha", "fotos",
];
let faltando = [];
c.PRODUTOS.forEach((p) => {
  for (const campo of CAMPOS) {
    if (p[campo] === undefined || p[campo] === null) faltando.push(p.id + "." + campo);
  }
});
r.t("todos os produtos têm os campos obrigatórios", faltando.join(", ") || "(ok)", "(ok)");

/* ---- Um modelo, várias cores ---- */
const ids = c.PRODUTOS.map((p) => p.id);
r.t("ids únicos", new Set(ids).size, ids.length);
r.t("todos são 'Tabby Shoulder Bag'", c.PRODUTOS.every((p) => p.nome === "Tabby Shoulder Bag"));
r.t("todos na categoria 'ombro'", c.PRODUTOS.every((p) => p.cat === "ombro"));
r.t("todos compartilham a mesma linha", new Set(c.PRODUTOS.map((p) => p.linha)).size, 1);

/* ---- Helpers ---- */
const qualquer = c.PRODUTOS[0];
r.t(
  "variantesDeCor devolve as outras cores",
  c.variantesDeCor(qualquer).length,
  c.PRODUTOS.length - 1
);
r.t("porId acha", c.porId(qualquer.id)?.id, qualquer.id);
r.t("porId com id inexistente devolve null", c.porId("nao-existe"), null);
r.t("buscar('tabby') acha o modelo", c.buscar("tabby").length > 0);
r.t("buscar('zzz') não acha nada", c.buscar("zzz").length, 0);
r.t(
  "cores() = número de cores distintas",
  c.cores().length,
  new Set(c.PRODUTOS.map((p) => p.cor)).size
);
r.t("porCor filtra pela cor", c.porCor(qualquer.cor).every((p) => p.cor === qualquer.cor));

/* ---- Restrições que continuam valendo ---- */
/* A decisão do usuário liberou SÓ o nome "Tabby Shoulder Bag" (Coach).
   Nenhum outro nome de casa de moda pode entrar sem nova confirmação. */
const OUTRAS_CASAS =
  /herm[eè]s|louis vuitton|gucci|prada|bottega|valentino|dior|chanel|picotin|strathberry/i;
const sujos = c.PRODUTOS.filter((p) =>
  OUTRAS_CASAS.test([p.nome, p.descricao, p.material, p.cor].join(" "))
);
r.t("nenhum outro nome de casa de moda", sujos.map((p) => p.id).join(",") || "(nenhum)", "(nenhum)");

/* As fotos podem ser preenchidas quando existirem — nunca apontando para os
   assets da versão anterior (campanha da Strathberry). */
const fotosProibidas = c.PRODUTOS.flatMap((p) =>
  (p.fotos || [])
    .filter((f) => /assets\//i.test(f) || /strathberry/i.test(f))
    .map((f) => p.id + ": " + f)
);
r.t("nenhuma foto nos assets da versão anterior", fotosProibidas.join(", ") || "(nenhuma)", "(nenhuma)");

process.exit(r.fechar() ? 1 : 0);
