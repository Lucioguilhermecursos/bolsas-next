import{MercadoPagoConfig, Payment } from "mercadopago";

export function mercadoPagoAtivo(){
    return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

let cache = null;

function obterCliente() {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) return null;
    if (!cache) cache = new MercadoPagoConfig({ accessToken: token});
    
    return cache;
}

export async function criarPagamento({codigo, valorTotal, email, formData}) {
    const cliente = obterCliente();
    if (!cliente) return null;

    const payment = new Payment(cliente);

    const resposta = await payment.create({
        body: {
            ...formData,
            transaction_amount: Number(valorTotal),
            external_reference: codigo,
            description: "pedido " + codigo,
            payer: {...formData?.payer, email: email || formData?.payer?.email},
        },
        requestOptions: {idempotencyKey: codigo},
    });

    return {
        id: resposta.id,
        status: resposta.status,
        statusDetail: resposta.status_detail,
        pix: resposta.point_of_interaction?.transaction_data || null,
    };


}