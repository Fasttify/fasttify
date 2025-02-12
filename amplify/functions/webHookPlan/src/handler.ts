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
import { env } from "../../../../.amplify/generated/env/hookPlan";
import { type Schema } from "../../../data/resource";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);
Amplify.configure(resourceConfig, libraryOptions);

const client = new CognitoIdentityProviderClient();
const clientSchema = generateClient<Schema>();

// Endpoint para consultar pagos autorizados
const MP_AUTH_PAYMENTS_SEARCH_URL = "https://api.mercadopago.com/v1/payments/";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // 1. Validar la firma del webhook
    const signature =
      event.headers["x-signature"] || event.headers["X-Signature"];
    if (!signature) {
      throw new Error("Firma no proporcionada en el webhook.");
    }
    console.log("✅ Firma recibida:", signature);

    const match = signature.match(/ts=([^,]+),v1=([^,]+)/);
    if (!match) {
      throw new Error("Formato de firma no válido.");
    }
    const [, ts, v1] = match;
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

    // 3. Generar la contraclave y validar
    const expectedSignature = createHmac(
      "sha256",
      env.MERCADO_PAGO_WEBHOOK_SECRET
    )
      .update(signatureTemplate)
      .digest("hex");
    console.log("✅ Firma esperada calculada:", expectedSignature);
    if (v1 !== expectedSignature) {
      throw new Error("Firma del webhook no válida.");
    }
    console.log("✅ Firma del webhook validada correctamente.");

    // 4. Parsear el cuerpo del webhook
    const body = JSON.parse(event.body || "{}");
    console.log("📄 Cuerpo del webhook:", JSON.stringify(body, null, 2));

    // 5. Diferenciar entre eventos según "entity"
    // Procesamos únicamente el evento de tipo "payment" (por ejemplo, payment.created)
    const entity = body.entity;
    if (entity === "preapproval" || entity === "authorized_payment") {
      console.log(
        `ℹ️ Webhook ${entity} recibido. No se actualiza el plan en este evento.`
      );
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Webhook ${entity} recibido, sin actualización de plan.`,
        }),
      };
    }
    if (body.type !== "payment") {
      console.warn("⚠️ Entidad de webhook inesperada:", entity);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Entidad de webhook no procesada." }),
      };
    }
    console.log(
      "✅ Webhook de payment recibido. Se procede a procesar el estado del pago."
    );

    // 6. Responder inmediatamente para confirmar recepción del webhook
    const responseToMP = {
      statusCode: 200,
      body: JSON.stringify({ message: "Webhook procesado correctamente." }),
    };

    // 7. Obtener el id del pago del webhook (del campo body.data.id)
    const paymentId = body.data?.id;
    if (!paymentId) {
      console.warn("⚠️ No se encontró el ID del pago en el webhook.");
      return responseToMP;
    }
    console.log("🔍 Consultando estado del pago para ID:", paymentId);

    // 8. Consultar el estado del pago usando el endpoint de pagos autorizados
    const paymentUrl = `${MP_AUTH_PAYMENTS_SEARCH_URL}${paymentId}`;
    const paymentResponse = await axios.get(paymentUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });
    const paymentData = paymentResponse.data;
    console.log("💡 Datos del pago:", JSON.stringify(paymentData, null, 2));

    const subscriptionIdFromPayment =
      paymentData.metadata?.preapproval_id || paymentData?.external_reference;

    // Validar el estado del pago según la respuesta del endpoint
    const paymentStatus = paymentData.status;
    const paymentStatusDetail = paymentData.status_detail;
    console.log(
      `🛠 Estado del pago: ${paymentStatus}, Detalle: ${paymentStatusDetail}`
    );

    if (
      !(paymentStatus === "approved" && paymentStatusDetail === "accredited")
    ) {
      console.warn(
        "⚠️ El pago no se completó exitosamente. No se actualiza el plan."
      );
      return {
        statusCode: 200,
        body: JSON.stringify({
          message:
            "El pago no se completó correctamente. " +
            `Estado: ${paymentStatus}, Detalle: ${paymentStatusDetail}. El plan no se actualiza.`,
        }),
      };
    }
    console.log(
      "✅ Pago aprobado y acreditado. Se procede con la actualización del plan."
    );

    // 9. Consultar la suscripción en MercadoPago (para obtener datos actualizados)
    const mpSubscriptionUrl = `https://api.mercadopago.com/preapproval/${subscriptionIdFromPayment}`;
    console.log("🔍 Consultando la suscripción en MercadoPago...");
    const subscriptionResponse2 = await axios.get(mpSubscriptionUrl, {
      headers: { Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}` },
    });
    const subscriptionData2 = subscriptionResponse2.data;
    console.log(
      "💡 Datos de la suscripción:",
      JSON.stringify(subscriptionData2, null, 2)
    );

    const {
      subscription_id: subscription_id,
      external_reference: userId,
      reason: newPlanName,
      next_payment_date: nextPaymentDate,
      auto_recurring: { transaction_amount: newAmountFromMP } = {},
    } = subscriptionData2;
    console.log(
      `📝 User ID: ${userId}, Nuevo plan: ${newPlanName}, Próximo pago: ${nextPaymentDate}`
    );
    console.log("💰 Nuevo monto (según MP):", newAmountFromMP);

    // 11. Obtener el plan actual del usuario desde Cognito
    console.log(`🔍 Obteniendo datos del usuario ${userId} desde Cognito...`);
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: "us-east-2_EVU1jxAq4",
      Username: userId,
    });
    const cognitoUserData = await client.send(getUserCommand);
    const currentPlan =
      cognitoUserData.UserAttributes?.find(
        (attr) => attr.Name === "custom:plan"
      )?.Value || "free";
    console.log(`📅 Plan actual del usuario ${userId}: ${currentPlan}`);

    // 12. Consultar la suscripción actual en DynamoDB
    console.log("⏩ Consultando si existe la suscripción en DynamoDB...");
    let existingSubscription;
    try {
      existingSubscription = await clientSchema.models.UserSubscription.get({
        id: userId,
      });
    } catch (err) {
      console.warn(
        "⚠️ No se encontró registro en DynamoDB para el usuario, se procederá a crearlo."
      );
      existingSubscription = { data: null };
    }
    console.log(
      "✅ Resultado de get en DynamoDB:",
      JSON.stringify(existingSubscription, null, 2)
    );

    // 13. Función auxiliar para guardar la suscripción (crear o actualizar)
    const saveSubscription = async (data: any) => {
      const inputData = {
        id: userId,
        subscriptionId: subscription_id,
        pendingPlan: newPlanName,
        pendingStartDate: nextPaymentDate,
        planPrice: newAmountFromMP,
      };
      if (
        existingSubscription &&
        existingSubscription.data &&
        Object.keys(existingSubscription.data).length > 0
      ) {
        console.log("⏩ Actualizando registro existente en DynamoDB...");
        const updateResult = await clientSchema.models.UserSubscription.update(
          inputData
        );
        console.log(
          "🔄 Resultado de update:",
          JSON.stringify(updateResult, null, 2)
        );
      } else {
        console.log("🆕 Creando nuevo registro en DynamoDB...");
        const createResult = await clientSchema.models.UserSubscription.create({
          id: userId,
          userId: userId,
          subscriptionId: subscription_id,
          planName: newPlanName,
          nextPaymentDate: nextPaymentDate,
          planPrice: newAmountFromMP,
        });
        console.log(
          "🔄 Resultado de create:",
          JSON.stringify(createResult, null, 2)
        );
      }
    };

    // 14. Lógica de actualización según reglas (upgrade vs downgrade)

    const currentPlanPrice =
      existingSubscription && existingSubscription.data
        ? existingSubscription.data.planPrice || 0
        : 0;
    // Determinar si es upgrade: si el usuario está en "free" o si el nuevo monto es mayor que el precio actual.
    const isUpgrade =
      currentPlan === "free" || newAmountFromMP > currentPlanPrice;
    console.log(
      "🔍 isUpgrade:",
      isUpgrade,
      "(newAmountFromMP:",
      newAmountFromMP,
      ", currentPlanPrice:",
      currentPlanPrice,
      ")"
    );

    if (isUpgrade) {
      // Upgrade: actualización inmediata, ignorando el tiempo restante.
      await saveSubscription({
        subscriptionId: subscription_id,
        planName: newPlanName,
        nextPaymentDate: nextPaymentDate
          ? new Date(nextPaymentDate).toISOString()
          : null,
        pendingPlan: null,
        pendingStartDate: null,
        planPrice: newAmountFromMP,
      });
      if (newPlanName !== currentPlan) {
        const updateCommand = new AdminUpdateUserAttributesCommand({
          UserPoolId: "us-east-2_EVU1jxAq4",
          Username: userId,
          UserAttributes: [{ Name: "custom:plan", Value: newPlanName }],
        });
        console.log(
          "⏩ Enviando actualización de atributo a Cognito para upgrade..."
        );
        await client.send(updateCommand);
        console.log(
          "✅ Atributo actualizado en Cognito correctamente para upgrade."
        );
      }
      console.log(
        "✅ Plan actualizado a",
        newPlanName,
        "inmediatamente (upgrade)."
      );
    } else {
      // Downgrade: se respeta el tiempo restante.
      if (
        existingSubscription &&
        existingSubscription.data &&
        existingSubscription.data.nextPaymentDate &&
        new Date(existingSubscription.data.nextPaymentDate) > new Date()
      ) {
        const pendingStartDate = existingSubscription.data.nextPaymentDate;
        await saveSubscription({
          subscriptionId: subscription_id,
          pendingPlan: newPlanName,
          pendingStartDate: pendingStartDate,
          planPrice: newAmountFromMP,
        });
        console.log(
          "✅ Se programó el cambio a plan inferior (downgrade) a",
          newPlanName,
          "a partir del",
          pendingStartDate
        );
      } else {
        await saveSubscription({
          subscriptionId: subscription_id,
          planName: newPlanName,
          nextPaymentDate: nextPaymentDate
            ? new Date(nextPaymentDate).toISOString()
            : null,
          pendingPlan: newPlanName,
          pendingStartDate: nextPaymentDate
            ? new Date(nextPaymentDate).toISOString()
            : null,
          planPrice: newAmountFromMP,
        });
        if (newPlanName !== currentPlan) {
          const updateCommand = new AdminUpdateUserAttributesCommand({
            UserPoolId: "us-east-2_EVU1jxAq4",
            Username: userId,
            UserAttributes: [{ Name: "custom:plan", Value: newPlanName }],
          });
          console.log(
            "⏩ Enviando actualización de atributo a Cognito para downgrade..."
          );
          await client.send(updateCommand);
          console.log(
            "✅ Atributo actualizado en Cognito correctamente para downgrade."
          );
        }
        console.log(
          "✅ Plan actualizado a",
          newPlanName,
          "inmediatamente (downgrade sin tiempo restante)."
        );
      }
    }

    // 15. Retornar respuesta exitosa
    const responsePayload = {
      statusCode: 200,
      body: JSON.stringify({ message: "Webhook procesado correctamente" }),
    };
    console.log(
      "✅ Respuesta exitosa:",
      JSON.stringify(responsePayload, null, 2)
    );
    return responsePayload;
  } catch (error: any) {
    console.error("❌ Error en la función Lambda:", error);
    console.error(
      "❌ Mensaje de error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error(
      "❌ Stack trace:",
      error instanceof Error ? error.stack : "No stack available"
    );
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
