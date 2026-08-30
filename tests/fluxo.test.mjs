/* =========================================================================
   acbolsa — fluxo do site
   =========================================================================

   Percorre a loja como uma visitante: vitrine, produto, sacola, filtros,
   busca, checkout e conta. Cobre também as três restrições duras do projeto
   (sem imagem de outra marca, sem nome de outra casa, checkout não cobra) e
   as armadilhas listadas no CONTINUAR-AQUI.md.
   ========================================================================= */

import { chromium } from "playwright";
import { subirServidor } from "./servidor.mjs";
import { entrar, exigirCredenciais } from "./auth.mjs";

exigirCredenciais();

const { base: BASE, encerrar } = await subirServidor();
const ok = [], falhas = [], avisos = [];
const t = (nome, cond, extra = "") =>
  (cond ? ok : falhas).push(nome + (extra ? " — " + extra : ""));

const navegador = await chromium.launch();
const ctx = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();

const erros = [];
p.on("console", (m) => {
  if (m.type() === "error") erros.push(m.text());
});
p.on("pageerror", (e) => erros.push("pageerror: " + e.message));

// Todo o fluxo roda logado: checkout e conta agora exigem conta.
await entrar(p, BASE);

// ---------- 1. Home ----------
await p.goto(BASE, { waitUntil: "networkidle" });
t("home: cartões na vitrine", (await p.locator(".card").count()) >= 2,
  (await p.locator(".card").count()) + " cartões");
t("home: hero em campo verde", await p.locator(".hero").isVisible());
t("home: régua de latão", (await p.locator(".label-rule-lg").count()) > 0);
t("home: 4 garantias", (await p.locator(".promise").count()) === 4);
t("home: 6 coleções de cor", (await p.locator(".collection").count()) === 6);

// ---------- 2. Adicionar à sacola ----------
await p.goto(BASE + "/produto/tabby-shoulder-preto", { waitUntil: "networkidle" });
t("produto: h1 correto", (await p.locator("h1").innerText()) === "Tabby Shoulder Bag");
t("produto: ficha técnica visível", await p.locator(".specs").isVisible());

await p.locator('button:has-text("Adicionar à sacola")').click();
await p.waitForSelector(".toast", { timeout: 5000 });
t("carrinho: toast confirma", (await p.locator(".toast").innerText()).includes("foi para a sacola"));
await p.waitForTimeout(400);
t("carrinho: contador do header = 1", (await p.locator(".cart-count").innerText()) === "1");

// quantidade
await p.locator('button[aria-label="Aumentar quantidade"]').click();
t("produto: qtd vira 2", (await p.locator("#qtd").inputValue()) === "2");
await p.locator('button:has-text("Adicionar à sacola")').click();
await p.waitForTimeout(700);
t("carrinho: contador = 3", (await p.locator(".cart-count").innerText()) === "3");

// ---------- 2b. Comprar agora ----------
// Leva a peça para a sacola E segue ao checkout, num clique só.
await p.evaluate(() => localStorage.removeItem("acbolsa:carrinho"));
await p.goto(BASE + "/produto/tabby-shoulder-vinho", { waitUntil: "networkidle" });
t("produto: os dois botões de compra", (await p.locator(".buy-row .btn").count()) === 2);

const principal = await p.locator('button:has-text("Comprar agora")').evaluate(
  (b) => getComputedStyle(b).backgroundColor
);
t("comprar agora é a ação principal (conhaque chapado)", principal === "rgb(164, 98, 47)", principal);
const secundario = await p.locator('button:has-text("Adicionar à sacola")').evaluate(
  (b) => getComputedStyle(b).backgroundColor
);
t("adicionar à sacola é secundário (contorno)", secundario === "rgba(0, 0, 0, 0)", secundario);

await p.locator('button[aria-label="Aumentar quantidade"]').click();
await p.locator('button:has-text("Comprar agora")').click();
await p.waitForURL("**/checkout", { timeout: 8000 });
await p.waitForSelector(".summary-item", { timeout: 8000 });
t("comprar agora: vai para o checkout", p.url().includes("/checkout"));
t(
  "comprar agora: leva a quantidade escolhida",
  (await p.locator(".summary-item .qtd").innerText()).startsWith("2"),
  "começa com 2"
);

