import { APIGatewayProxyHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { createHmac } from "crypto";
import axios from "axios"; // Importar axios

// Inicializar el cliente de Cognito
const client = new CognitoIdentityProviderClient();

// Clave secreta de Mercado Pago (debes configurarla en el panel de Mercado Pago)
const MERCADO_PAGO_WEBHOOK_SECRET =
  "086cb13be04912968067956f4b3f887508fa64c6b1177955e1c7f10aaebd098b";

// Token de acceso de Mercado Pago
const MERCADO_PAGO_ACCESS_TOKEN =
  "APP_USR-7125774029717459-012516-6dbf616e4d2c31d97793b6b42c04469a-2229811359";

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("Evento recibido:", JSON.stringify(event, null, 2));

  try {
    // 1. Validar la firma del webhook
    const signature =
      event.headers["x-signature"] || event.headers["X-Signature"];
    if (!signature) {
      throw new Error("Firma no proporcionada en el webhook.");
    }

    console.log("✅ Firma recibida:", signature);

    // Extraer el timestamp (ts) y la clave (v1) del header x-signature
    const [, ts, v1] = signature.match(/ts=([^,]+),v1=([^,]+)/) || [];
    if (!ts || !v1) {
      throw new Error("Formato de firma no válido.");
    }

    console.log("✅ Timestamp (ts):", ts);
    console.log("✅ Clave (v1):", v1);

    // 2. Construir el template de firma
    const dataId = event.queryStringParameters?.["data.id"];
    const requestId =
      event.headers["x-request-id"] || event.headers["X-Request-Id"];

    if (!dataId || !requestId) {
      throw new Error("Faltan parámetros requeridos en la notificación.");
    }

    const signatureTemplate = `id:${dataId};request-id:${requestId};ts:${ts};`;
    console.log("✅ Template de firma:", signatureTemplate);

    // 3. Generar la contraclave para la validación
    const expectedSignature = createHmac("sha256", MERCADO_PAGO_WEBHOOK_SECRET)
      .update(signatureTemplate)
      .digest("hex");

    console.log("✅ Firma esperada calculada:", expectedSignature);

    // 4. Comparar la firma recibida con la firma esperada
    if (v1 !== expectedSignature) {
      throw new Error("Firma del webhook no válida.");
    }

    console.log("✅ Firma del webhook validada correctamente.");

    // 5. Parsear el cuerpo del webhook
    const body = JSON.parse(event.body || "{}");
    console.log("Cuerpo del webhook:", JSON.stringify(body, null, 2));

    // 6. Obtener el estado de la suscripción desde la API de Mercado Pago
    const subscriptionId = dataId; // El ID de la suscripción es el data.id del webhook
    const url = `https://api.mercadopago.com/preapproval/${subscriptionId}`;

    console.log("Consultando la suscripción en Mercado Pago...");
    const subscriptionResponse = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
      },
    });

    const subscriptionData = subscriptionResponse.data;
    console.log(
      "Datos de la suscripción:",
      JSON.stringify(subscriptionData, null, 2)
    );

    // 7. Extraer el external_reference y el reason
    const {
      external_reference: userId,
      reason: planName,
      status,
    } = subscriptionData;

    console.log(`📝 User ID: ${userId}, Plan: ${planName}, Estado: ${status}`);

    // 8. Obtener el plan actual del usuario desde Cognito
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: "us-east-2_4yZwbrdZc", // Reemplaza con tu User Pool ID
      Username: userId, // Usar el external_reference como userId
    });

    const userData = await client.send(getUserCommand);
    const currentPlan =
      userData.UserAttributes?.find((attr) => attr.Name === "custom:plan")
        ?.Value || "free"; // Valor por defecto si no existe el atributo

    console.log(`📅 Plan actual del usuario ${userId}: ${currentPlan}`);

    // 9. Determinar el valor del atributo custom:plan según el estado
    let planValue: string;

    switch (status) {
      case "authorized":
      case "active":
        planValue = planName; // Usar el nombre del plan que viene en "reason"
        break;
      case "cancelled":
      case "paused":
        planValue = "free"; // Si la suscripción está cancelada o pausada, el plan es free
        break;
      case "pending":
        planValue = currentPlan; // Mantener el plan actual si el estado es "pending"
        break;
      default:
        planValue = "free"; // Por defecto, el plan es free
    }

    console.log(
      `📅 Actualizando el plan del usuario ${userId} a: ${planValue}`
    );

    // 10. Actualizar el atributo personalizado en Cognito (solo si es necesario)
    if (status !== "pending") {
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: "us-east-2_4yZwbrdZc", // Reemplaza con tu User Pool ID
        Username: userId, // Usar el external_reference como userId
        UserAttributes: [
          {
            Name: "custom:plan", // Nombre del atributo personalizado
            Value: planValue, // Valor del atributo (nombre del plan)
          },
        ],
      });

      await client.send(command);
      console.log("✅ Atributo actualizado en Cognito correctamente.");
    } else {
      console.log("🔄 Estado 'pending': No se actualiza el plan.");
    }

    // 11. Retornar una respuesta exitosa
    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: "Webhook procesado correctamente" }),
    };

    console.log("✅ Respuesta exitosa:", JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error("❌ Error en la función Lambda:", error);
    if (error instanceof Error) {
      console.error("❌ Mensaje de error:", error.message);
      console.error("❌ Stack trace:", error.stack);
    }

    const errorResponse = {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error procesando el webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };

    console.error(
      "❌ Respuesta de error:",
      JSON.stringify(errorResponse, null, 2)
    );
    return errorResponse;
  }
};
