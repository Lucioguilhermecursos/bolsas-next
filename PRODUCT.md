# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Consumidora final de médio/alto padrão. Busca bolsas de couro legítimo e
acabamento cuidado, compara qualidade antes de decidir, e compra direto pelo
site sem intermediação por vendedor ou canal de mensagem.

Compra no Brasil, em português, com preços em Real (R$). Decide sozinha, o que
significa que o site precisa carregar o peso inteiro da venda: material,
dimensões, acabamento e cuidados precisam estar visíveis na página do produto,
porque não há um atendente para responder.

## Product Purpose

Loja online da acbolsa: catálogo de bolsas e acessórios, da descoberta ao
pedido concluído. Sucesso é a visitante completar o checkout sozinha, com
confiança suficiente na descrição do produto para não precisar perguntar nada
antes de comprar.

Esta versão é uma reconstrução do zero. O site atual (acbolsa.com, WordPress +
WooCommerce com tema `luxury-jewelry`) serve como evidência do que existe hoje,
não como implementação a ser preservada.

## Positioning

Couro legítimo e acabamento de peça cara, a preço que a compradora consegue
justificar para si mesma. A proposta está no material real e no trabalho de
construção — não em uma etiqueta emprestada de outra casa.

## Operating Context

Compra feita majoritariamente no celular, em sessão curta, sem assistência. A
visitante chega ao catálogo, filtra por categoria ou formato, abre a página do
produto, avalia fotos e ficha técnica, adiciona ao carrinho e finaliza.

Categorias em operação hoje: Bolsas (com subdivisões: bolsas de mão, de ombro,
transversais, tote, mochilas), Sapatos, Relógios, e Bolsas e acessórios. O
catálogo real tem mais de 100 itens em Bolsas.

## Capabilities and Constraints

**Stack:** HTML, CSS e JavaScript puros. Sem framework, sem build step, sem
backend. Estado do carrinho persiste em `localStorage`.

**Escopo confirmado:** loja completa — homepage, catálogo com filtros e
paginação, página de produto, carrinho, checkout com formulário completo
(entrega, forma de pagamento, confirmação) e área de conta.

**Checkout:** o formulário é completo e visualmente pronto para produção, mas
não processa pagamento — não há servidor. Ele valida entrada e confirma o
pedido localmente, estruturado para ser plugado a um backend depois. Nenhuma
tela deve afirmar que uma cobrança foi feita.

**Nomenclatura do catálogo:** produtos usam nomes próprios da acbolsa,
descrevendo material e formato — "Bolsa Bucket em Couro Matelassê", "Tote
Raffia", "Mini Bolsa Chestnut". O site novo não apresenta produtos sob nomes,
modelos ou monogramas de outras casas de moda. Isso é uma restrição firme do
projeto, não uma preferência de redação.

**Não decidido:** meio de pagamento real, transportadora, política de frete e
prazos concretos. Nada disso deve ser inventado em copy.

## Brand Commitments

Nome da marca: **acbolsa**, escrito em minúsculas no corpo do texto e em
versalete/caixa alta no logotipo (`ACBOLSA`). Idioma do site: português do
Brasil.

Restrição visual que o usuário fixou: manter o espírito do site atual —
paleta bege e preto, serifada display (Cormorant Garamond) contra sem-serifa
para interface — com execução melhor em espaçamento, hierarquia,
responsividade e acessibilidade.

## Evidence on Hand

Em `assets/` (16 arquivos, único conteúdo pré-existente do projeto):

- `video.webm` — vídeo de fundo do hero.
- Banners de coleção: `1777890953-desktop-raffia.webp`,
  `1777885660-homepage_families_1.webp`, `1777885481-homepage_families_3.webp`,
  `1777885523-home-page-family-banner-mini-tote-chestnut-4x5.webp`,
  `1777968449-desktop-core_updated.webp`.
- Fotos de produto avulsas: `01.webp`, `01 (1).webp`, `gallery-01-1536x1401.webp`,
  `acb-0714-01-laranja-can13_b4ay_a92-1536x1401.webp`,
  `acb-0714-02-tabby-20-branco-09-300x274.webp`,
  `acbolsa-20260706-10-01-1152x1536.webp`, `71TZJgS9HTL._AC_SY575_.jpg`,
  `198-9.jpeg`, `微信图片_20260715122619_8_3-150x150.jpg`,
  `sub2api_task-1784516425088-apvxhdsxt_1784516517783.png`.

**Ausências que não devem ser fabricadas:** não há depoimentos de clientes,
número de vendas, prêmios, imprensa, certificações, nem dados de contato
verificados (telefone, endereço, CNPJ). Não há fotos suficientes para todo o
catálogo — produtos sem imagem própria devem reusar as disponíveis ou exibir um
placeholder honesto, nunca uma foto de outro produto apresentada como se fosse
daquele.

O site atual cita canais de contato (WhatsApp, WeChat, LINE, Shopee, TikTok,
Instagram, Facebook, YouTube) sem números ou handles confirmados para esta
reconstrução. Tratar como não confirmados.

## Product Principles

1. **A página do produto precisa vender sozinha.** Sem atendente no fluxo,
   material, medidas, acabamento e cuidados são parte da venda, não apêndice.
2. **O material é o argumento.** Couro, raffia, matelassê — a fotografia e a
   descrição carregam o valor, porque não há uma marca emprestada para carregá-lo.
3. **Nome próprio sempre.** Nenhum produto é apresentado sob a identidade de
   outra casa de moda.
4. **Celular é o caso principal, não a adaptação.** Cada tela é resolvida
   primeiro no toque e na largura estreita.
5. **Não afirmar o que não se pode cumprir.** Sem backend, o checkout confirma
   um pedido registrado — nunca um pagamento processado.

## Accessibility & Inclusion

Sem requisito formal estabelecido pelo usuário. O projeto assume como piso:
contraste legível na paleta bege/verde (o site atual usa cinza claro sobre
bege em vários rótulos, abaixo do mínimo), navegação completa por teclado com
foco preso em painéis sobrepostos, foco visível, alvos de toque adequados no
celular, e respeito a `prefers-reduced-motion`.

O hero **não usa vídeo**: `assets/video.webm` veio junto com a fotografia da
Strathberry e é tratado como inutilizável pelo mesmo motivo. O CSS mantém a
classe `.hero-video` e o HTML um comentário com a instrução de inserção, para
o dia em que houver material próprio.
