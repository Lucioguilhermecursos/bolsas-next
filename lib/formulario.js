/* =========================================================================
   acbolsa — máscaras, validação e frete
   =========================================================================

   Funções puras, sem DOM. Ficam fora do componente para poderem ser testadas
   e reaproveitadas — a mesma máscara de CPF vale no checkout e na conta.
   ========================================================================= */

/* ---------- Frete -----------------------------------------------------------

   Frete por região, a partir do CEP. Valores de EXEMPLO — precisam ser
   trocados pelos da transportadora real antes de publicar. Ver "Pendências
   do negócio" no CONTINUAR-AQUI.md.
   -------------------------------------------------------------------------- */

export const FRETE = {
  faixas: [
    { ate: 19999999, nome: "Sudeste", valor: 24.9, prazo: "3 a 5 dias úteis" },
    { ate: 29999999, nome: "Sudeste", valor: 24.9, prazo: "3 a 5 dias úteis" },
    { ate: 39999999, nome: "Sudeste", valor: 29.9, prazo: "4 a 7 dias úteis" },
    { ate: 49999999, nome: "Sul", valor: 32.9, prazo: "5 a 8 dias úteis" },
    { ate: 65999999, nome: "Nordeste", valor: 39.9, prazo: "7 a 12 dias úteis" },
    { ate: 69999999, nome: "Norte", valor: 49.9, prazo: "9 a 15 dias úteis" },
    { ate: 79999999, nome: "Centro-Oeste", valor: 34.9, prazo: "5 a 9 dias úteis" },
    { ate: 99999999, nome: "Sul", valor: 32.9, prazo: "5 a 8 dias úteis" },
  ],
  gratisAcima: 500,
};

export function calcularFrete(cep, subtotal) {
  const n = Number(String(cep).replace(/\D/g, ""));
  if (!n) return null;
  const faixa = FRETE.faixas.find((f) => n <= f.ate) || FRETE.faixas[FRETE.faixas.length - 1];
  const gratis = subtotal >= FRETE.gratisAcima;
  return {
    regiao: faixa.nome,
    prazo: faixa.prazo,
    valor: gratis ? 0 : faixa.valor,
    gratis,
  };
}

/* ---------- Máscaras -------------------------------------------------------- */

export function mascaraCEP(v) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d;
}

export function mascaraCPF(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export function mascaraTelefone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export function mascaraCartao(v) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function mascaraValidade(v) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}

/* ---------- Validação ------------------------------------------------------- */

/* CPF com dígito verificador — recusa 111.111.111-11 e afins. Um `length`
   de 11 aceitaria qualquer sequência, e a nota fiscal sairia errada. */
export function cpfValido(cpf) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(d[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(d[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(d[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(d[10]);
}

export function emailValido(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function validadeCartaoValida(v) {
  const m = v.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const mes = Number(m[1]);
  const ano = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;
  /* O cartão vale até o último instante do mês impresso. */
  const fim = new Date(ano, mes, 0, 23, 59, 59);
  return fim >= new Date();
}

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

/* ---------- Pedidos --------------------------------------------------------- */

export const CHAVE_PEDIDOS = "acbolsa:pedidos";

export function lerPedidos() {
  if (typeof window === "undefined") return [];
  try {
    const dados = JSON.parse(window.localStorage.getItem(CHAVE_PEDIDOS) || "[]");
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

/* Guarda os 20 pedidos mais recentes, do mais novo para o mais antigo. */
export function gravarPedido(pedido) {
  if (typeof window === "undefined") return;
  try {
    const anteriores = lerPedidos();
    anteriores.unshift(pedido);
    window.localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(anteriores.slice(0, 20)));
  } catch {
    /* Armazenamento indisponível: o pedido segue exibido nesta sessão. */
  }
}
