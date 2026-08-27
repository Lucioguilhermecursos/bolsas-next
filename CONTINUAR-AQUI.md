# Continuação — migração da acbolsa para Next

> Este arquivo existe para retomar o trabalho numa sessão nova.
> **Leia junto:** `PRODUCT.md` (o que é o produto) e `DESIGN.md` (o sistema visual).

---

## Contexto em um parágrafo

A acbolsa é uma loja de bolsas de couro. Existe hoje em `acbolsa.com`
(WordPress) e está sendo **recriada do zero**. Uma primeira versão completa foi
construída em HTML/CSS/JS puros em `d:\Antigravity\bolsas` — está pronta,
auditada e funcionando. Depois disso ficou claro que o projeto deveria ser em
**Next**, e esta pasta é a migração. A versão em HTML permanece intacta e serve
como **referência de paridade**: tudo que ela faz, esta precisa fazer.

## Decisões já tomadas (não reabrir)

| Decisão | Valor |
|---|---|
| Framework | Next 16, App Router |
| Estilo | Tailwind 4 (tema via `@theme` no `globals.css`, não em `tailwind.config.js`) |
| TypeScript | **Não.** JavaScript puro, por escolha do usuário |
| Backend | Nenhum por enquanto. Catálogo em arquivo, carrinho no cliente |
| Idioma | Português do Brasil, em todo o código e conteúdo |
| Pasta | Projeto novo aqui; `d:\Antigravity\bolsas` fica intocada |

## ⚠️ Três restrições duras do projeto

**1. As imagens em `d:\Antigravity\bolsas\assets\` são de outra marca.**
São fotografia de campanha da **Strathberry** — o logotipo aparece gravado no
couro em várias delas. Não foram copiadas para cá e **não devem ser**. Todo
espaço de imagem usa um placeholder marcado ("Foto a substituir") na proporção
final correta.

**2. Nome de modelo de outra marca — só a Tabby Shoulder Bag.**
A regra original era não usar nome de outra casa de moda (o site antigo
vendia "Hermès Picotin Lock", "Coach Tabby"). Decisão do usuário em
25/08/2026: o catálogo passou a ser um único modelo, a **Tabby Shoulder Bag
(Coach)**, em várias cores, com o nome de modelo real. Vale só para essa
decisão — não é licença para copiar outro nome sem confirmar.

**3. O checkout não cobra nada.**
Sem servidor não há pagamento. A confirmação diz "Pedido registrado", nunca
"pagamento aprovado". Dados de cartão nunca são gravados — os campos ficam
`disabled` quando ocultos, e o objeto do pedido guarda só `{forma, parcelas}`.

---

## Estado atual

**A migração está completa.** Todas as páginas foram portadas, o build de
produção passa e a paridade com a versão HTML foi verificada.

### Estrutura

```
lib/
  catalog.js      Tabby Shoulder Bag em 12 cores (tabela CORES), CATEGORIAS, helpers
  carrinho.js     armazenamento e operações puras da sacola
  formulario.js   máscaras, CPF com dígito verificador, frete, pedidos
components/
  Icones.js  Placeholder.js  CartaoProduto.js  Header.js  Footer.js
  Acordeao.js  Newsletter.js  Revelar.js  useHidratado.js
  CarrinhoContexto.js  ToastContexto.js
app/
  globals.css     tokens do @theme + apelidos curtos + base
  components.css  cartão, placeholder, header, rodapé, toast
  pages.css       home e páginas internas
  page.js  catalogo/  produto/[id]/  carrinho/  checkout/
  busca/  conta/  sobre/  ajuda/  not-found.js
tests/
  servidor.mjs    sobe o build numa porta própria e derruba no fim
  paridade.test.mjs  fluxo.test.mjs  estilos.test.mjs
  contraste.test.mjs  estrutura.test.mjs