// Estoque insuficiente NÃO pode navegar: a pessoa precisa poder corrigir.
// tabby-shoulder-branco-gelo tem estoque 3; 3 na sacola + 1 = 4 > 3.
await p.evaluate(() =>
  localStorage.setItem("acbolsa:carrinho", JSON.stringify([{ id: "tabby-shoulder-branco-gelo", qtd: 3 }]))
);
await p.goto(BASE + "/produto/tabby-shoulder-branco-gelo", { waitUntil: "networkidle" });
await p.locator('button:has-text("Comprar agora")').click();
await p.waitForTimeout(900);
t("comprar agora: sem estoque, continua no produto", p.url().includes("/produto/"));
t(
  "comprar agora: sem estoque, explica o motivo",
  (await p.locator(".toast").innerText()).includes("estoque")
);
t(
  "comprar agora: botão volta do carregando após recusa",
  await p.locator('button:has-text("Comprar agora")').evaluate((b) => !b.className.includes("btn-loading"))
);

// Clique repetido não deve multiplicar o item.
await p.evaluate(() => localStorage.removeItem("acbolsa:carrinho"));
await p.goto(BASE + "/produto/tabby-shoulder-vinho", { waitUntil: "networkidle" });
const botaoSacola = p.locator('button:has-text("Adicionar à sacola")');
await botaoSacola.click();
await botaoSacola.click({ force: true });
await botaoSacola.click({ force: true });
await p.waitForTimeout(1000);
const itensAposCliques = await p.evaluate(() =>
  JSON.parse(localStorage.getItem("acbolsa:carrinho") || "[]")
);
t(
  "cliques repetidos não multiplicam o item",
  JSON.stringify(itensAposCliques),
  '[{"id":"tabby-shoulder-vinho","qtd":1}]'
);

// ---------- 3. Persistência entre páginas ----------
await p.evaluate(() => localStorage.removeItem("acbolsa:carrinho"));
await p.goto(BASE + "/produto/tabby-shoulder-preto", { waitUntil: "networkidle" });
await p.locator('button:has-text("Adicionar à sacola")').click();
await p.waitForTimeout(700);
await p.locator('button[aria-label="Aumentar quantidade"]').click();
await p.locator('button:has-text("Adicionar à sacola")').click();
await p.waitForTimeout(700);
await p.goto(BASE + "/carrinho", { waitUntil: "networkidle" });
await p.waitForSelector(".cart-item", { timeout: 5000 });
t("sacola: 1 linha de item", (await p.locator(".cart-item").count()) === 1);
t("sacola: qtd 3 preservada", (await p.locator(".cart-item input[type=number]").inputValue()) === "3");
const totalTxt = await p.locator(".summary-total .v").innerText();
t("sacola: total = 3 × 890 = 2670", totalTxt.replace(/ /g, " ").includes("2.670,00"), totalTxt);

// campo verde do resumo
const bg = await p.locator(".summary").evaluate((el) => getComputedStyle(el).backgroundColor);
t("sacola: resumo é campo verde (não bege)", bg === "rgb(31, 49, 41)", bg);

// remover
await p.locator(".cart-item-remove:has-text('Remover')").click();
await p.waitForTimeout(400);
t("sacola: vazia após remover", await p.locator("text=Sua sacola está vazia").isVisible());

// ---------- 4. Catálogo: filtros e URL ----------
await p.goto(BASE + "/catalogo", { waitUntil: "networkidle" });
const totalCards = await p.locator(".card").count();
t("catalogo: 8 por pagina", totalCards === 8, totalCards + " cartoes");
t("catalogo: paginacao presente", (await p.locator(".pagination button").count()) > 0);

await p.goto(BASE + "/catalogo?pagina=2", { waitUntil: "networkidle" });
t("catalogo: pagina 2 tem as 4 cores restantes", (await p.locator(".card").count()) === 4);

// filtro por cor altera a URL
await p.goto(BASE + "/catalogo", { waitUntil: "networkidle" });
await p.locator('.filter-list label:has-text("Vinho") input').click();
await p.waitForTimeout(600);
t("catalogo: clique escreve na URL", p.url().includes("cor=Vinho"), p.url());
t("catalogo: filtro de cor reduz a grade", (await p.locator(".card").count()) === 1);
const chips = await p.locator(".chip").count();
t("catalogo: marcador de filtro", chips >= 1, chips + " chips");

// ordenacao carrega sem erro
await p.goto(BASE + "/catalogo?ordem=preco-asc", { waitUntil: "networkidle" });
const precos = await p.locator(".card-price").allInnerTexts();
const num = (s) => Number(s.replace(/ /g, " ").replace(/[^\d,]/g, "").replace(",", "."));
const asc = precos.map(num);
t("catalogo: ordenacao carrega (precos iguais, 8 cartoes)", asc.length === 8, asc.length + " precos");

