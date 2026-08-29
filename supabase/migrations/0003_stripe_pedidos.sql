-- =========================================================================
-- acbolsa — colunas do Stripe em `pedidos`
-- =========================================================================
--
-- Rodar no SQL Editor. Idempotente.
--
-- `status` passa a ter estes valores possíveis (texto livre, sem enum):
--   registrado  -> pedido criado, aguardando pagamento
--   pago        -> webhook checkout.session.completed confirmou
--   expirado    -> a sessão de checkout expirou sem pagamento
-- =========================================================================

alter table public.pedidos
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent text,
  add column if not exists pago_em timestamptz;
