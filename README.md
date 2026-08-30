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
   - `SQL Editor`: rodar as migrações em ordem, `0001` … `0005`:
     `0001_auth_pedidos` · `0002_clientes` (ficha por cliente, `CL000001`) ·
     `0003_stripe_pedidos` · `0004_pedidos_colunas` (colunas legíveis do JSON) ·
     `0005_fornecedor_envio` (campos PF/PJ, tipo de logradouro, referência,
     rastreio + as views de exportação pro fornecedor) ·
     `0006_pagamento_eventos` (log de webhooks do Stripe).
   - Produção: configurar SMTP próprio (o embutido do Supabase é só para teste).
   - **Login com Google** (nativo — o popup mostra o domínio do site, não o
     `supabase.co`):
     1. Google Cloud → APIs & Services → Credentials → OAuth client ID → *Web
        application*.
     2. **Authorized JavaScript origins**: `http://localhost:3000` e a URL de
        produção (ex. `https://bolsas-next.vercel.app`). **Redirect URIs** não
        são necessários pra este fluxo, mas mantenha
        `https://<PROJECT>.supabase.co/auth/v1/callback` se já existir.
     3. Supabase → Authentication → Providers → **Google**: habilitar e colar o
        **Client ID** (o Secret também, não atrapalha).
     4. Env: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = o Client ID
        (`…apps.googleusercontent.com`). Vazio = botão não aparece.
     Trocar o domínio depois: é só atualizar as Authorized JavaScript origins no
     Google Cloud e o `NEXT_PUBLIC_GOOGLE_CLIENT_ID` continua o mesmo.

2. **Env**
   ```bash
   cp .env.example .env.local   # e preencher com o projeto acima
   ```

3. **Instalar e rodar**
   ```bash
   npm install
   npm run dev            # http://localhost:3000
   ```

## Exportar pedidos para o fornecedor

A migração `0005` cria duas views (sem nenhum dado financeiro):

- **`vw_pedido_fornecedor`** — um registro por pedido: destinatário (PF/PJ,
  documento, razão social, telefone `+55`), endereço em campos separados (tipo
  de logradouro, logradouro, número, complemento, bairro, cidade, UF, CEP,
  país, referência) e as colunas que o fornecedor devolve (status,
  transportadora, rastreio, despacho, invoice).
- **`vw_pedido_fornecedor_itens`** — uma linha por item: SKU (slug do produto),
  nome, cor, quantidade + 6 colunas aduaneiras **em branco** (descrição em
  inglês, peso, valor declarado, moeda, HS/NCM, país de origem) para o
  fornecedor preencher.

**Para exportar**: Supabase → Table Editor → aba *Views* → abrir a view →
*Export → CSV*. Antes disso, marque no Table Editor o campo
`pedidos.liberado_fornecedor_em` (data de liberação) dos pedidos que vão sair.
Quando o fornecedor devolver rastreio, preencha `rastreio_codigo`,
`rastreio_transportadora`, `despachado_em`, `fornecedor_status` e
`invoice_numero` na tabela `pedidos` — aparece na hora em *Minha conta* do
cliente.

## Pagamento — Stripe

**Todo o código do Stripe está em um arquivo: [`lib/pagamento/stripe.js`](lib/pagamento/stripe.js).**
O topo dele é um guia de "onde mexer quando o Stripe mudar X".

Para ligar, quando tiver a conta:

1. **Migrações**: `0003_stripe_pedidos.sql` e `0006_pagamento_eventos.sql`.
2. **Env vars** (`.env.local` e Vercel):
   - `STRIPE_SECRET_KEY` — Stripe → Developers → API keys (`sk_test_…` / `sk_live_…`)
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Project Settings → API → `service_role`
     (secreta; só o webhook usa)
3. **Webhook**: Stripe → Developers → Webhooks → *Add endpoint*
   - URL: `https://<seu-site>/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`, `checkout.session.expired`
   - Copiar o *Signing secret* (`whsec_…`) para `STRIPE_WEBHOOK_SECRET`
4. Redeploy.

### Diagnóstico

```bash
npm run stripe:check
```
Confere chaves, modo (test/live), versão da API (SDK vs. a fixada em
`lib/pagamento/stripe.js`), conexão, webhooks cadastrados e os últimos
eventos/sessões. Rode depois de `npm update stripe` ou quando um pagamento
não bater.

### Quando algo falha

- **Pagamento não virou "pago"** → tabela **`pagamento_eventos`** no Supabase:
  toda entrega de webhook fica ali (tipo, pedido, `resultado`, `detalhe`). Depois,
  painel do Stripe → Developers → Events (reenviar o evento).
- **Webhook devolvendo 400** → `detalhe` na `pagamento_eventos` diz o motivo
  (quase sempre `STRIPE_WEBHOOK_SECRET` de outro endpoint).
- **Stripe subiu a versão da API** → `npm run stripe:check` avisa; atualize
  `VERSAO_API` em `lib/pagamento/stripe.js`, teste no modo de testes, publique.

### Teste local do webhook

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
(o `stripe listen` imprime um `whsec_…` temporário para o `.env.local`)

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
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID do OAuth (login com Google) |
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