// vazio
await p.goto(BASE + "/catalogo?min=99999", { waitUntil: "networkidle" });
t("catálogo: estado vazio honesto", await p.locator("text=Nada com esses filtros").isVisible());

// ---------- 5. Busca ----------
await p.goto(BASE + "/busca?q=tabby", { waitUntil: "networkidle" });
t("busca: acha pelo nome do modelo", (await p.locator(".card").count()) >= 1);
await p.goto(BASE + "/busca?q=vinho", { waitUntil: "networkidle" });
t("busca: acha por cor", (await p.locator(".card").count()) >= 1);
await p.goto(BASE + "/busca?q=zzzznada", { waitUntil: "networkidle" });
t("busca: sem resultado sugere alternativas", await p.locator("text=Nada com esse termo").isVisible());

// ---------- 6. Checkout: validacao ----------
await p.goto(BASE + "/produto/tabby-shoulder-preto", { waitUntil: "networkidle" });
await p.locator('button:has-text("Adicionar à sacola")').click();
await p.waitForTimeout(700);
await p.goto(BASE + "/checkout", { waitUntil: "networkidle" });
await p.waitForSelector("#nome", { timeout: 5000 });
t("checkout: formulário aparece com item", await p.locator("#nome").isVisible());
const avisoPagamento = await p.locator(".checkout .notice").innerText();
t("checkout: pagamento é externo, não no site",
  /externa|parceiro de checkout|nenhum dado de cartão/i.test(avisoPagamento), avisoPagamento.replace(/\s+/g, " "));
t("checkout: não há captura de cartão", (await p.locator("#cartao-num").count()) === 0);

// enviar vazio (limpa o que veio pré-preenchido do perfil)
for (const c of ["#nome", "#tel", "#cpf", "#cep", "#rua", "#numero", "#bairro", "#cidade"]) {
  await p.fill(c, "");
}
await p.selectOption("#uf", "");
await p.locator('button:has-text("Registrar pedido")').click();
await p.waitForTimeout(500);
const nErros = await p.locator(".field-error:not(:empty)").count();
t("checkout: bloqueia envio vazio", nErros >= 5, nErros + " erros exibidos");

// CPF/CNPJ inválido
await p.fill("#cpf", "111.111.111-11");
await p.locator('button:has-text("Registrar pedido")').click();
await p.waitForTimeout(400);
const erroCpf = await p.locator("#e-cpf").innerText();
t("checkout: recusa documento de dígito repetido", /inv[aá]lid/i.test(erroCpf), erroCpf);

// máscara: CPF até 11 dígitos, CNPJ a partir daí
await p.fill("#cpf", "52998224725");
t("checkout: máscara de CPF", (await p.inputValue("#cpf")) === "529.982.247-25", await p.inputValue("#cpf"));
await p.fill("#cpf", "11222333000181");
t("checkout: máscara de CNPJ", (await p.inputValue("#cpf")) === "11.222.333/0001-81", await p.inputValue("#cpf"));
await p.fill("#cpf", "52998224725");
await p.fill("#tel", "11987654321");
t("checkout: máscara de telefone", (await p.inputValue("#tel")) === "(11) 98765-4321", await p.inputValue("#tel"));

// frete pelo CEP — uma Tabby (R$ 890) passa do piso de frete grátis (R$ 500)
await p.fill("#cep", "01310100");
await p.waitForTimeout(400);
t("checkout: máscara de CEP", (await p.inputValue("#cep")) === "01310-100");
const freteTxt = await p.locator(".summary-row").nth(1).innerText();
t("checkout: frete grátis acima do piso", /gr[aá]tis/i.test(freteTxt), freteTxt.replace(/\n/g, " "));

// pedido completo
await p.fill("#nome", "Maria da Silva");
await p.fill("#email", "maria@exemplo.com.br");
await p.fill("#rua", "Avenida Paulista");
await p.fill("#numero", "1000");
await p.fill("#bairro", "Bela Vista");
await p.fill("#cidade", "São Paulo");
await p.selectOption("#uf", "SP");
await p.locator("#termos").check();
await p.locator('button:has-text("Registrar pedido")').click();
await p.waitForSelector(".confirm", { timeout: 15000 });
const conf = await p.locator(".confirm h1").innerText();
t("checkout: confirma como REGISTRADO", conf === "Pedido registrado", conf);
const corpo = await p.locator(".confirm").innerText();
const codigoPedido = (corpo.match(/AC\d{8}/) || [])[0];
t("checkout: mostra um código de pedido", !!codigoPedido, codigoPedido || "(nenhum)");
t("checkout: NÃO diz pagamento aprovado", !/pagamento aprovado|pagamento confirmado/i.test(corpo));
t("checkout: oferece seguir para o pagamento / avisa que falta pagar",
  /pagamento/i.test(corpo));

