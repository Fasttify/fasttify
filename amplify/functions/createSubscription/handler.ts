import { APIGatewayProxyHandler } from "aws-lambda";

const MERCADOPAGO_ACCESS_TOKEN =
  "APP_USR-7125774029717459-012516-6dbf616e4d2c31d97793b6b42c04469a-2229811359";
const MERCADOPAGO_API_URL = "https://api.mercadopago.com/preapproval";

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("Evento recibido:", JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body || "{}");
    const { userId, plan } = body;

    // Crear la solicitud directamente al API
    const response = await fetch(MERCADOPAGO_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: plan.name,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: plan.price,
          currency_id: "COP",
        },
        external_reference: userId,
        payer_email: "test_user_122149942@testuser.com",
        back_url:
          "https://feature-get-started.d705ckpcaa3mv.amplifyapp.com/subscription-success",
        status: "pending",
      }),
    });

    if (!response.ok) {
      throw new Error(`Error de MercadoPago: ${response.statusText}`);
    }

    const subscription = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({
        checkoutUrl: subscription.init_point,
      }),
    };
  } catch (error) {
    console.error("Error en la función Lambda:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({
        error: "Error creando suscripción",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
    };
  }
};
