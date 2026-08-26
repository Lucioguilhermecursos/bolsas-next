/* =========================================================================
   acbolsa — catálogo
   =========================================================================

   ESTE É O ARQUIVO QUE VOCÊ EDITA para mexer em produtos, preços e fotos.
   Nada mais no site precisa ser tocado para trocar o catálogo.

   ---- Como adicionar um produto -------------------------------------------

   {
     id:     'slug-unico',        // vira o endereço: /produto/slug-unico
     nome:   'Bolsa Tote Raffia', // nome próprio acbolsa (ver regra abaixo)
     cat:    'tote',              // uma chave de CATEGORIAS (abaixo)
     preco:  285.00,              // em reais, ponto como separador decimal
     precoDe: 340.00,             // opcional: preço "de", risca e mostra oferta
     cor:    'Natural',           // nome da cor desta peça
     hex:    '#C9B48D',           // cor aproximada, para a bolinha no cartão
     material: 'Raffia e couro',
     medidas:  '30 × 28 × 12 cm',
     alca:     'Alça de ombro regulável, queda de 24 cm',
     detalhes: ['Forro em algodão', 'Fecho magnético'],
     cuidados: 'Guardar na sapatilha de tecido...',
     estoque:  8,                 // 0 = esgotado
     novo:     true,              // exibe o selo NOVO
     destaque: true,              // aparece em "Peças em destaque" na home
     vendas:   140,               // usado para ordenar "Mais vendidos"
     linha:    'tote-raffia',     // ver "Cores da mesma peça" abaixo
     fotos:    [],                // ver abaixo
   }

   ---- Cores da mesma peça ---------------------------------------------------

   O campo `linha` agrupa a MESMA bolsa em cores diferentes. Produtos que
   compartilham o mesmo valor de `linha` aparecem como opções de cor um do
   outro na página de produto.

   Use o mesmo `linha` apenas quando for de fato o mesmo modelo — mesmas
   medidas, mesma construção, só o couro muda. Peças diferentes da mesma
   categoria NÃO devem compartilhar `linha`: seria dizer à cliente que ela
   está trocando a cor quando na verdade está trocando de bolsa.

   Sem `linha`, o produto simplesmente não mostra seletor de cor.

   ---- Fotos ----------------------------------------------------------------

   Enquanto `fotos` estiver vazio, o site desenha um placeholder marcado no
   lugar, na proporção certa. Isso é intencional: as imagens que vieram na
   pasta assets/ da versão anterior são fotografia da marca Strathberry (o
   logotipo aparece gravado no couro em várias) e não podem ser usadas aqui.

   Quando tiver as fotos das peças reais, coloque os arquivos em `public/` e
   liste os caminhos a partir da raiz do site:

     fotos: ['/fotos/tote-raffia-01.webp', '/fotos/tote-raffia-02.webp'],

   A primeira foto é a da vitrine; a segunda aparece no hover do cartão.
   Proporção recomendada: 4:5 (ex. 1200 × 1500 px).

   ---- Nomenclatura -----------------------------------------------------

   Decisão do usuário (2026-08-25): o catálogo passou a vender a Tabby
   Shoulder Bag da Coach nas cores disponíveis, usando fotos e nome de
   modelo reais da Coach. Isso substitui a regra anterior de nome próprio
   obrigatório — vale só para esta decisão específica, não é licença geral
   para copiar nome de qualquer marca em produto futuro sem confirmar de novo.

   ========================================================================= */

export const CATEGORIAS = {
  'tote':  { nome: 'Bolsas tote',     pai: 'bolsas' },
  'ombro': { nome: 'Bolsas de ombro', pai: 'bolsas' },
};

/* Ordem em que as categorias aparecem nos filtros. */
export const ORDEM_CATEGORIAS = ['tote', 'ombro'];

/* -------------------------------------------------------------------------
   Catálogo: Tabby Shoulder Bag (Coach), nas cores disponíveis em foto.

   Os PREÇOS e o ESTOQUE abaixo são exemplo e precisam ser conferidos e
   substituídos pelos valores reais antes de publicar. Medidas e material
   seguem a ficha técnica pública do modelo; confirmar antes de publicar.
   ------------------------------------------------------------------------- */