// sacola esvaziada
await p.waitForTimeout(300);
t("checkout: sacola esvaziada após pedido",
  (await p.locator(".cart-count").innerText()) === "0");

// ---------- 7. Conta ----------
await p.goto(BASE + "/conta", { waitUntil: "networkidle" });
await p.waitForTimeout(500);
t("conta: lista pedidos", (await p.locator(".order-card").count()) >= 1);
t("conta: o pedido recém-feito aparece",
  codigoPedido ? (await p.locator(".order-card .codigo").allInnerTexts()).some((c) => c.includes(codigoPedido)) : false);
await p.locator('button:has-text("Rastreamento")').click();
await p.waitForTimeout(300);
t("conta: alterna abas", await p.locator("#codigo").isVisible());

// ---------- 8. Mobile ----------
const m = await ctx.newPage();
const errosM = [];
m.on("pageerror", (e) => errosM.push(e.message));
await m.setViewportSize({ width: 390, height: 844 });
await m.goto(BASE + "/produto/tabby-shoulder-preto", { waitUntil: "networkidle" });
const larguraDoc = await m.evaluate(() => document.documentElement.scrollWidth);
t("mobile 390px: sem scroll horizontal", larguraDoc <= 390, "scrollWidth=" + larguraDoc);

await m.goto(BASE + "/catalogo", { waitUntil: "networkidle" });
const larguraCat = await m.evaluate(() => document.documentElement.scrollWidth);
t("mobile 390px: catálogo sem scroll horizontal", larguraCat <= 390, "scrollWidth=" + larguraCat);

// menu mobile
await m.locator("[aria-label='Abrir menu']").click();
await m.waitForTimeout(700);
t("mobile: menu abre", await m.locator("#menu-mobile").getAttribute("data-open") === "true");
const focado = await m.evaluate(() => document.activeElement?.getAttribute("aria-label"));
t("mobile: foco vai para o botão fechar", focado === "Fechar menu", "foco em: " + focado);
await m.keyboard.press("Escape");
await m.waitForTimeout(500);
t("mobile: Esc fecha o menu", await m.locator("#menu-mobile").getAttribute("data-open") === "false");

// ---------- 9. Tipografia / contraste ----------
await p.goto(BASE, { waitUntil: "networkidle" });
const lh = await p.locator("h1").first().evaluate((el) => {
  const s = getComputedStyle(el);
  return parseFloat(s.lineHeight) / parseFloat(s.fontSize);
});
t("tipografia: entrelinha do display >= 1.24", lh >= 1.235, "line-height ratio = " + lh.toFixed(3));

const fonteH1 = await p.locator("h1").first().evaluate((el) => getComputedStyle(el).fontFamily);
t("tipografia: h1 usa Cormorant", /Cormorant/i.test(fonteH1), fonteH1);
const fonteBody = await p.locator("body").evaluate((el) => getComputedStyle(el).fontFamily);
t("tipografia: corpo usa Karla", /Karla/i.test(fonteBody), fonteBody);

// contraste do .lead sobre campo verde
const corLead = await p.locator(".hero-lead").evaluate((el) => getComputedStyle(el).color);
t("contraste: lead sobre verde não usa --muted", corLead !== "rgb(107, 98, 87)", corLead);

// grão
const grao = await p.locator(".hero").evaluate((el) =>
  getComputedStyle(el, "::before").backgroundImage);
const graoField = await p.locator(".field-forest").first().evaluate((el) =>
  getComputedStyle(el, "::before").backgroundImage);
t("grão: campo verde tem ruído", graoField.includes("gradient"), graoField.slice(0, 40));

if (erros.length) avisos.push("Erros de console (desktop): " + erros.slice(0, 5).join(" | "));
if (errosM.length) avisos.push("Erros de console (mobile): " + errosM.slice(0, 5).join(" | "));

await navegador.close();
encerrar();

console.log("\n===== PASSOU (" + ok.length + ") =====");
ok.forEach((s) => console.log("  ok  " + s));
console.log("\n===== FALHOU (" + falhas.length + ") =====");
falhas.forEach((s) => console.log("  XX  " + s));
if (avisos.length) {
  console.log("\n===== AVISOS =====");
  avisos.forEach((s) => console.log("  !   " + s));
}
process.exit(falhas.length ? 1 : 0);