```

### Como o CSS foi portado

O CSS de componente veio da versão HTML **sem mudança de valor**. Os tokens de
nome curto (`--ink`, `--s-5`) viraram **apelidos** dos tokens do `@theme` no
`globals.css`, em vez de reescrever ~2000 linhas auditadas — onde cada troca
seria uma chance de errar um valor. Uma cor tem uma definição só: a do `@theme`.

Os dois arquivos portados são importados **dentro da camada `components`**:

```css
@import "./components.css" layer(components);
@import "./pages.css" layer(components);
```

Sem `layer(...)` eles entrariam sem camada — e CSS sem camada vence CSS em
camada, por mais específico que este seja. Solto, o CSS portado passaria por
cima do design system inteiro.

### Onde colocar estilo — nesta ordem

1. **Classe de componente** (`components.css` / `pages.css`) quando o padrão
   se repete ou tem nome no sistema: `.cart-acoes`, `.empty--pagina`,
   `.form-busca`, `.frete-estimado`.
2. **Utilitário Tailwind** para espaçamento pontual: `mt-6`, `mb-8`, `py-14`.
   A escala do projeto é subconjunto exato da base 4px do Tailwind —
   `--s-5` = 24px = `6`. A tabela completa está abaixo.
3. **`style` inline** só para valor que vem dos dados. Hoje são 4 casos, todos
   `background: produto.hex` — a cor da peça vem do catálogo.

| `--s-N` | px | utilitário |
|---|---|---|
| `--s-1` | 4 | `1` |
| `--s-2` | 8 | `2` |
| `--s-3` | 12 | `3` |
| `--s-4` | 16 | `4` |
| `--s-5` | 24 | `6` |
| `--s-6` | 32 | `8` |
| `--s-7` | 40 | `10` |
| `--s-8` | 56 | `14` |
| `--s-9` | 72 | `18` |
| `--s-10` | 96 | `24` |
| `--s-11` | 128 | `32` |
| `--s-12` | 160 | `40` |

### Contraste em campo escuro — como funciona agora

A regra é **estrutural**, não uma lista de nomes. O campo escuro declara o seu
cinza secundário numa variável, e quem escreve texto secundário lê a variável:

```css
.field-forest, .field-ink, .site-footer, .hero, .summary {
  --muted-local: var(--color-muted-forest);
}

