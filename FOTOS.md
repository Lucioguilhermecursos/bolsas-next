# Fotos das peças

O catálogo é **um modelo** — a Tabby Shoulder Bag — em 12 cores. Cada cor
tem seu próprio conjunto de fotos.

**Estado atual:** as 12 cores têm foto ligada (73 arquivos em
`public/fotos/produtos/`). Este guia é para **trocar** ou **acrescentar**.
Com `fotos: []` numa cor, o site volta ao placeholder — nada quebra.

## Passo a passo (por cor)

1. **Salve os arquivos** em `public/fotos/produtos/`.
   Nomeie com o `slug` da cor + número de dois dígitos, começando em `01`:

   ```
   public/fotos/produtos/tabby-shoulder-vinho-01.jpg
   public/fotos/produtos/tabby-shoulder-vinho-02.jpg
   public/fotos/produtos/tabby-shoulder-vinho-03.jpg
   ```

2. **Liste os sufixos** no campo `fotos` daquela cor em `lib/catalog.js`
   (tabela `CORES`), na ordem em que devem aparecer:

   ```js
   { slug: 'tabby-shoulder-vinho', cor: 'Vinho', ..., estoque: 5, fotos: ['01.jpg', '02.jpg', '03.jpg'] },
   ```

   `jpgs(3)` é atalho para `['01.jpg','02.jpg','03.jpg']`. Com um `.gif` no
   fim: `[...jpgs(3), '04.gif']`.

3. Salve. Em `npm run dev` a imagem aparece na hora; para produção, `npm run build`.

Funcionam `.jpg` e `.gif`. Para `.webp`, é só listar o sufixo com a
extensão certa (ex. `'01.webp'`).

## Onde cada foto aparece

| Foto | Onde aparece |
|---|---|
| `-01` | Cartão do produto (catálogo, home, busca) e imagem principal da página do produto |
| `-02` em diante | Miniaturas da galeria na página do produto |

A galeria com miniaturas só aparece quando a cor tem duas ou mais fotos.

## Formato recomendado

- **Extensão:** `.jpg` (ou `.webp` / `.gif` — basta listar o sufixo certo)
- **Proporção:** 4:5 (retrato). O site recorta para o centro nessa proporção,
  então deixe folga nas bordas. As fotos atuais têm proporções variadas e
  algumas vão cortar mais do que o ideal — vale refazer com enquadramento 4:5.
- **Tamanho:** 1200 × 1500 px é suficiente
- **Fundo:** o mesmo cenário/luz entre as cores, para a grade ficar coesa

## As 12 cores

Os `slug` abaixo saíram de `lib/catalog.js`. Use exatamente esse texto no
nome do arquivo (`<slug>-01.jpg`, `<slug>-02.jpg`…).

| Cor | `slug` / prefixo do arquivo | Fotos |
|---|---|---|
| Preto | `tabby-shoulder-preto` | 4 (gif + 3 png) |
| Preto e Dourado | `tabby-shoulder-preto-dourado` | 14 (13 jpg + 1 gif) |
| Preto Fosco | `tabby-shoulder-preto-fosco` | 11 |
| Preto Metalizado | `tabby-shoulder-preto-metal` | 14 |
| Marrom | `tabby-shoulder-marrom` | 9 (8 jpg + 1 gif) |
| Marrom Escuro | `tabby-shoulder-marrom-escuro` | 11 |
| Jacquard Azul | `tabby-shoulder-jacquard-azul` | 1 |
| Jacquard Marrom | `tabby-shoulder-jacquard-marrom` | 1 |
| Vinho | `tabby-shoulder-vinho` | 9 |
| Branco | `tabby-shoulder-branco` | 17 (webp + 15 jpg + gif) |
| Branco Off | `tabby-shoulder-branco-off` | 11 |
| Branco Gelo | `tabby-shoulder-branco-gelo` | 9 |

## Observações

- Só entram no site os arquivos em `public/fotos/produtos/`.
- Não nomeie arquivos com espaços nem crie pastas dentro de
  `public/fotos/produtos/` — só arquivos soltos `<slug>-NN.jpg`.
