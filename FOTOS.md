# Fotos das peças

O catálogo é **um modelo** — a Tabby Shoulder Bag — em 12 cores. Cada cor
tem seu próprio conjunto de fotos.

Enquanto uma cor não tem foto, o site mostra um placeholder marcado ("Foto a
substituir") na proporção certa — nada quebra por faltar imagem.

## Passo a passo (por cor)

1. **Salve os arquivos** em `public/fotos/produtos/`.
   Nomeie com o `slug` da cor + número de dois dígitos:

   ```
   public/fotos/produtos/tabby-shoulder-vinho-01.webp
   public/fotos/produtos/tabby-shoulder-vinho-02.webp
   public/fotos/produtos/tabby-shoulder-vinho-03.webp
   ```

2. **Preencha o campo `fotos`** daquela cor em `lib/catalog.js` (tabela `CORES`).
   Troque `fotos: []` por:

   ```js
   fotos: [
     '/fotos/produtos/tabby-shoulder-vinho-01.webp',
     '/fotos/produtos/tabby-shoulder-vinho-02.webp',
   ],
   ```

3. Salve. Em `npm run dev` a imagem aparece na hora; para produção, `npm run build`.

## Onde cada foto aparece

| Posição em `fotos` | Onde aparece |
|---|---|
| 1ª foto  | Cartão do produto (catálogo, home, busca) e imagem principal da página do produto |
| 2ª em diante | Miniaturas da galeria na página do produto |

A galeria com miniaturas só aparece quando a cor tem duas ou mais fotos.

## Formato recomendado

- **Extensão:** `.webp` (menor) ou `.jpg`
- **Proporção:** 4:5 (retrato). O site recorta para o centro nessa proporção,
  então deixe folga nas bordas.
- **Tamanho:** 1200 × 1500 px é suficiente
- **Fundo:** o mesmo cenário/luz entre as cores, para a grade ficar coesa

## As 12 cores

Os `slug` abaixo saíram de `lib/catalog.js`. Use exatamente esse texto no
nome do arquivo. A coluna "pasta" é de qual pasta de `Imagens bolsas/` a cor
veio. Os nomes de cor foram derivados do nome da pasta — se quiser trocar
algum, muda em `lib/catalog.js` (campo `cor`) e aqui.

| Nome de cor | `slug` / prefixo do arquivo | Pasta de origem |
|---|---|---|
| Preto | `tabby-shoulder-preto` | black black |
| Preto e Dourado | `tabby-shoulder-preto-dourado` | Black Gold |
| Preto Fosco | `tabby-shoulder-preto-fosco` | Black Par |
| Preto Metalizado | `tabby-shoulder-preto-metal` | Blk+meta |
| Marrom | `tabby-shoulder-marrom` | Brow |
| Marrom Escuro | `tabby-shoulder-marrom-escuro` | Brow parse |
| Jacquard Azul | `tabby-shoulder-jacquard-azul` | Jacquard Blue |
| Jacquard Marrom | `tabby-shoulder-jacquard-marrom` | Jacquard brow |
| Vinho | `tabby-shoulder-vinho` | Red Wine |
| Branco | `tabby-shoulder-branco` | White |
| Branco Off | `tabby-shoulder-branco-off` | White + |
| Branco Gelo | `tabby-shoulder-branco-gelo` | White parse |

## Observações

- A pasta `Imagens bolsas/` na raiz não é usada pelo site — é material solto.
  Só entram no site os arquivos copiados para `public/fotos/produtos/`.
- Não aponte `fotos` para `public/assets/`: o teste `npm run test:paridade`
  reprova caminhos assim.