.texto-suave, .label, .lead, .field-hint {
  color: var(--muted-local, var(--color-muted));
}
```

**Campo escuro novo** entra só na primeira lista. **Classe de texto nova** não
precisa ser cadastrada em lugar nenhum — basta ler `--muted-local`.

Exceção: um bloco que traz o próprio fundo claro dentro de um campo escuro
precisa resetar a variável (`--muted-local: var(--muted)`), como faz o `.ph`.

⚠️ **Nunca dar a uma classe do projeto o nome de um utilitário do Tailwind.**
A classe chamava-se `.text-muted`, e o Tailwind gera `.text-muted` sozinho a
partir do token `--color-muted`. A camada `utilities` vence a `components`,
então a versão gerada ganhava sempre e o rodapé ficava em 2.69:1 em todas as
páginas — com a exceção declarada e aparentemente correta. Por isso o nome
agora é `.texto-suave`.

### Decisões da migração que valem saber

- **Estado do catálogo na URL** via `useSearchParams` + `router.replace`. O
  `popstate` manual da versão HTML deixou de ser necessário.
- **Carrinho em `useSyncExternalStore`** — é a API certa para localStorage
  (estado externo, compartilhado entre abas, inexistente no servidor) e resolve
  a hidratação sem `setState` dentro de efeito. `pronto` diz quando o valor
  exibido virou o real; quem mostra contagem precisa esperar por ele.
- **`useHidratado()`** — mesmo mecanismo, para `localStorage` e `location.hash`
  na página de conta.
- **Uma página de produto por cor, pré-renderada** por `generateStaticParams`.
- **Campos de cartão não existem no DOM** quando a forma escolhida não é
  cartão. Mais forte que o `disabled` da versão HTML.
- **Dois botões na página de produto** — "Comprar agora" (conhaque chapado,
  ação principal) e "Adicionar à sacola" (contorno). Os dois fazem a MESMA
  coisa com a sacola; muda só para onde a pessoa vai depois. Não é um fluxo
  paralelo de propósito: se "comprar agora" ignorasse a sacola, quem já tinha
  peças guardadas as perderia de vista no checkout. Quando o estoque não
  comporta, nenhum dos dois navega — a pessoa fica na página para corrigir a
  quantidade, com o motivo dito no toast.

### Verificação feita

- `npm run build` limpo; `npx eslint .` sem erros.
- **56 testes de navegador** (Playwright, desktop e 390px): fluxo de compra
  completo, filtros, ordenação, paginação, busca vazia, validação do checkout,
  máscaras, frete por CEP, foco do menu mobile, ausência de scroll horizontal,
  entrelinha de 1.24, contraste em campo escuro, grão nos campos.
- **35 testes de valor computado**: cada classe que substituiu um `style`
  inline resolve para exatamente os mesmos pixels de antes.
- **Auditoria de acessibilidade**, em 11 páginas mais os estados interativos:
  contraste medido elemento a elemento contra o fundo efetivo (WCAG AA, com o
  limiar certo por tamanho e peso), foco visível com Tab de verdade, prisão e
  devolução de foco nos painéis, alvos de toque, hierarquia de cabeçalhos,
  landmarks, rótulos, `aria-live` e ids duplicados. Zero achados.

### Acessibilidade — o que foi corrigido

- **Contraste do rodapé em 2.69:1 em todas as páginas.** Causa e correção
  estão na seção de contraste acima.
- **Alvo de toque abaixo de 24px** (WCAG 2.2, 2.5.8) nos links de migalha e
  nas políticas do rodapé: 21px de altura. Resolvido com `padding-block: 2px`,
  sem mexer no ritmo da linha.
- **Hierarquia de cabeçalhos com saltos** (h1→h3, h2→h4) em 5 páginas. O CSS
  casava por nível de tag (`.filter-group h3`), o que forçava a escolher o
  nível pela aparência. Agora casa por `:is(h2, h3, h4)` e o nível voltou a
  ser decisão de estrutura. O rodapé e a grade de busca ganharam um `h2` em
  `.sr-only` para as seções filhas não saltarem do `h1`.
- **Catálogo**: a partir de 27/08/2026 deixou de ser o port da versão HTML —
  virou um único modelo, a Tabby Shoulder Bag, em 12 cores (tabela `CORES` em
  `lib/catalog.js`). `test:paridade` passou a validar as invariantes desse
  formato em vez de comparar com a versão HTML.

### O que sobrou para depois

Nada de código bloqueando. O que falta é dado do negócio (ver
"Pendências do negócio" abaixo) e as fotos das peças.

---

## De onde veio cada arquivo

A versão HTML em `d:\Antigravity\bolsas\` continua sendo a referência de
paridade. O mapa de origem, para quando for preciso conferir um comportamento:

| Versão HTML | Next |
|---|---|
| `js/catalog.js` | `lib/catalog.js` |
| `js/site.js` → `Carrinho` | `lib/carrinho.js` + `components/CarrinhoContexto.js` |
| `js/site.js` → `midiaProduto`, `placeholder` | `components/Placeholder.js` |
| `js/site.js` → `cartaoProduto` | `components/CartaoProduto.js` |
| `js/site.js` → `montarHeader`, `MENU`, busca, menu mobile | `components/Header.js` |
| `js/site.js` → `Icones` | `components/Icones.js` |
| `js/site.js` → `Toast` | `components/ToastContexto.js` |
| `css/base.css` | `app/globals.css` |
| `css/components.css` | `app/components.css` |
| `css/home.css` + `css/pages.css` | `app/pages.css` |
| `index.html` | `app/page.js` |
| `catalogo.html` | `app/catalogo/` |
| `produto.html` | `app/produto/[id]/` |
| `carrinho.html` / `checkout.html` | `app/carrinho/` / `app/checkout/` |
| `busca.html` / `conta.html` | `app/busca/` / `app/conta/` |
| `sobre.html` / `ajuda.html` | `app/sobre/` / `app/ajuda/` |

---

## Armadilhas conhecidas (já custaram tempo uma vez)

> Todas continuam valendo e estão cobertas pelos testes de navegador, mas o
> CSS que as resolve é o mesmo — quem mexer nele precisa saber por quê.

**Entrelinha do display.** O Cormorant tem caixa tipográfica de ~1.215em. Com
`line-height` abaixo disso, o topo do circunflexo de "você" e o til de "não"
são **recortados**. O piso é **1.24** e já está no `globals.css`. Não baixar.

**Contraste em campo escuro.** `.lead`, `.label`, `.text-soft` e `.field-hint`
resolvem para `--color-muted`, que sobre verde cai para 2.7:1. A lista de
exceção está no `globals.css`. **Um campo escuro novo precisa entrar nela** — e
nunca "consertar" um caso com alpha inline, que foi como o problema voltou pela
porta de trás na primeira vez.

**Texto pequeno em conhaque/latão.** `--color-cognac` dá 4.19:1 em 13px e
`--color-brass` dá 4.31:1 sobre verde — ambos abaixo do mínimo. Para texto
pequeno usar `--color-cognac-lo` e `--color-brass-text`.

**Grid item vaza no celular.** Item de grid não encolhe abaixo do seu
`min-content` sem `min-width: 0`. Foi o que causou scroll horizontal na página
de produto a 390px.

**Botão estoura a linha.** "Adicionar à sacola" com padding de 40px não cabe ao
lado do seletor de quantidade em 390px. A linha empilha abaixo de 460px.

**Foco em painel que abre.** Elemento com `visibility: hidden` não recebe
`.focus()`. Esperar o `transitionend` antes de focar.

**Carrinho não pode redesenhar tudo.** Um `innerHTML` a cada mudança de
quantidade destrói o foco e fecha o teclado no celular. Em React isso melhora
sozinho, mas vale conferir que o botão "+" mantém o foco após o clique.

---

## Três coisas do sistema visual que não podem se perder

Estão descritas em detalhe no `DESIGN.md`, mas são as que fazem o site parecer
o que é:

1. **A régua de latão** — filete de 1px em `--color-brass` antes do rótulo que
   abre um bloco (`.label-rule`). Uma única declaração de rótulo no sistema
   inteiro. É a assinatura que faz as peças pertencerem ao mesmo objeto.

2. **O campo verde no momento de decisão** — o resumo do carrinho e do checkout
   é campo verde-garrafa com filete de latão no topo, total em
   `--color-brass-text` e botão conhaque chapado dentro. É a única âncora
   escura da página, e o único lugar onde o conhaque age contra campo escuro em
   vez de desaparecer contra bege. **Não é um cartão bege claro.**

3. **O grão** — dois campos de ruído cruzados a ~2% aplicados nos campos
   escuros e no `.field-deep`. Vive no sistema, não dentro do placeholder: se
   estivesse no placeholder, o site ficaria liso no dia em que as fotos reais
   entrassem.

---

## Pendências do negócio (valem para as duas versões)

Estas não são código — são dados que só a dona da loja tem:

- **Razão social, CNPJ e endereço** — obrigatórios (LGPD e CDC)
- **E-mail do encarregado de dados (DPO)**
- **E-mail de atendimento, WhatsApp e horário**
- **Transportadora e prazos reais** (os de `checkout.html` são de exemplo)
- **Gateway de pagamento e bandeiras**
- **Endereço para devolução**
- **Conferir preço e ficha técnica** — `PRECO` e `FICHA` em `lib/catalog.js`
  são de exemplo / da ficha pública do modelo
- **Fotografar as peças** — a lista do que precisa está no
  `d:\Antigravity\bolsas\README.md`

Na versão HTML esses pontos estão marcados com `[PREENCHER]` em `ajuda.html`.

---

## Rodar

```bash
npm run dev     # http://localhost:3000
npm run build   # build de produção
npm test        # compila e roda as 5 suítes
```

### Testes

Vivem em `tests/`. Sobem o próprio servidor na porta 3187 (não na 3000, para
não brigar com um `npm run dev` aberto — nem, pior, rodar contra ele sem
ninguém perceber) e o derrubam no fim, mesmo se o teste quebrar.

| Suíte | O que protege |
|---|---|
| `npm run test:paridade` | Sanidade do catálogo: formato "um modelo, várias cores", helpers e as restrições que continuam valendo. Não precisa de navegador |
| `npm run test:fluxo` | O site como a visitante usa: comprar, filtrar, buscar, finalizar. Inclui 390px e as armadilhas conhecidas |
| `npm run test:estilos` | Cada classe que substituiu um `style` inline resolve para os mesmos pixels |
| `npm run test:contraste` | Contraste medido elemento a elemento (WCAG AA) |
| `npm run test:estrutura` | Teclado, foco, alvo de toque, cabeçalhos, landmarks, rótulos |

`npm test` compila antes de rodar — os testes de navegador rodam contra o
**build**, que é o que a visitante recebe. Se já compilou, `npm run test:only`
pula essa etapa.

Em máquina nova, o Playwright precisa baixar o navegador uma vez:

```bash
npx playwright install chromium
```

Todas as suítes saem com código 1 quando falham. Vale conferir de vez em
quando que ainda **quebram** quando deveriam: um teste que nunca falha não
protege nada. Para conferir, é só desfazer de propósito alguma das correções
listadas acima e ver a suíte correspondente acusar.

Para comparar com a versão HTML:

```bash
cd d:\Antigravity\bolsas
python -m http.server 8000
```

---

## Antes de publicar

1. **Preencher os dados do negócio** — a lista está acima. Os pontos
   aparecem marcados com `[PREENCHER]` em `app/ajuda/page.js`.
2. **Conferir preço, estoque e ficha técnica** em `lib/catalog.js` — o
   catálogo é a Tabby Shoulder Bag em 12 cores; `PRECO`, `FICHA` e a tabela
   `CORES` estão marcados com `[CONFERIR]`. Os nomes de cor foram derivados
   do nome de cada pasta de origem.
3. **Trocar os valores de frete** em `lib/formulario.js` pelos da
   transportadora real — os atuais são de exemplo.
4. **Fotografar as peças** e seguir o `FOTOS.md` na raiz: arquivos em
   `public/fotos/produtos/` nomeados pelo `slug` da cor, e o campo `fotos`
   preenchido na tabela `CORES` do catálogo. O placeholder some sozinho, e a
   galeria com miniaturas entra no lugar.
5. **Remover a fita de aviso** (`.demo-note` em `app/layout.js`) e o texto de
   "site em construção" em `app/ajuda/page.js`.
6. **Ligar o pagamento** — o objeto montado em `finalizar()`, no
   `app/checkout/CheckoutCliente.js`, é o que precisa ser enviado ao backend.
   Enquanto isso não existe, a confirmação continua dizendo "Pedido
   registrado", nunca "pagamento aprovado".
