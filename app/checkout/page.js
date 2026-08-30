/* =========================================================================
   acbolsa — finalizar compra
   =========================================================================

   Exige login (o proxy já barra antes, isto é a checagem que vale). Busca o
   perfil para pré-preencher contato e endereço.
   ========================================================================= */

import { exigirUsuario } from "@/lib/auth/sessao";
import { criarClienteServidor } from "@/lib/supabase/server";
import CheckoutCliente from "./CheckoutCliente";

export const metadata = {
  title: "Finalizar compra",
  robots: { index: false, follow: false },
};

export default async function PaginaCheckout() {
  const usuario = await exigirUsuario("/checkout");

  const supabase = await criarClienteServidor();
  const { data: c } = await supabase
    .from("clientes")
    .select(
      "tipo, nome, razao_social, telefone, cpf, cep, tipo_logradouro, rua, numero, complemento, bairro, cidade, uf, referencia"
    )
    .eq("user_id", usuario.id)
    .maybeSingle();

  const inicial = {
    tipoPessoa: c?.tipo === "PJ" ? "PJ" : "PF",
    nome: c?.nome || "",
    razaoSocial: c?.razao_social || "",
    email: usuario.email || "",
    tel: c?.telefone || "",
    cpf: c?.cpf || "",
    cep: c?.cep || "",
    tipoLogradouro: c?.tipo_logradouro || "Rua",
    rua: c?.rua || "",
    numero: c?.numero || "",
    compl: c?.complemento || "",
    bairro: c?.bairro || "",
    cidade: c?.cidade || "",
    uf: c?.uf || "",
    referencia: c?.referencia || "",
  };

  return (
    <div className="container">
      <CheckoutCliente inicial={inicial} />
    </div>
  );
}
