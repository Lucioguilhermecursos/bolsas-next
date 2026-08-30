-- =========================================================================
-- acbolsa — dados de fornecedor / envio + views de exportação
-- =========================================================================
--
-- Rodar no SQL Editor, depois das migrações 0001–0004. Idempotente.
--
-- Adiciona:
--   • em `pedidos`: colunas derivadas do JSON (tipo PF/PJ, razão social, tipo
--     de logradouro, país, referência) + colunas que a operação/fornecedor
--     preenchem (liberação, status, transportadora, rastreio, despacho, invoice)
--   • em `clientes`: os mesmos campos novos de contato/endereço
--   • duas VIEWS para exportar CSV pro fornecedor — sem nada financeiro
-- =========================================================================

-- ---- pedidos: colunas derivadas do JSON --------------------------------------
alter table public.pedidos
  add column if not exists destinatario_tipo         text generated always as (cliente ->> 'tipo') stored,
  add column if not exists destinatario_razao_social text generated always as (cliente ->> 'razao_social') stored,
  add column if not exists entrega_tipo_logradouro   text generated always as (entrega ->> 'tipo_logradouro') stored,
  add column if not exists entrega_pais              text generated always as (coalesce(entrega ->> 'pais', 'BR')) stored,
  add column if not exists entrega_referencia        text generated always as (entrega ->> 'referencia') stored;

-- ---- pedidos: colunas preenchidas pela operação / fornecedor -----------------
alter table public.pedidos
  add column if not exists liberado_fornecedor_em timestamptz,               -- quando passou pro fornecedor
  add column if not exists fornecedor_status       text default 'aguardando', -- aguardando | recebido | em_separacao | despachado
  add column if not exists rastreio_transportadora text,
  add column if not exists rastreio_codigo         text,
  add column if not exists despachado_em           timestamptz,
  add column if not exists invoice_numero          text;

-- ---- clientes: campos novos de contato/endereço -----------------------------
alter table public.clientes
  add column if not exists tipo            text default 'PF',   -- PF | PJ
  add column if not exists razao_social    text,
  add column if not exists tipo_logradouro text,
  add column if not exists pais            text default 'BR',
  add column if not exists referencia      text;

-- ---- VIEW: um registro por pedido (pra etiqueta e importação) ---------------
-- security_invoker: respeita o RLS de `pedidos` na API; no SQL Editor / Table
-- Editor (dono da loja) enxerga tudo.
create or replace view public.vw_pedido_fornecedor
with (security_invoker = true) as
select
  p.codigo                                     as numero_pedido,
  p.criado_em                                  as comprado_em,
  p.liberado_fornecedor_em                     as liberado_em,
  coalesce(p.destinatario_tipo, 'PF')          as destinatario_tipo,
  p.cliente_nome                               as destinatario_nome,
  p.destinatario_razao_social                  as destinatario_razao_social,
  p.cliente_cpf_cnpj                           as destinatario_documento,
  '+55' || regexp_replace(coalesce(p.cliente_telefone, ''), '\D', '', 'g') as destinatario_telefone,
  p.cliente_email                              as destinatario_email,
  p.entrega_tipo_logradouro                    as endereco_tipo_logradouro,
  p.entrega_rua                                as endereco_logradouro,
  p.entrega_numero                             as endereco_numero,
  p.entrega_complemento                        as endereco_complemento,
  p.entrega_bairro                             as endereco_bairro,
  p.entrega_cidade                             as endereco_cidade,
  p.entrega_uf                                 as endereco_uf,
  p.entrega_cep                                as endereco_cep,
  p.entrega_pais                               as endereco_pais,
  p.entrega_referencia                         as endereco_referencia,
  -- devolvidos pelo fornecedor:
  p.fornecedor_status,
  p.rastreio_transportadora                    as transportadora,
  p.rastreio_codigo,
  p.despachado_em,
  p.invoice_numero
from public.pedidos p;

-- ---- VIEW: uma linha por item, com colunas aduaneiras em branco -------------
-- As 6 últimas colunas ficam vazias de propósito: o fornecedor preenche na
-- exportação (descrição em inglês, peso, valor declarado, moeda, HS/NCM,
-- país de origem da mercadoria).
create or replace view public.vw_pedido_fornecedor_itens
with (security_invoker = true) as
select
  p.codigo                          as numero_pedido,
  item ->> 'id'                     as sku,
  item ->> 'nome'                   as produto_nome,
  item ->> 'cor'                    as variacao_cor,
  (item ->> 'qtd')::int             as quantidade,
  null::text                        as descricao_ingles,
  null::numeric                     as peso_unitario_g,
  null::numeric                     as valor_declarado_unitario,
  null::text                        as moeda_declarada,
  null::text                        as hs_ncm,
  null::text                        as pais_origem_mercadoria
from public.pedidos p
cross join lateral jsonb_array_elements(p.itens) as item;

comment on view public.vw_pedido_fornecedor is
  'Exportar como CSV para o fornecedor. Sem dados financeiros. Um registro por pedido.';
comment on view public.vw_pedido_fornecedor_itens is
  'Itens do pedido para o fornecedor. As 6 colunas aduaneiras finais são preenchidas por ele.';
