/* =========================================================================
   acbolsa — painel do vendedor
   =========================================================================

   Server Component: exige e-mail autorizado (ADMIN_EMAILS, ver lib/auth/admin)
   e busca TODOS os pedidos com o cliente admin (ignora a RLS, que só deixa
   cada cliente ver o próprio pedido — aqui é o vendedor vendo os de todos).

   TEMPORÁRIO, enquanto a página é construída — dois desvios, os dois
   marcados abaixo, PRECISAM voltar antes de publicar ou mostrar o site pra
   alguém:
     1. exigirAdmin() → exigirUsuario(): qualquer pessoa logada acessa, não
        só o vendedor.
     2. cliente admin → cliente normal: sem SUPABASE_SERVICE_ROLE_KEY
        configurada ainda, a busca usa o cliente comum, que respeita a RLS —
        então só aparecem OS PEDIDOS DE QUEM ESTIVER LOGADO, não os de
        todo mundo. Serve só para testar o layout.
   ========================================================================= */

import { exigirUsuario } from "@/lib/auth/sessao";
// import { exigirAdmin } from "@/lib/auth/admin";
import { criarClienteServidor } from "@/lib/supabase/server";
// import { criarClienteAdmin } from "@/lib/supabase/admin";
import { sair } from "@/app/auth/acoes";
import PainelVendedor from "./PainelVendedor";

export const metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

export default async function PaginaPainel() {
  await exigirUsuario("/painel"); // TEMPORÁRIO — ver aviso no topo do arquivo

  const supabase = await criarClienteServidor(); // TEMPORÁRIO — ver aviso no topo do arquivo
  const { data: pedidosDb } = await supabase
    .from("pedidos")
    .select(
      "codigo, status, cliente, entrega, itens, valores, checkout_provider, criado_em, pago_em, " +
        "stripe_session_id, stripe_payment_intent, mp_payment_id, " +
        "fornecedor_status, rastreio_transportadora, rastreio_codigo, despachado_em"
    )
    .order("criado_em", { ascending: false });

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
        <PainelVendedor pedidos={pedidos} />
      </div>
    </>
  );
}
