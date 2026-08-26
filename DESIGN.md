# Design

<!-- impeccable:design-schema 1 -->

## Visual World

Loja de couro que argumenta pelo material. O mundo vem dos próprios assets de
referência: couro conhaque quente fotografado contra fundo de estúdio
verde-garrafa profundo. Esse verde não é decoração — é o segundo campo da
marca, e toma seções inteiras da página, não apenas detalhes.

Recusa explícita: o grid de cartões brancos flutuando sobre creme, com sombra
difusa e cantos arredondados, que é o default de loja de moda. Aqui os campos
de cor são chapados e de página inteira, os fios têm 1px, os cantos são retos.

## Color

Estratégia: **Full palette** — três papéis nomeados, cada um dono de regiões
inteiras.

```css
--paper:      #F3EFE7;  /* ground quente, papel não-branqueado */
--paper-deep: #E8E1D4;  /* alternância de seção sobre paper */
--ink:        #1A1714;  /* texto e campo escuro; quase-preto quente */
--forest:     #1F3129;  /* campo profundo — seções inteiras */
--forest-lo:  #16241E;  /* rodapé e sobreposição */
--cognac:     #A4622F;  /* ação primária e acento */
--cognac-lo:  #8B5027;  /* hover do conhaque; e texto pequeno sobre papel */
--brass:      #B08A4F;  /* ornamento: fios, ícones, pontos de lista */
--brass-text: #C9A96E;  /* texto sobre verde — o --brass fica em 4.3:1 */
--muted:      #6B6257;  /* texto secundário sobre paper (AA em 16px) */
--muted-on-forest: #B9C4BC; /* texto secundário sobre forest */
--line:       #D6CEC0;  /* fio de 1px sobre paper */
--line-forest:#33473D;  /* fio de 1px sobre forest */
```

Contraste verificado: `--muted` sobre `--paper` = 5.1:1. `--muted-on-forest`
sobre `--forest-lo` = 8.9:1. Branco sobre `--cognac` = 4.81:1 (aceitável em
botão, folgado em `--cognac-lo` com 6.4:1). `--brass-text` sobre `--forest` =
6.1:1.

**Duas regras que a auditoria pegou e que voltam se esquecidas:**

1. `.text-muted` e `.label` resolvem para `--muted`, que sobre campo escuro cai
   para 2.7:1. Todo seletor de campo escuro precisa constar na lista de
   exceção em `base.css` (`.field-forest`, `.field-ink`, `.site-footer`,
   `.hero`). Criar um campo escuro novo sem adicioná-lo ali reintroduz
   exatamente o erro do site anterior: cinza claro sobre fundo escuro.
2. Texto abaixo de 16px exige 4.5:1 cheio. `--cognac` (4.19:1 em 13px) e
   `--brass` (4.31:1 sobre verde) só servem para ornamento e para peças
   grandes; em texto pequeno use `--cognac-lo` e `--brass-text`.

## Typography

- **Display:** serifada de alto contraste para títulos e nome de produto.
  Fixada pelo brief como Cormorant Garamond; mantida por ser restrição do
  usuário, com pesos 300/400/600 e `letter-spacing` negativo em tamanho grande.
- **Interface:** **Karla** (400/500/600) para corpo, rótulo, preço e controle.
  Grotesca de traço levemente irregular, que segura o contraste alto da
  serifada sem virar a dupla neutra padrão. A pilha do sistema fica só como
  fallback — deixar a interface na fonte do sistema faz a loja mudar de cara
  em cada máquina.
- **Rótulo (eyebrow):** caixa alta, `letter-spacing: .18em`, 11px, `--muted`.
  Nunca abaixo de 11px.
- **Preço:** sempre em sem-serifa com `font-variant-numeric: tabular-nums`,
  para alinhar em coluna no catálogo.

Escala display fluida via `clamp()`. Mais espaço acima de um título do que
abaixo, em toda a página.