export const PRODUTOS = [
  {
    id: 'tabby-shoulder-preta',
    nome: 'Tabby Shoulder Bag',
    cat: 'ombro',
    preco: 890.00,
    precoDe: 990.00,
    cor: 'Preto',
    hex: '#1A1714',
    material: 'Couro liso',
    medidas: '19 × 12 × 6 cm (aprox.)',
    alca: 'Alça de corrente com apoio em couro, mais alcinha curta de mão',
    detalhes: [
      'Fecho giratório de metal na aba frontal',
      'Compartimento único com bolso interno com zíper',
      'Ferragem em metal polido',
      'Alça de corrente removível',
    ],
    cuidados: 'Hidratar o couro periodicamente com creme incolor. Evitar contato com superfícies ásperas.',
    descricao: 'Bolsa de ombro estruturada, com aba frontal e fecho giratório. Cabe o essencial do dia a dia sem ganhar volume.',
    estoque: 6,
    novo: true,
    destaque: true,
    vendas: 0,
    linha: 'tabby-shoulder',
    fotos: [
      '/fotos/produtos/bolsa-ombro-flap-preta-01.webp',
      '/fotos/produtos/bolsa-ombro-flap-preta-02.webp',
      '/fotos/produtos/bolsa-ombro-flap-preta-03.webp',
      '/fotos/produtos/bolsa-ombro-flap-preta-04.webp',
      '/fotos/produtos/bolsa-ombro-flap-preta-05.webp',
      '/fotos/produtos/bolsa-ombro-flap-preta-06.webp',
      '/fotos/produtos/bolsa-ombro-flap-preta-07.webp',
      '/fotos/produtos/bolsa-ombro-flap-preta-08.webp',
      '/fotos/produtos/bolsa-ombro-flap-preta-09.webp',
    ],
  },
  {
    id: 'tabby-shoulder-branca',
    nome: 'Tabby Shoulder Bag',
    cat: 'ombro',
    preco: 890.00,
    cor: 'Branco',
    hex: '#EDE7DD',
    material: 'Couro liso',
    medidas: '19 × 12 × 6 cm (aprox.)',
    alca: 'Alça de corrente com apoio em couro, mais alcinha curta de mão',
    detalhes: [
      'Fecho giratório de metal na aba frontal',
      'Compartimento único com bolso interno com zíper',
      'Ferragem em metal polido',
      'Alça de corrente removível',
    ],
    cuidados: 'Couro claro marca com mais facilidade: evitar contato com tecidos que soltam tinta (jeans escuro, por exemplo).',
    descricao: 'A mesma Tabby Shoulder Bag no branco — realça a ferragem e o relevo do fecho giratório.',
    estoque: 4,
    novo: true,
    vendas: 0,
    linha: 'tabby-shoulder',
    fotos: [
      '/fotos/produtos/bolsa-ombro-flap-branca-01.jpg',
      '/fotos/produtos/bolsa-ombro-flap-branca-03.jpg',
      '/fotos/produtos/bolsa-ombro-flap-branca-04.jpg',
      '/fotos/produtos/bolsa-ombro-flap-branca-05.jpg',
    ],
  },
  {
    id: 'tabby-shoulder-taupe',
    nome: 'Tabby Shoulder Bag',
    cat: 'ombro',
    preco: 890.00,
    cor: 'Taupe',
    hex: '#8B7D6B',
    material: 'Couro liso',
    medidas: '19 × 12 × 6 cm (aprox.)',
    alca: 'Alça de corrente com apoio em couro, mais alcinha curta de mão',
    detalhes: [
      'Fecho giratório de metal na aba frontal',
      'Compartimento único com bolso interno com zíper',
      'Ferragem em metal polido',
      'Alça de corrente removível',
    ],
    cuidados: 'Hidratar o couro periodicamente com creme incolor. Evitar contato com superfícies ásperas.',
    descricao: 'A mesma Tabby Shoulder Bag em taupe — tom neutro que combina com a maioria dos looks.',
    estoque: 3,
    vendas: 0,
    linha: 'tabby-shoulder',
    fotos: [
      '/fotos/produtos/bolsa-ombro-flap-taupe-01.jpg',
    ],
  },
];

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
