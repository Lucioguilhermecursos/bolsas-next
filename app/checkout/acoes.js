"use server";

/* =========================================================================
   acbolsa — gravar pedido
   =========================================================================

   O pedido é montado NO SERVIDOR a partir do catálogo — preço, nome e frete
   nunca vêm do cliente. O que o cliente manda: quais peças, quantas, e os
   dados de contato/entrega.

   O pagamento acontece num checkout externo. Aqui só gravamos o pedido
   (status "registrado") e devolvemos a URL para onde mandar a cliente.
   ========================================================================= */

import { criarClienteServidor } from "@/lib/supabase/server";
import { obterUsuario } from "@/lib/auth/sessao";
import { porId } from "@/lib/catalog";
import { calcularFrete } from "@/lib/formulario";

function codigoPedido() {
  return "AC" + Date.now().toString().slice(-8);
}

export async function criarPedido(dados) {
  const usuario = await obterUsuario();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo para finalizar." };

  const { itens = [], contato = {}, entrega = {} } = dados || {};

  /* Resolve cada item pelo catálogo; descarta o que não existe mais. */
  const linhas = itens
    .map((i) => {
      const p = porId(i.id);
      const qtd = Math.max(1, Math.min(Number(i.qtd) || 1, p ? p.estoque : 0));
      return p && qtd > 0
        ? { id: p.id, nome: p.nome, cor: p.cor, preco: p.preco, qtd }
        : null;
    })
    .filter(Boolean);

  if (!linhas.length) return { erro: "Não há itens válidos na sacola." };

  const cepLimpo = String(entrega.cep || "").replace(/\D/g, "");
  if (cepLimpo.length !== 8) return { erro: "Informe um CEP válido para calcular o frete." };

  const subtotal = linhas.reduce((s, l) => s + l.preco * l.qtd, 0);
  const frete = calcularFrete(cepLimpo, subtotal);
  const total = subtotal + frete.valor;

  const codigo = codigoPedido();

  const base = process.env.EXTERNAL_CHECKOUT_BASE_URL;
  const checkoutUrl = base
    ? base + (base.includes("?") ? "&" : "?") + "pedido=" + codigo
    : null;

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("pedidos").insert({
    user_id: usuario.id,
    codigo,
    status: "registrado",
    cliente: {
      nome: contato.nome || "",
      email: contato.email || usuario.email || "",
      telefone: contato.telefone || "",
      cpf: contato.cpf || "",
    },
    entrega: {
      cep: entrega.cep || "",
      rua: entrega.rua || "",
      numero: entrega.numero || "",
      complemento: entrega.complemento || null,
      bairro: entrega.bairro || "",
      cidade: entrega.cidade || "",
      uf: entrega.uf || "",
      regiao: frete.regiao,
      prazo: frete.prazo,
    },
    itens: linhas,
    valores: { subtotal, frete: frete.valor, total },
    checkout_provider: base ? "externo" : null,
    checkout_url: checkoutUrl,
  });

  if (error) {
    return { erro: "Não foi possível registrar o pedido agora. Tente de novo." };
  }

  /* Guarda o último endereço no perfil, para o próximo checkout já vir preenchido. */
  await supabase
    .from("profiles")
    .update({
      telefone: contato.telefone || null,
      cpf: contato.cpf || null,
      endereco: {
        cep: entrega.cep,
        rua: entrega.rua,
        numero: entrega.numero,
        complemento: entrega.complemento || null,
        bairro: entrega.bairro,
        cidade: entrega.cidade,
        uf: entrega.uf,
      },
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", usuario.id);

  /* Ficha do cliente (tabela `clientes`): dados completos num lugar só. */
  await supabase.from("clientes").upsert(
    {
      user_id: usuario.id,
      nome: contato.nome || null,
      email: contato.email || usuario.email || null,
      telefone: contato.telefone || null,
      cpf: contato.cpf || null,
      cep: entrega.cep || null,
      rua: entrega.rua || null,
      numero: entrega.numero || null,
      complemento: entrega.complemento || null,
      bairro: entrega.bairro || null,
      cidade: entrega.cidade || null,
      uf: entrega.uf || null,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return {
    ok: true,
    pedido: {
      codigo,
      data: new Date().toISOString(),
      cliente: {
        nome: contato.nome || "",
        email: contato.email || usuario.email || "",
        telefone: contato.telefone || "",
        cpf: contato.cpf || "",
      },
      entrega: {
        cep: entrega.cep || "",
        rua: entrega.rua || "",
        numero: entrega.numero || "",
        complemento: entrega.complemento || null,
        bairro: entrega.bairro || "",
        cidade: entrega.cidade || "",
        uf: entrega.uf || "",
        regiao: frete.regiao,
        prazo: frete.prazo,
      },
      itens: linhas,
      valores: { subtotal, frete: frete.valor, total },
      status: "registrado",
      checkoutUrl,
    },
  };
}
