# acbolsa — loja

Next.js 16 (App Router) + Supabase (login/senha e pedidos). O catálogo é
editado em `lib/catalog.js`; cores, preços e frete têm comentários no próprio
arquivo. O pagamento acontece num **checkout externo** — o site registra o
pedido e leva a cliente até lá.

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
   - `SQL Editor`: rodar `supabase/migrations/0001_auth_pedidos.sql` e depois
     `0002_clientes.sql` (tabela `clientes` — ficha completa por cliente, com
     código gerado `CL000001`).
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
