import { APIGatewayProxyHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { createHmac } from "crypto";
import axios from "axios";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/HookPlan"; 
import { type Schema } from "../../../data/resource";

// Configurar Amplify usando la configuración para funciones con acceso a datos
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);
Amplify.configure(resourceConfig, libraryOptions);

// Inicializar el cliente de Cognito y el de DynamoDB (Amplify Data)
const client = new CognitoIdentityProviderClient();
const clientSchema = generateClient<Schema>();

// Clave secreta y token de Mercado Pago (configúralos en el panel de Mercado Pago)
const MERCADO_PAGO_WEBHOOK_SECRET =
  "1384e0f904220759e2d1f2ed68c4c00877bb642389684614677a1372b6ee5347";
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

    // 4. Comparar la firma recibida con la esperada
    if (v1 !== expectedSignature) {
      throw new Error("Firma del webhook no válida.");
    }
    console.log("✅ Firma del webhook validada correctamente.");

    // 5. Parsear el cuerpo del webhook
    const body = JSON.parse(event.body || "{}");
    console.log("Cuerpo del webhook:", JSON.stringify(body, null, 2));

    // 6. Consultar el estado de la suscripción en Mercado Pago
    const subscriptionId = dataId; // ID de la suscripción del webhook
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

    // 7. Extraer los datos necesarios: userId, planName y nextPaymentDate
    const {
      external_reference: userId,
      reason: planName,
      status,
      next_payment_date: nextPaymentDate,
    } = subscriptionData;
    console.log(
      `📝 User ID: ${userId}, Plan: ${planName}, Estado: ${status}, Próxima fecha de pago: ${nextPaymentDate}`
    );

    // 8. Obtener el plan actual del usuario desde Cognito
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: "us-east-2_EVU1jxAq4",
      Username: userId,
    });
    const userData = await client.send(getUserCommand);
    const currentPlan =
      userData.UserAttributes?.find((attr) => attr.Name === "custom:plan")
        ?.Value || "free";
    console.log(`📅 Plan actual del usuario ${userId}: ${currentPlan}`);

    // 9. Lógica para determinar el plan a asignar (basado en el status)
    const isCurrentPlanActive = currentPlan !== "free";
    let planValue: string;
    switch (status) {
      case "authorized":
      case "approved":
      case "active":
        planValue = planName;
        break;
      case "cancelled":
      case "paused":
      case "rejected":
        planValue = isCurrentPlanActive ? currentPlan : "free";
        break;
      case "pending":
      case "in_process":
        planValue = currentPlan;
        break;
      case "expired":
      case "suspended":
        planValue = "free";
        break;
      default:
        planValue = isCurrentPlanActive ? currentPlan : "free";
    }
    console.log(
      `📅 Actualizando el plan del usuario ${userId} a: ${planValue}`
    );

    // 10. Actualizar el atributo personalizado en Cognito (si es necesario)
    if (status !== "pending" && planValue !== currentPlan) {
      const updateCommand = new AdminUpdateUserAttributesCommand({
        UserPoolId: "us-east-2_EVU1jxAq4",
        Username: userId,
        UserAttributes: [
          {
            Name: "custom:plan",
            Value: planValue,
          },
        ],
      });
      console.log("⏩ Enviando actualización de atributo a Cognito...");
      await client.send(updateCommand);
      console.log("✅ Atributo actualizado en Cognito correctamente.");
    } else {
      console.log("🔄 No se actualiza el plan en Cognito.");
    }

    // 11. Guardar o actualizar la suscripción en DynamoDB
    try {
      console.log("⏩ Consultando si existe la suscripción en DynamoDB...");
      // Usamos "id" (con valor de userId) como llave primaria, forzando el modo de autenticación AWS_IAM
      const existingSubscription =
        await clientSchema.models.UserSubscription.get({ id: userId });
      console.log("✅ Resultado de get en DynamoDB:", existingSubscription);

      if (existingSubscription.data) {
        console.log(
          "⏩ Se encontró suscripción existente. Procediendo a actualizar..."
        );
        const updateData = {
          id: userId,
          subscriptionId,
          planName,
          nextPaymentDate: nextPaymentDate
            ? new Date(nextPaymentDate).toISOString()
            : null,
        };
        console.log("⏩ Datos para actualizar en DynamoDB:", updateData);
        await clientSchema.models.UserSubscription.update(updateData);
        console.log("✅ Suscripción actualizada en DynamoDB");
      } else {
        console.log(
          "⏩ No se encontró suscripción. Procediendo a crear una nueva..."
        );
        const createData = {
          id: userId, // Se usa "id" con el valor de userId
          userId, // Puedes conservar este campo adicional si lo necesitas
          subscriptionId,
          planName,
          nextPaymentDate: nextPaymentDate
            ? new Date(nextPaymentDate).toISOString()
            : null,
        };
        console.log("⏩ Datos para crear en DynamoDB:", createData);
        await clientSchema.models.UserSubscription.create(createData);
        console.log("✅ Nueva suscripción guardada en DynamoDB");
      }
    } catch (dynamoError) {
      console.error("❌ Error al guardar en DynamoDB:", dynamoError);
      throw dynamoError;
    }

    // 12. Retornar una respuesta exitosa
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
