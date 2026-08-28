# Fotos das peças

O catálogo é **um modelo** — a Tabby Shoulder Bag — em 12 cores. Cada cor
tem seu próprio conjunto de fotos.

**Estado atual:** as 12 cores já têm pelo menos uma foto ligada (copiadas de
`Imagens bolsas/`). Este guia é para **trocar** ou **acrescentar** fotos.

Com `nFotos: 0` numa cor, o site mostra um placeholder marcado na proporção
certa — nada quebra por faltar imagem.

## Passo a passo (por cor)

1. **Salve os arquivos** em `public/fotos/produtos/`.
   Nomeie com o `slug` da cor + número de dois dígitos, começando em `01`:

   ```
   public/fotos/produtos/tabby-shoulder-vinho-01.jpg
   public/fotos/produtos/tabby-shoulder-vinho-02.jpg
   public/fotos/produtos/tabby-shoulder-vinho-03.jpg
   ```

2. **Ajuste `nFotos`** daquela cor em `lib/catalog.js` (tabela `CORES`) para
   o número de arquivos que você salvou:

   ```js
   { slug: 'tabby-shoulder-vinho', cor: 'Vinho', ..., estoque: 5, nFotos: 3 },
   ```

3. Salve. Em `npm run dev` a imagem aparece na hora; para produção, `npm run build`.

Os arquivos são `.jpg`. Para usar `.webp`, mude a extensão na função
`fotosDe()`, no topo da lista de produtos em `lib/catalog.js`.

## Onde cada foto aparece

| Foto | Onde aparece |
|---|---|
| `-01` | Cartão do produto (catálogo, home, busca) e imagem principal da página do produto |
| `-02` em diante | Miniaturas da galeria na página do produto |

A galeria com miniaturas só aparece quando a cor tem duas ou mais fotos.

## Formato recomendado

- **Extensão:** `.jpg` (ou `.webp`, ajustando `fotosDe()`)
- **Proporção:** 4:5 (retrato). O site recorta para o centro nessa proporção,
  então deixe folga nas bordas. As fotos atuais têm proporções variadas e
  algumas vão cortar mais do que o ideal — vale refazer com enquadramento 4:5.
- **Tamanho:** 1200 × 1500 px é suficiente
- **Fundo:** o mesmo cenário/luz entre as cores, para a grade ficar coesa

## As 12 cores

Os `slug` abaixo saíram de `lib/catalog.js`. Use exatamente esse texto no
nome do arquivo. "Pasta" é de qual pasta de `Imagens bolsas/` a cor veio.
Os nomes de cor foram derivados do nome da pasta — para trocar, mude o campo
`cor` em `lib/catalog.js` e aqui.

| Cor | `slug` / prefixo do arquivo | Pasta de origem | Fotos ligadas |
|---|---|---|---|
| Preto | `tabby-shoulder-preto` | black black | 1 |
| Preto e Dourado | `tabby-shoulder-preto-dourado` | Black Gold | 6 |
| Preto Fosco | `tabby-shoulder-preto-fosco` | Black Par | 6 |
| Preto Metalizado | `tabby-shoulder-preto-metal` | Blk+meta | 6 |
| Marrom | `tabby-shoulder-marrom` | Brow | 6 |
| Marrom Escuro | `tabby-shoulder-marrom-escuro` | Brow parse | 2 |
| Jacquard Azul | `tabby-shoulder-jacquard-azul` | Jacquard Blue | 1 |
| Jacquard Marrom | `tabby-shoulder-jacquard-marrom` | Jacquard brow | 1 |
| Vinho | `tabby-shoulder-vinho` | Red Wine | 1 |
| Branco | `tabby-shoulder-branco` | White | 1 |
| Branco Off | `tabby-shoulder-branco-off` | White + | 1 |
| Branco Gelo | `tabby-shoulder-branco-gelo` | White parse | 1 |

## Observações

- A pasta `Imagens bolsas/` na raiz não é usada pelo site (está no
  `.gitignore`). Só entram no site os arquivos em `public/fotos/produtos/`.
- Não nomeie arquivos com espaços nem pastas dentro de `public/fotos/produtos/`
  — só arquivos soltos `<slug>-NN.jpg`.
