import { APIGatewayProxyHandler } from "aws-lambda";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

// Configurar el cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken:
    "APP_USR-7125774029717459-012516-6dbf616e4d2c31d97793b6b42c04469a-2229811359",
});

// Inicializar la API de Preapproval
const preapproval = new PreApproval(client);

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("Evento recibido:", JSON.stringify(event, null, 2));

  try {
    // 1. Parsear el cuerpo de la solicitud
    const body = JSON.parse(event.body || "{}");
    console.log("Cuerpo de la solicitud:", JSON.stringify(body, null, 2));

    const { userId, plan } = body;
    console.log("Datos del plan:", JSON.stringify(plan, null, 2));

    // 2. Crear la suscripción con periodo de prueba
    console.log("Creando suscripción en Mercado Pago...");
    const subscription = await preapproval.create({
      body: {
        reason: plan.name,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: plan.price,
          currency_id: "COP",
        },    
        external_reference: userId,
        payer_email: "test_user_122149942@testuser.com",
        back_url: "https://dev.d3ec9adgouri1.amplifyapp.com",
        status: "pending",
      },
    });
    console.log("Suscripción creada:", JSON.stringify(subscription, null, 2));

    // 3. Retornar la URL de checkout
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
    if (error instanceof Error) {
      console.error("Mensaje de error:", error.message);
      console.error("Stack trace:", error.stack);
    }

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({
        error: "Error creating subscription",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
