/* =========================================================================
   acbolsa — catálogo
   =========================================================================

   ESTE É O ARQUIVO QUE VOCÊ EDITA para mexer nas cores, preços e fotos.
   Nada mais no site precisa ser tocado.

   O catálogo é UM modelo — a Tabby Shoulder Bag — em várias cores. Cada
   linha da tabela CORES (abaixo) é uma variação, e todas aparecem como
   opção de cor uma da outra na página do produto.

   ---- Para editar uma cor ------------------------------------------------

   Na tabela CORES, cada linha tem:
     slug     endereço da peça (/produto/<slug>) e prefixo do arquivo de foto
     cor      nome que aparece pro cliente (derivado do nome da pasta)
     hex      cor aproximada da bolinha no cartão e no filtro
     material texto da ficha técnica desta cor
     estoque  unidades disponíveis; 0 = esgotado
     fotos    sufixos dos arquivos dessa cor em public/fotos/produtos/
              (ver "Fotos" abaixo); lista vazia = placeholder
     // pasta  comentário ao lado: de qual pasta de "Imagens bolsas/" a cor
              veio. É só nota de origem — o site não usa.

   ---- Para adicionar uma cor nova --------------------------------------------

   Acrescente uma linha em CORES no mesmo formato. Seletor de cor, home e
   filtros se atualizam sozinhos.

   ---- Preço e ficha comuns ---------------------------------------------------

   PRECO, PRECO_DE e FICHA valem para TODAS as cores. Mude num lugar só.

   ---- Fotos ----------------------------------------------------------------

   Com `fotos: []` o site desenha um placeholder marcado na proporção certa
   — nunca a foto de outra peça no lugar.

   Para publicar as fotos de uma cor:

   1. Salve os arquivos em `public/fotos/produtos/`, com o `slug` da cor e um
      número de dois dígitos, começando em 01:
        public/fotos/produtos/tabby-shoulder-vinho-01.jpg
        public/fotos/produtos/tabby-shoulder-vinho-02.jpg
   2. Liste os sufixos no campo `fotos` daquela linha de CORES, na ordem que
      devem aparecer:  fotos: ['01.jpg', '02.jpg', '03.jpg']
      (o atalho `jpgs(3)` faz o mesmo; use `[...jpgs(3), '04.gif']` quando
      houver um .gif no fim.)

   A 1ª foto é a da vitrine (cartão e imagem principal da página); as demais
   viram miniaturas na galeria. Proporção 4:5, o site recorta para o centro.
   Tamanho bom: 1200 × 1500 px. .jpg e .gif funcionam; para .webp basta
   listar o sufixo com a extensão certa. A lista por cor está em FOTOS.md.

   ---- Nomenclatura -------------------------------------------------------

   Decisão do usuário (25/08/2026): o catálogo vende a Tabby Shoulder Bag
   (modelo da Coach) com o nome de modelo real. Isso substitui a regra
   anterior de nome próprio obrigatório — vale só para esta decisão, não é
   licença para copiar nome de outra marca em produto futuro sem confirmar
   de novo.

   ========================================================================= */

export const CATEGORIAS = {
  'ombro': { nome: 'Bolsas de ombro', pai: 'bolsas' },
};

/* Ordem em que as categorias aparecem nos filtros. */
export const ORDEM_CATEGORIAS = ['ombro'];

/* -------------------------------------------------------------------------
   Tabby Shoulder Bag — um modelo, várias cores.

   [CONFERIR ANTES DE PUBLICAR] preço, estoque, medidas e material abaixo são
   de exemplo / da ficha pública do modelo. Os nomes de cor foram derivados
   do nome de cada pasta de origem (anotada no comentário de cada linha).
   ------------------------------------------------------------------------- */

const PRECO = 890.00;   // [CONFERIR] mesmo preço para todas as cores
const PRECO_DE = null;  // preço "de" riscado (oferta); null = sem oferta

const FICHA = {         // [CONFERIR] comum a todas as cores
  medidas: '19 × 12 × 6 cm (aprox.)',
  alca: 'Alça de corrente com apoio em couro, mais alcinha curta de mão',
  detalhes: [
    'Fecho giratório de metal na aba frontal',
    'Compartimento único com bolso interno com zíper',
    'Ferragem em metal polido',
    'Alça de corrente removível',
  ],
  cuidados:
    'Hidratar o couro periodicamente com creme incolor. Evitar contato com superfícies ásperas.',
};

