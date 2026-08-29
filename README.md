# acbolsa — loja

Next.js 16 (App Router) + Supabase (login/senha + Google, pedidos e clientes).
O catálogo é editado em `lib/catalog.js`; cores, preços e frete têm comentários
no próprio arquivo. O pagamento é feito fora do site — via **Stripe Checkout**
(quando as chaves estão configuradas) ou um link externo genérico.

## Configuração

1. **Supabase — projeto de produção/dev**
   - Criar o projeto e pegar Project URL + chave publishable (`sb_publishable_…`).
   - `Authentication → Providers → Email`: "Confirm email" **ON**.
   - `Authentication → URL Configuration`: Site URL de produção + redirect URLs
     (`http://localhost:3000/**`, `http://localhost:3187/**` e a de produção).
   - `Authentication → Email Templates` — **não precisa editar**. Os templates
     padrão (`{{ .ConfirmationURL }}`) já funcionam: o link cai em
     `/auth/callback`, que troca o código por sessão. (Se quiser customizar,
     o `/auth/confirmar` também aceita `token_hash={{ .TokenHash }}&type=email`.)
   - `SQL Editor`: rodar as migrações em ordem — `0001_auth_pedidos.sql`,
     `0002_clientes.sql` (ficha por cliente, código `CL000001`),
     `0003_stripe_pedidos.sql` (colunas de pagamento em `pedidos`).
   - Produção: configurar SMTP próprio (o embutido do Supabase é só para teste).
   - **Login com Google**: no Google Cloud, criar um OAuth client "Web
     application" com redirect URI `https://<PROJECT>.supabase.co/auth/v1/callback`;
     em Authentication → Providers → Google, colar Client ID + Secret e habilitar.
     O `redirect_to` da volta (`/auth/callback`) já está coberto pelos Redirect
     URLs `/**`. Sem isso, o botão "Entrar com o Google" aparece mas o Google
     recusa.

2. **Env**
   ```bash
   cp .env.example .env.local   # e preencher com o projeto acima
   ```

3. **Instalar e rodar**
   ```bash
   npm install
   npm run dev            # http://localhost:3000
   ```

## Pagamento — Stripe

O código já está pronto. Para ligar, quando tiver a conta Stripe:

1. **Migração**: rodar `supabase/migrations/0003_stripe_pedidos.sql` (se ainda não).
2. **Env vars** (`.env.local` e/ou Vercel):
   - `STRIPE_SECRET_KEY` — Stripe → Developers → API keys (`sk_test_…` / `sk_live_…`)
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Project Settings → API → `service_role`
     (secreta; só o webhook usa, para marcar o pedido como pago)
3. **Webhook**: Stripe → Developers → Webhooks → *Add endpoint*
   - URL: `https://<seu-site>/api/stripe/webhook`
   - Eventos: `checkout.session.completed` e `checkout.session.expired`
   - Copiar o *Signing secret* (`whsec_…`) para `STRIPE_WEBHOOK_SECRET`
4. Redeploy.

Com `STRIPE_SECRET_KEY` presente, o checkout cria uma Stripe Checkout Session e
manda a cliente pra lá; o webhook marca `pedidos.status = 'pago'`. Sem a chave,
cai em `EXTERNAL_CHECKOUT_BASE_URL` (link genérico) ou só registra o pedido.

Teste local do webhook: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
(o `stripe listen` imprime um `whsec_…` temporário).

## Testes

`npm test` compila e roda a suíte inteira contra um **segundo projeto Supabase,
só de teste** (nunca o de produção — os testes criam pedidos de verdade).

- Criar esse projeto, rodar a mesma migração nele, criar um usuário já
  confirmado (`Add user` com "Auto Confirm User").
- Preencher `.env.test` (modelo e passos no próprio arquivo).
- `npm test`

## Deploy — Vercel

Sem mudança de código. Import do repo na Vercel e, em **Settings → Environment
Variables** (Production + Preview):

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | do projeto Supabase de produção |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem |
| `NEXT_PUBLIC_SITE_URL` | a URL final, ex. `https://bolsas-next.vercel.app` (sem barra no fim) |
| `EXTERNAL_CHECKOUT_BASE_URL` | quando houver checkout externo |

Não setar `BUILD_STANDALONE` (é só para o Docker).

Depois do 1º deploy, no Supabase:
- **URL Configuration** → Site URL = a URL da Vercel; Redirect URLs = adicionar
  `https://<projeto>.vercel.app/**` (e o domínio próprio, se houver).

Google Cloud **não muda** — o redirect URI continua sendo o do Supabase.

## Deploy — container (alternativa)

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  --build-arg EXTERNAL_CHECKOUT_BASE_URL=... \
  -t acbolsa .
docker run -p 3000:3000 acbolsa
```

O `Dockerfile` liga `output: "standalone"` via `BUILD_STANDALONE`.
