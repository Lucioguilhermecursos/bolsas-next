/* =========================================================================
   acbolsa — minha conta
   =========================================================================

   Server Component: exige login, busca pedidos e perfil do Supabase (a RLS
   garante que só vêm os da própria pessoa) e passa tudo pronto para o
   componente de interface.
   ========================================================================= */

import Link from "next/link";
import { exigirUsuario } from "@/lib/auth/sessao";
import { criarClienteServidor } from "@/lib/supabase/server";
import { sair } from "@/app/auth/acoes";
import ContaCliente from "./ContaCliente";

export const metadata = {
  title: "Minha conta",
  robots: { index: false, follow: true },
};

export default async function PaginaConta({ searchParams }) {
  const usuario = await exigirUsuario("/conta");
  const supabase = await criarClienteServidor();

  const params = (await searchParams) || {};
  const pagoDe = typeof params.pago === "string" ? params.pago : null;

  const [{ data: pedidosDb }, { data: perfil }] = await Promise.all([
    supabase
      .from("pedidos")
      .select(
        "codigo, status, cliente, entrega, itens, valores, checkout_url, criado_em, " +
          "fornecedor_status, rastreio_transportadora, rastreio_codigo, despachado_em"
      )
      .order("criado_em", { ascending: false }),
    supabase.from("profiles").select("nome, telefone, cpf, endereco").eq("id", usuario.id).maybeSingle(),
  ]);

  const pedidos = (pedidosDb || []).map((p) => ({
    codigo: p.codigo,
    data: p.criado_em,
    status: p.status,
    cliente: p.cliente,
    entrega: p.entrega,
    itens: p.itens,
    valores: p.valores,
    checkoutUrl: p.checkout_url,
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
          <ol className="crumbs" role="list">
            <li>
              <Link href="/">Início</Link>
            </li>
            <li aria-current="page">Minha conta</li>
          </ol>
          <div className="conta-head">
            <h1>Minha conta</h1>
            <form action={sair}>
              <button className="btn btn-ghost btn-sm" type="submit">
                Sair
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container">
        <ContaCliente
          pedidos={pedidos}
          perfil={perfil || null}
          email={usuario.email}
          pagoDe={pagoDe}
        />
      </div>
    </>
  );
}
