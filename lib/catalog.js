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

   Produtos usam nome próprio da acbolsa, descrevendo material e formato.
   As fotos usadas no catálogo podem vir de peças de outras casas de moda
   (decisão do usuário, 2026-08-25) — o texto do produto continua descrevendo
   a peça pelo material e formato, sem usar nome de outra marca no nome do
   produto.

   ========================================================================= */

export const CATEGORIAS = {
  'tote':  { nome: 'Bolsas tote',     pai: 'bolsas' },
  'ombro': { nome: 'Bolsas de ombro', pai: 'bolsas' },
};

/* Ordem em que as categorias aparecem nos filtros. */
export const ORDEM_CATEGORIAS = ['tote', 'ombro'];

/* -------------------------------------------------------------------------
   Catálogo de demonstração.

   Estes produtos são material de trabalho para o site ficar em pé e ser
   avaliado com conteúdo real de verdade — nomes, medidas e descrições
   escritos como os definitivos seriam. Os PREÇOS são de exemplo e precisam
   ser conferidos um a um antes de publicar.
   ------------------------------------------------------------------------- */

export const PRODUTOS = [
  {
    id: 'tote-raffia-natural',
    nome: 'Bolsa Tote Raffia',
    cat: 'tote',
    preco: 285.00,
    cor: 'Natural',
    hex: '#C9B48D',
    material: 'Raffia trançada à mão com vivos em couro de vitelo',
    medidas: '32 × 29 × 13 cm',
    alca: 'Alça de ombro regulável, queda de 24 a 30 cm',
    detalhes: [
      'Trançado feito à mão, com variação natural entre as peças',
      'Base e vivos em couro de vitelo curtido',
      'Forro em algodão com bolso interno com zíper',
      'Ferragem em latão escovado',
    ],
    cuidados: 'Guardar na sapatilha de tecido, longe de luz direta. Limpar a raffia com pano seco; o couro aceita creme neutro.',
    descricao: 'A trama de raffia leva cerca de um dia de trabalho por peça, o que faz nenhuma sair idêntica à outra. O couro entra onde a bolsa sofre — base, vivos e alça — para a estrutura não ceder com o uso.',
    estoque: 8,
    novo: true,
    destaque: true,
    vendas: 142,
    fotos: [],
  },
  {
    id: 'hobo-couro-castanho',
    nome: 'Bolsa Hobo em Couro Granulado',
    cat: 'ombro',
    preco: 419.00,
    precoDe: 489.00,
    cor: 'Castanho',
    hex: '#5B4033',
    material: 'Couro bovino granulado',
    medidas: '38 × 30 × 14 cm',
    alca: 'Alça de ombro regulável, queda de 26 cm',
    detalhes: [
      'Couro granulado que disfarça marcas de uso',
      'Fecho em barra de latão com corrente',
      'Cabe caderno A5 e garrafa pequena',
      'Forro em sarja com dois bolsos chapados',
    ],
    cuidados: 'Hidratar o couro a cada seis meses com creme incolor. Evitar chuva prolongada.',
    descricao: 'Formato hobo de corpo mole, que acomoda o volume do dia sem perder a linha. O granulado do couro é o que faz essa bolsa envelhecer bem: risco de unha e canto de mesa somem na textura.',
    estoque: 5,
    destaque: true,
    vendas: 208,
    linha: 'hobo-granulado',
    fotos: ['/fotos/produtos/bolsa-ombro-flap-taupe-01.jpg'],
  },
  {
    id: 'hobo-couro-preto',
    nome: 'Bolsa Hobo em Couro Granulado',
    cat: 'ombro',
    preco: 419.00,
    precoDe: 489.00,
    cor: 'Preto',
    hex: '#1A1714',
    material: 'Couro bovino granulado',
    medidas: '38 × 30 × 14 cm',
    alca: 'Alça de ombro regulável, queda de 26 cm',
    detalhes: [
      'Couro granulado que disfarça marcas de uso',
      'Fecho em barra de latão com corrente',
      'Cabe caderno A5 e garrafa pequena',
      'Forro em sarja com dois bolsos chapados',
    ],
    cuidados: 'Hidratar o couro a cada seis meses com creme incolor. Evitar chuva prolongada.',
    descricao: 'Formato hobo de corpo mole, que acomoda o volume do dia sem perder a linha. No preto, o granulado esconde ainda melhor as marcas de uso diário.',
    estoque: 7,
    vendas: 195,
    linha: 'hobo-granulado',
    fotos: [
      '/fotos/produtos/bolsa-ombro-flap-preta-01.webp',
      '/fotos/produtos/bolsa-ombro-flap-preta-07.webp',
    ],
  },
  {
    id: 'tote-couro-conhaque',
    nome: 'Bolsa Tote em Couro Liso',
    cat: 'tote',
    preco: 452.00,
    cor: 'Conhaque',
    hex: '#A4622F',
    material: 'Couro bovino liso de curtimento vegetal',
    medidas: '36 × 31 × 15 cm',
    alca: 'Duas alças de mão, queda de 22 cm',
    detalhes: [
      'Curtimento vegetal: escurece devagar com o uso',
      'Cabe notebook de 14 polegadas',
      'Costura em ponto selaria nas laterais',
      'Bolso interno com zíper e porta-chaves',
    ],
    cuidados: 'O couro de curtimento vegetal muda de tom com luz e uso — é característica, não defeito.',
    descricao: 'A bolsa de trabalho da linha. Couro de curtimento vegetal, que começa claro e vai fechando o tom conforme você usa, até virar uma peça que só é sua.',
    estoque: 6,
    destaque: true,
    vendas: 231,
    linha: 'tote-couro-liso',
    fotos: [],
  },
  {
    id: 'tote-couro-preto',
    nome: 'Bolsa Tote em Couro Liso',
    cat: 'tote',
    preco: 452.00,
    cor: 'Preto',
    hex: '#1A1714',
    material: 'Couro bovino liso de curtimento vegetal',
    medidas: '36 × 31 × 15 cm',
    alca: 'Duas alças de mão, queda de 22 cm',
    detalhes: [
      'Curtimento vegetal: escurece devagar com o uso',
      'Cabe notebook de 14 polegadas',
      'Costura em ponto selaria nas laterais',
      'Bolso interno com zíper e porta-chaves',
    ],
    cuidados: 'O couro de curtimento vegetal muda de tom com luz e uso — é característica, não defeito.',
    descricao: 'A bolsa de trabalho da linha, no preto. Couro de curtimento vegetal, que fecha ainda mais o tom com o uso, até um preto profundo que a peça nova não tem.',
    estoque: 4,
    vendas: 187,
    linha: 'tote-couro-liso',
    fotos: [],
  },
  {
    id: 'bucket-matelasse-preto',
    nome: 'Bolsa Bucket em Couro Matelassê',
    cat: 'ombro',
    preco: 389.00,
    cor: 'Preto',
    hex: '#1A1714',
    material: 'Couro de cordeiro em matelassê',
    medidas: '24 × 26 × 14 cm',
    alca: 'Alça de corrente com apoio em couro, queda de 22 cm',
    detalhes: [
      'Matelassê costurado ponto a ponto',
      'Fechamento por cordão e aba',
      'Corrente com apoio em couro no ombro',
      'Forro em microfibra',
    ],
    cuidados: 'O couro de cordeiro é macio e marca com facilidade: evitar contato com superfícies ásperas.',
    descricao: 'O matelassê é costurado ponto a ponto, não prensado — por isso o relevo continua firme depois de meses. O apoio de couro na corrente resolve o ponto que costuma incomodar no ombro.',
    estoque: 4,
    vendas: 167,
    fotos: ['/fotos/produtos/bolsa-bucket-preta-01.jpg'],
  },
  {
    id: 'tote-compacta-taupe',
    nome: 'Tote Compacta',
    cat: 'tote',
    preco: 264.00,
    cor: 'Taupe',
    hex: '#8B7D6B',
    material: 'Couro bovino granulado',
    medidas: '28 × 24 × 12 cm',
    alca: 'Duas alças de mão, queda de 18 cm',
    detalhes: [
      'Versão reduzida da tote clássica',
      'Fecho de ímã na boca',
      'Necessaire interna solta, presa por mosquetão',
    ],
    cuidados: 'Hidratar a cada seis meses.',
    descricao: 'Para quem gosta da tote mas não carrega notebook. Vem com uma necessaire solta presa por mosquetão, que sai junto quando você troca de bolsa.',
    estoque: 9,
    destaque: true,
    vendas: 154,
    fotos: [],
  },
  {
    id: 'bolsa-ombro-meia-lua',
    nome: 'Bolsa Meia-lua em Couro',
    cat: 'ombro',
    preco: 274.00,
    cor: 'Caramelo',
    hex: '#B5763C',
    material: 'Couro bovino liso',
    medidas: '30 × 16 × 8 cm',
    alca: 'Alça de ombro fixa, queda de 20 cm',
    detalhes: [
      'Corte em meia-lua que acompanha o corpo',
      'Zíper superior de ponta a ponta',
      'Forro em sarja de algodão',
    ],
    cuidados: 'Hidratar a cada seis meses com creme incolor.',
    descricao: 'A curva do corte acompanha a lateral do corpo em vez de brigar com ela. Detalhe pequeno que muda como a bolsa fica quando você está andando.',
    estoque: 10,
    vendas: 131,
    fotos: [],
  },
  {
    id: 'bucket-cordao-caramelo',
    nome: 'Bolsa Bucket com Cordão',
    cat: 'ombro',
    preco: 246.00,
    cor: 'Caramelo',
    hex: '#B5763C',
    material: 'Couro bovino granulado',
    medidas: '23 × 25 × 15 cm',
    alca: 'Alça de ombro regulável, queda de 22 a 28 cm',
    detalhes: [
      'Fechamento por cordão passante',
      'Necessaire interna presa por cordão',
      'Base reforçada',
    ],
    cuidados: 'Guardar em pé, com enchimento, para o corpo não achatar.',
    descricao: 'Bucket de corpo redondo com necessaire por dentro presa no cordão — o que evita o fundo virar poço sem fundo.',
    estoque: 8,
    vendas: 118,
    fotos: [],
  },
  {
    id: 'tote-vertical-preta',
    nome: 'Tote Vertical em Couro',
    cat: 'tote',
    preco: 398.00,
    cor: 'Preto',
    hex: '#1A1714',
    material: 'Couro bovino liso',
    medidas: '27 × 34 × 12 cm',
    alca: 'Duas alças de mão, queda de 20 cm',
    detalhes: [
      'Formato vertical, ocupa menos espaço no transporte lotado',
      'Boca com fecho de ímã',
      'Bolso interno com zíper',
    ],
    cuidados: 'Hidratar a cada seis meses.',
    descricao: 'Alta em vez de larga: passa por corredor de ônibus e fila de metrô sem esbarrar em ninguém. Cabe A4 em pé.',
    estoque: 6,
    vendas: 126,
    fotos: [],
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
