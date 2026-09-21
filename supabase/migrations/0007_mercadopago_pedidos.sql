-- =========================================================================
-- acbolsa — coluna do Mercado Pago em `pedidos`
-- =========================================================================
--
-- Rodar no SQL Editor. Idempotente.
--
-- `mp_payment_id` guarda o id do pagamento criado no Mercado Pago.
-- `pago_em` e `status` já existem (0003) e servem aos dois provedores.
-- =========================================================================

alter table public.pedidos
  add column if not exists mp_payment_id text;

  
