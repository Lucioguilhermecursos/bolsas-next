-- =========================================================================
-- acbolsa — log de eventos de pagamento
-- =========================================================================
--
-- Cada evento que o Stripe manda pro webhook vira uma linha aqui, com o que
-- a loja fez a respeito. É o primeiro lugar pra olhar quando um pagamento não
-- bateu — sem precisar caçar no log da Vercel nem no painel do Stripe.
--
-- Rodar no SQL Editor. Idempotente.
-- =========================================================================

create table if not exists public.pagamento_eventos (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique,     -- evt_...  (garante idempotência)
  tipo text,                       -- checkout.session.completed, ...
  pedido_codigo text,              -- AC........
  resultado text,                  -- processado | ignorado | erro | assinatura_invalida
  detalhe text,
  recebido_em timestamptz not null default now()
);

create index if not exists pagamento_eventos_pedido_idx
  on public.pagamento_eventos (pedido_codigo, recebido_em desc);

-- Só o webhook (service role) escreve. RLS ligada e SEM policy = ninguém
-- acessa pela API pública; o dono da loja vê pelo Table Editor.
alter table public.pagamento_eventos enable row level security;

-- `status` de `pedidos` agora também pode ser 'pagamento_falhou'
-- (boleto/PIX recusado). Continua texto livre, sem enum.
comment on column public.pedidos.status is
  'registrado | pago | pagamento_falhou | expirado';