**Entrelinha mínima de 1.24 no display.** O Cormorant tem caixa tipográfica de
~1.215em (medido: ascent 52px + descent 16px a font-size 56px). Com
`line-height` abaixo disso, o topo do circunflexo de "você" e do til de "não"
é **recortado pela caixa do elemento** — não é colisão com a linha anterior,
é corte. Como o site é em português e o acento aparece em quase todo título,
1.24 é piso do sistema. Não baixar para "fechar" um título.

## Space & Layout

Ritmo único de espaçamento em escala de 4px, exposto como `--s-1` … `--s-12`.
Container máximo 1320px com goteira de 24px (16px no celular).

Grid de produto: 4 colunas ≥1100px, 3 colunas ≥820px, 2 colunas abaixo — nunca
1 coluna, porque bolsa em retrato lado a lado permite comparação, que é o
trabalho real da visitante.

## Signature: a régua de latão

O gesto que se repete e faz as peças pertencerem ao mesmo objeto: um filete de
1px em `--brass` antes do rótulo que abre um bloco. Vive em `.label` (base.css)
e é herdado por `.filter-group h3`, `.specs h2`, `.summary h2` e
`.option-head h3` — **uma única declaração de rótulo no sistema inteiro**.
Variante `.label--rule-lg` (56px) para abertura de seção.

Regra: rótulo que abre um bloco leva régua; rótulo em colunas paralelas
(rodapé) não leva, senão o filete vira ruído repetido.

## Grão

O sistema tem matéria própria, não emprestada do placeholder. Dois campos de
ruído cruzados a ~2% de opacidade, aplicados via `::before` em `.field-forest`,
`.field-ink`, `.site-footer`, `.field-deep` e `.summary`.

Isto é deliberado e não deve ser removido: se a textura vivesse só dentro do
placeholder, o site ficaria liso no dia em que a fotografia real entrasse — uma
loja que argumenta pelo couro perderia a matéria justamente ao ganhar as fotos.

## Onde o campo verde entra

O verde não é moldura de conteúdo institucional. Ele toma o **momento de
decisão**: o `.summary` (resumo do carrinho e do checkout) é campo
verde-garrafa com filete de latão no topo, total em `--brass-text` e o botão
conhaque chapado dentro. É a única âncora escura da página e o único lugar
onde o conhaque age contra campo escuro em vez de desaparecer contra bege.

## Components

- **Cartão de produto:** sem sombra, sem borda de caixa. A imagem senta em um
  campo `--paper-deep`; texto alinhado à esquerda abaixo, não centralizado.
  Hover eleva por troca de imagem e fio inferior em `--cognac`, não por sombra.
- **Botão primário:** campo `--cognac` chapado, texto `--paper`, canto reto,
  sem gradiente. Hover escurece para `--cognac-lo`.
- **Botão fantasma:** fio de 1px `currentColor`, fundo transparente.
- **Placeholder de imagem:** enquanto não há fotografia própria, ocupa a
  proporção final exata, em `--paper-deep` com fio interno tracejado e rótulo
  "foto a substituir". Marcado, honesto, nunca uma foto de outro produto.

## Motion

Uma transição base: `180ms cubic-bezier(.2,.6,.3,1)`. Sem paralaxe, sem
revelação por scroll em conteúdo essencial — o conteúdo é visível por padrão.
Todo movimento cessa sob `prefers-reduced-motion: reduce`.

## Accessibility Floor

Foco visível com anel de 2px em `--cognac` e offset de 2px, jamais removido.
Alvo de toque mínimo 44px no celular. Navegação completa por teclado, incluindo
menu, busca e galeria de produto. Skip link. Todo controle sem rótulo textual
carrega `aria-label`.

## Asset Rules

As imagens em `assets/` são fotografia de campanha da marca Strathberry, com o
logotipo visível em várias peças. **Não são utilizáveis** neste site. Enquanto
não houver fotografia própria da acbolsa, toda imagem de produto e banner é um
placeholder marcado. Nenhuma tela apresenta produto sob nome, modelo ou
monograma de outra casa de moda.
