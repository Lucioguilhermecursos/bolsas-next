-- =========================================================================
-- acbolsa — colunas legíveis em `pedidos`
-- =========================================================================
--
-- O pedido guarda cliente e entrega em JSON (bom pra manter uma foto exata do
-- que foi informado na hora da compra). Estas colunas são DERIVADAS desse JSON
-- automaticamente (generated ... stored) — sempre em dia, sem código extra —
-- só pra aparecerem como colunas normais no Table Editor.
--
-- Rodar no SQL Editor. Idempotente.
-- =========================================================================

alter table public.pedidos
  add column if not exists cliente_nome        text generated always as (cliente ->> 'nome') stored,
  add column if not exists cliente_cpf_cnpj    text generated always as (cliente ->> 'cpf') stored,
  add column if not exists cliente_email       text generated always as (cliente ->> 'email') stored,
  add column if not exists cliente_telefone    text generated always as (cliente ->> 'telefone') stored,
  add column if not exists entrega_cep         text generated always as (entrega ->> 'cep') stored,
  add column if not exists entrega_rua         text generated always as (entrega ->> 'rua') stored,
  add column if not exists entrega_numero      text generated always as (entrega ->> 'numero') stored,
  add column if not exists entrega_complemento text generated always as (entrega ->> 'complemento') stored,
  add column if not exists entrega_bairro      text generated always as (entrega ->> 'bairro') stored,
  add column if not exists entrega_cidade      text generated always as (entrega ->> 'cidade') stored,
  add column if not exists entrega_uf          text generated always as (entrega ->> 'uf') stored,
  add column if not exists entrega_prazo       text generated always as (entrega ->> 'prazo') stored;

-- `clientes` já tem todos esses campos como colunas normais (migração 0002).
-- Comentário só pra deixar claro que o campo aceita os dois documentos:
comment on column public.clientes.cpf is 'CPF (11 díg.) ou CNPJ (14 díg.)';
