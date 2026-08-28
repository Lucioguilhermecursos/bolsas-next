-- =========================================================================
-- acbolsa — perfis e pedidos
-- =========================================================================
--
-- Rodar no SQL Editor do Supabase, uma vez por projeto (produção E teste).
-- Idempotente o suficiente para reexecutar: usa "if not exists" / "or replace"
-- onde dá.
-- =========================================================================

-- ---- profiles: 1:1 com auth.users --------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  telefone text,
  cpf text,
  endereco jsonb,                         -- último endereço usado, p/ prefill
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "perfil próprio - ler" on public.profiles;
drop policy if exists "perfil próprio - criar" on public.profiles;
drop policy if exists "perfil próprio - editar" on public.profiles;

create policy "perfil próprio - ler"
  on public.profiles for select using (auth.uid() = id);
create policy "perfil próprio - criar"
  on public.profiles for insert with check (auth.uid() = id);
create policy "perfil próprio - editar"
  on public.profiles for update using (auth.uid() = id);

-- Cria o profile no signup, com o nome vindo do metadata do cadastro.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, new.raw_user_meta_data ->> 'nome')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- pedidos ----------------------------------------------------------------
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  codigo text not null unique,
  status text not null default 'registrado',
  cliente jsonb not null,    -- { nome, email, telefone, cpf }
  entrega jsonb not null,    -- { cep, rua, numero, complemento, bairro, cidade, uf, regiao, prazo }
  itens jsonb not null,      -- [{ id, nome, cor, preco, qtd }]
  valores jsonb not null,    -- { subtotal, frete, total }
  checkout_provider text,
  checkout_url text,
  criado_em timestamptz not null default now()
);

alter table public.pedidos enable row level security;

drop policy if exists "pedidos próprios - ler" on public.pedidos;
drop policy if exists "pedidos próprios - criar" on public.pedidos;

create policy "pedidos próprios - ler"
  on public.pedidos for select using (auth.uid() = user_id);
create policy "pedidos próprios - criar"
  on public.pedidos for insert with check (auth.uid() = user_id);
-- Sem update/delete pelo cliente: status muda só por serviço/painel.

create index if not exists pedidos_user_id_criado_em_idx
  on public.pedidos (user_id, criado_em desc);
