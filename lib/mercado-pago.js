import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const getClient = () => {
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) return null;
  return new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
};

export const mercadoPagoEnabled = () => Boolean(getClient());

export const createCheckoutPreference = async ({ user, amount }) => {
  const client = getClient();
  if (!client) return null;

  const preference = new Preference(client);
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  return preference.create({
    body: {
      items: [
        {
          id: "qr-pro-monthly",
          title: "Assinatura QR Studio PRO",
          quantity: 1,
          unit_price: amount,
          currency_id: "BRL"
        }
      ],
      external_reference: user.id,
      payer: {
        email: user.email,
        name: user.name
      },
      notification_url: `${baseUrl}/api/payments/webhook`,
      back_urls: {
        success: `${baseUrl}/dashboard?payment=success`,
        failure: `${baseUrl}/pricing?payment=failure`,
        pending: `${baseUrl}/dashboard?payment=pending`
      },
      auto_return: "approved"
    }
  });
};

export const fetchPaymentById = async (paymentId) => {
  const client = getClient();
  if (!client) return null;
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
};
