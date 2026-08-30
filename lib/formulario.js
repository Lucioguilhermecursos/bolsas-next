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

/* Formata como CPF (000.000.000-00) até 11 dígitos e como CNPJ
   (00.000.000/0000-00) a partir daí — a mesma caixa aceita pessoa física ou
   jurídica, que é o que a nota fiscal exige. */
export function mascaraCpfCnpj(v) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) return mascaraCPF(d);
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

export function mascaraTelefone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
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

/* CNPJ com os dois dígitos verificadores. */
export function cnpjValido(cnpj) {
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;

  const digito = (base) => {
    const pesos =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base
      .split("")
      .reduce((s, n, i) => s + Number(n) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = digito(d.slice(0, 12));
  const d2 = digito(d.slice(0, 12) + d1);
  return d1 === Number(d[12]) && d2 === Number(d[13]);
}

/* Aceita CPF (11 díg.) ou CNPJ (14 díg.), validando os dígitos de cada um. */
export function cpfCnpjValido(v) {
  const d = v.replace(/\D/g, "");
  if (d.length === 14) return cnpjValido(d);
  return cpfValido(d);
}

export function emailValido(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

/* Senha: mínimo do que dá para exigir sem virar obstáculo — 8 caracteres,
   ao menos uma letra e um número. O Supabase revalida do lado dele. */
export function senhaValida(v) {
  return v.length >= 8 && /[a-zA-Z]/.test(v) && /[0-9]/.test(v);
}

/* Regras da senha no formato de REGRAS do checkout: [teste, mensagem]. Cada
   mensagem diz o que falta, não só "senha inválida". */
export const REGRAS_SENHA = [
  [(v) => v.length >= 8, "Use pelo menos 8 caracteres."],
  [(v) => /[a-zA-Z]/.test(v), "Inclua pelo menos uma letra."],
  [(v) => /[0-9]/.test(v), "Inclua pelo menos um número."],
];

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

/* Tipo de logradouro em coluna própria: o sistema de etiqueta do fornecedor
   (estrangeiro) não sabe separar "Rua X, 123" — precisa de campos discretos. */
export const TIPOS_LOGRADOURO = [
  "Rua", "Avenida", "Travessa", "Alameda", "Praça", "Rodovia", "Estrada",
  "Via", "Viela", "Largo", "Ladeira", "Passeio",
];

/* Os pedidos agora vivem no Supabase (tabela `pedidos`, RLS por usuário). Ver
   app/checkout/acoes.js para gravar e app/conta/page.js para ler. */
