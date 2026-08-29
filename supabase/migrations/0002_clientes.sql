-- =========================================================================
-- acbolsa — tabela de clientes
-- =========================================================================
--
-- Uma linha por cliente, com todos os dados num lugar só: código gerado
-- (CL000001…), nome, contato, endereço e o ID da conta (user_id / auth.users).
--
-- Preenchida automaticamente no cadastro (nome + e-mail) e completada no
-- checkout (telefone, CPF, endereço). Separada de `profiles`, que segue
-- servindo o funcionamento interno do app.
--
-- Rodar no SQL Editor, no projeto de produção (e no de teste, se usar).
-- Idempotente — pode reexecutar.
-- =========================================================================

create sequence if not exists public.clientes_codigo_seq;

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  codigo text not null unique
    default ('CL' || lpad(nextval('public.clientes_codigo_seq')::text, 6, '0')),
  nome text,
  email text,
  telefone text,
  cpf text,
  cep text,
  rua text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  uf text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.clientes enable row level security;

drop policy if exists "cliente próprio - ler" on public.clientes;
drop policy if exists "cliente próprio - criar" on public.clientes;
drop policy if exists "cliente próprio - editar" on public.clientes;

create policy "cliente próprio - ler"
  on public.clientes for select using (auth.uid() = user_id);
create policy "cliente próprio - criar"
  on public.clientes for insert with check (auth.uid() = user_id);
create policy "cliente próprio - editar"
  on public.clientes for update using (auth.uid() = user_id);

-- Cadastro: cria profile E cliente. Substitui a função da migração 0001.
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

  insert into public.clientes (user_id, nome, email)
  values (new.id, new.raw_user_meta_data ->> 'nome', new.email)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Backfill: quem já se cadastrou antes desta migração ganha a linha agora.
insert into public.clientes (user_id, nome, email)
select u.id, u.raw_user_meta_data ->> 'nome', u.email
from auth.users u
on conflict (user_id) do nothing;
