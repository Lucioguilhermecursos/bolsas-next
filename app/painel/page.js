/* =========================================================================
   acbolsa — painel do vendedor
   =========================================================================

   Server Component: exige e-mail autorizado (ADMIN_EMAILS, ver lib/auth/admin)
   e busca TODOS os pedidos com o cliente admin (ignora a RLS, que só deixa
   cada cliente ver o próprio pedido — aqui é o vendedor vendo os de todos).

   Depende de duas variáveis em produção (Vercel) e local (.env.local):
     ADMIN_EMAILS              e-mail(s) do vendedor, separados por vírgula
     SUPABASE_SERVICE_ROLE_KEY mesma chave que o webhook do Stripe usa
   Sem elas: ADMIN_EMAILS vazio barra todo mundo (ver lib/auth/admin — nega
   por padrão); sem a service role, criarClienteAdmin() lança erro.
   ========================================================================= */

import { exigirAdmin } from "@/lib/auth/admin";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { sair } from "@/app/auth/acoes";
import PainelVendedor from "./PainelVendedor";

export const metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

export default async function PaginaPainel() {
  await exigirAdmin();

  const { data: pedidosDb, error: erroBusca } = await criarClienteAdmin()
    .from("pedidos")
    .select(
      "codigo, status, cliente, entrega, itens, valores, checkout_provider, criado_em, pago_em, " +
        "stripe_session_id, stripe_payment_intent, mp_payment_id, " +
        "fornecedor_status, rastreio_transportadora, rastreio_codigo, despachado_em"
    )
    .order("criado_em", { ascending: false });

  if (erroBusca) console.error("[painel] buscar pedidos:", erroBusca.message);

  const pedidos = (pedidosDb || []).map((p) => ({
    codigo: p.codigo,
    data: p.criado_em,
    status: p.status,
    cliente: p.cliente,
    entrega: p.entrega,
    itens: p.itens,
    valores: p.valores,
    pagamento: {
      provedor: p.checkout_provider,
      pagoEm: p.pago_em,
      referencia: p.stripe_payment_intent || p.stripe_session_id || p.mp_payment_id || null,
    },
    envio: {
      status: p.fornecedor_status || null,
      transportadora: p.rastreio_transportadora || null,
      codigo: p.rastreio_codigo || null,
      despachadoEm: p.despachado_em || null,
    },
  }));

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="conta-head">
            <h1>Painel</h1>
            <form action={sair}>
              <button className="btn btn-ghost btn-sm" type="submit">
                Sair
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container">
        {erroBusca && (
          <p className="notice mb-6" role="alert">
            Erro ao buscar pedidos: {erroBusca.message}
          </p>
        )}
        <PainelVendedor pedidos={pedidos} />
      </div>
    </>
  );
}
