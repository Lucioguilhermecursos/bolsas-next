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
  const { data: perfil } = await supabase
    .from("profiles")
    .select("nome, telefone, cpf, endereco")
    .eq("id", usuario.id)
    .maybeSingle();

  const inicial = {
    nome: perfil?.nome || "",
    email: usuario.email || "",
    tel: perfil?.telefone || "",
    cpf: perfil?.cpf || "",
    cep: perfil?.endereco?.cep || "",
    rua: perfil?.endereco?.rua || "",
    numero: perfil?.endereco?.numero || "",
    compl: perfil?.endereco?.complemento || "",
    bairro: perfil?.endereco?.bairro || "",
    cidade: perfil?.endereco?.cidade || "",
    uf: perfil?.endereco?.uf || "",
  };

  return (
    <div className="container">
      <CheckoutCliente inicial={inicial} />
    </div>
  );
}