/* Monta os caminhos das fotos de uma cor. `arquivos` são os sufixos dos
   arquivos em public/fotos/produtos/ (ex. '01.jpg', '09.gif'); o nome
   completo é <slug>-<sufixo>. A 1ª é a da vitrine. */
function fotosDe(slug, arquivos) {
  return arquivos.map((a) => '/fotos/produtos/' + slug + '-' + a);
}

/* Sufixos '01.jpg' .. 'NN.jpg' — atalho para as cores só com .jpg em
   sequência (ex.: `fotos: jpgs(3)`). Onde houver um .gif/.webp no fim, ele
   entra à parte: `fotos: [...jpgs(2), '03.gif']`. */
const jpgs = (n) =>
  Array.from({ length: n }, (_, i) => String(i + 1).padStart(2, '0') + '.jpg');

/* Faixa de sufixos .jpg de `a` a `b` (ex.: nums(10, 14) → 10.jpg … 14.jpg).
   Útil quando a cor tem um .gif/.webp no meio da sequência. */
const nums = (a, b) =>
  Array.from({ length: b - a + 1 }, (_, i) => String(a + i).padStart(2, '0') + '.jpg');

/* Uma linha por cor. `fotos` = sufixos dos arquivos em
   public/fotos/produtos/ dessa cor, na ordem em que aparecem. A 1ª é a da
   vitrine; da 2ª em diante viram miniaturas na galeria.

   Sem foto (`fotos: []`), a cor mostra um placeholder marcado na proporção
   certa — nunca a foto de outra peça. */
const CORES = [
  { slug: 'tabby-shoulder-preto',           cor: 'Preto',            hex: '#1A1714', material: 'Couro liso',                     estoque: 5, fotos: ['01.gif', '02.png', '03.png', '04.png'] },
  { slug: 'tabby-shoulder-preto-dourado',   cor: 'Preto e Dourado',  hex: '#1A1714', material: 'Couro liso, ferragem dourada',   estoque: 5, fotos: [...jpgs(8), '09.gif', ...nums(10, 14)] },
  { slug: 'tabby-shoulder-preto-fosco',     cor: 'Preto Fosco',      hex: '#17140F', material: 'Couro liso de toque fosco',     estoque: 4, fotos: jpgs(11) },
  { slug: 'tabby-shoulder-preto-metal',     cor: 'Preto Metalizado', hex: '#2A2622', material: 'Couro liso com brilho metálico', estoque: 4, fotos: jpgs(9) },
  { slug: 'tabby-shoulder-marrom',          cor: 'Marrom',           hex: '#5B4033', material: 'Couro liso',                     estoque: 6, fotos: [...jpgs(8), '09.gif', ...nums(10, 14)] },
  { slug: 'tabby-shoulder-marrom-escuro',   cor: 'Marrom Escuro',    hex: '#3D2B20', material: 'Couro liso',                     estoque: 5, fotos: jpgs(6) },
  { slug: 'tabby-shoulder-jacquard-azul',   cor: 'Jacquard Azul',    hex: '#33415C', material: 'Jacquard com detalhes em couro', estoque: 4, fotos: ['01.jpg', '02.png', '03.png', '04.png'] },
  { slug: 'tabby-shoulder-jacquard-marrom', cor: 'Jacquard Marrom',  hex: '#6B5138', material: 'Jacquard com detalhes em couro', estoque: 4, fotos: jpgs(1) },
  { slug: 'tabby-shoulder-vinho',           cor: 'Vinho',            hex: '#5E2130', material: 'Couro liso',                     estoque: 5, fotos: jpgs(14) },
  { slug: 'tabby-shoulder-branco',          cor: 'Branco',           hex: '#EDE7DD', material: 'Couro liso',                     estoque: 5, fotos: ['01.webp', ...nums(2, 10), '11.gif', ...nums(12, 17)] },
  { slug: 'tabby-shoulder-branco-off',      cor: 'Branco Off',       hex: '#E8E0D2', material: 'Couro liso',                     estoque: 3, fotos: jpgs(6) },
  { slug: 'tabby-shoulder-branco-gelo',     cor: 'Branco Gelo',      hex: '#F0ECE3', material: 'Couro liso',                     estoque: 3, fotos: jpgs(4) },
];

export const PRODUTOS = CORES.map((c, i) => ({
  id: c.slug,
  nome: 'Tabby Shoulder Bag',
  cat: 'ombro',
  preco: PRECO,
  ...(PRECO_DE ? { precoDe: PRECO_DE } : {}),
  cor: c.cor,
  hex: c.hex,
  material: c.material,
  medidas: FICHA.medidas,
  alca: FICHA.alca,
  detalhes: FICHA.detalhes,
  cuidados: FICHA.cuidados,
  descricao:
    'A Tabby Shoulder Bag na cor ' +
    c.cor.toLowerCase() +
    '. Bolsa de ombro estruturada, com aba frontal e fecho giratório — cabe o essencial do dia sem ganhar volume.',
  estoque: c.estoque,
  novo: i < 4,
  destaque: i < 6,
  vendas: 0,
  linha: 'tabby-shoulder',
  fotos: fotosDe(c.slug, c.fotos),
}));

/* -------------------------------------------------------------------------
   Helpers de consulta. Não precisa mexer daqui para baixo.
   ------------------------------------------------------------------------- */

export function todos() {
  return PRODUTOS.slice();
}

export function porId(id) {
  return PRODUTOS.find((p) => p.id === id) || null;
}

export function porCategoria(cat) {
  if (!cat || cat === 'todos') return todos();
  if (cat === 'bolsas') {
    return PRODUTOS.filter((p) => CATEGORIAS[p.cat] && CATEGORIAS[p.cat].pai === 'bolsas');
  }
  return PRODUTOS.filter((p) => p.cat === cat);
}

export function porCor(cor) {
  if (!cor) return todos();
  return PRODUTOS.filter((p) => p.cor === cor);
}

/* Cores derivadas do catálogo, sem lista fixa: cor nova em produto novo
   aparece na lista sozinha. */
export function cores() {
  const r = [];
  PRODUTOS.forEach((p) => {
    if (p.cor && !r.some((c) => c.nome === p.cor)) r.push({ nome: p.cor, hex: p.hex });
  });
  return r.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function novidades(limite) {
  const r = PRODUTOS.filter((p) => p.novo);
  return limite ? r.slice(0, limite) : r;
}

export function destaques(limite) {
  const r = PRODUTOS.filter((p) => p.destaque);
  return limite ? r.slice(0, limite) : r;
}

export function maisVendidos(limite) {
  const r = PRODUTOS.slice().sort((a, b) => (b.vendas || 0) - (a.vendas || 0));
  return limite ? r.slice(0, limite) : r;
}

/* A MESMA peça em outras cores — só produtos que compartilham `linha`.
   Nunca "outros produtos da mesma categoria": isso apresentaria bolsas
   diferentes como se fossem variação de cor. */
export function variantesDeCor(produto) {
  if (!produto || !produto.linha) return [];
  return PRODUTOS.filter((p) => p.linha === produto.linha && p.id !== produto.id);
}

export function relacionados(produto, limite = 4) {
  if (!produto) return [];
  const mesmaCat = PRODUTOS.filter((p) => p.cat === produto.cat && p.id !== produto.id);
  const resto = PRODUTOS.filter((p) => p.cat !== produto.cat && p.id !== produto.id);
  return mesmaCat.concat(resto).slice(0, limite);
}

export function buscar(termo) {
  const q = String(termo || '').trim().toLowerCase();
  if (!q) return [];
  return PRODUTOS.filter((p) => {
    const alvo = [
      p.nome,
      p.cor,
      p.material,
      nomeCategoria(p.cat),
      p.descricao,
    ].join(' ').toLowerCase();
    return alvo.includes(q);
  });
}

export function faixaDePreco() {
  const precos = PRODUTOS.map((p) => p.preco);
  return { min: Math.min(...precos), max: Math.max(...precos) };
}

export function nomeCategoria(chave) {
  return (CATEGORIAS[chave] && CATEGORIAS[chave].nome) || 'Bolsas';
}

/* Preço em Real, no formato brasileiro. */
export function formatarPreco(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}
