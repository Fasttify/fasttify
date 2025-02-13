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

const MP_AUTH_PAYMENTS_SEARCH_URL = "https://api.mercadopago.com/v1/payments/";
const MP_AUTHORIZED_PAYMENTS_URL =
  "https://api.mercadopago.com/authorized_payments/";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // 1. Validar la firma del webhook
    const body = JSON.parse(event.body || "{}");
    const signature =
      event.headers["x-signature"] || event.headers["X-Signature"];

    if (!signature) throw new Error("Firma no proporcionada en el webhook.");
    console.log("✅ Firma recibida:", signature);

    const match = signature.match(/ts=([^,]+),v1=([^,]+)/);
    if (!match) throw new Error("Formato de firma no válido.");
    const [, ts, v1] = match;

    // Corrección clave: Obtener data.id de los query parameters
    const dataId = event.queryStringParameters?.["data.id"];
    const requestId =
      event.headers["x-request-id"] || event.headers["X-Request-Id"];

    if (!dataId || !requestId) {
      throw new Error("Faltan parámetros requeridos en la notificación.");
    }

    const signatureTemplate = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const expectedSignature = createHmac(
      "sha256",
      env.MERCADO_PAGO_WEBHOOK_SECRET
    )
      .update(signatureTemplate)
      .digest("hex");

    if (v1 !== expectedSignature)
      throw new Error("Firma del webhook no válida.");
    console.log("✅ Firma validada correctamente");

    // 2. Determinar tipo de evento
    const eventType = body.type;
    console.log("🔍 Tipo de evento recibido:", eventType);

    // Manejar eventos que no son de pago
    if (eventType === "subscription_preapproval") {
      console.log("ℹ️ Evento de creación de suscripción recibido");
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "OK" }),
      };
    }

    // 3. Procesar diferentes tipos de pagos
    let paymentId, paymentUrl;
    if (eventType === "subscription_authorized_payment") {
      paymentId = body.data?.id;
      paymentUrl = `${MP_AUTHORIZED_PAYMENTS_URL}${paymentId}`;
      console.log("🔍 Procesando pago recurrente autorizado");
    } else if (eventType === "payment") {
      paymentId = body.data?.id;
      paymentUrl = `${MP_AUTH_PAYMENTS_SEARCH_URL}${paymentId}`;
      console.log("🔍 Procesando pago estándar");
    } else {
      console.warn("⚠️ Tipo de evento no soportado:", eventType);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "OK" }),
      };
    }

    // 4. Consultar detalles del pago
    const paymentResponse = await axios.get(paymentUrl, {
      headers: {
        Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const paymentData = paymentResponse.data;
    console.log("💡 Datos del pago:", JSON.stringify(paymentData, null, 2));

    // 5. Validar estado del pago
    if (
      !(
        paymentData.status === "approved" &&
        paymentData.status_detail === "accredited"
      )
    ) {
      console.warn("⚠️ Pago no completado exitosamente");
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "OK" }),
      };
    }

    // 6. Obtener información de la suscripción
    const subscriptionId =
      paymentData.metadata?.preapproval_id || paymentData.external_reference;
    const subscriptionResponse = await axios.get(
      `https://api.mercadopago.com/preapproval/${subscriptionId}`,
      { headers: { Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}` } }
    );

    const subscriptionData = subscriptionResponse.data;
    const userId = subscriptionData.external_reference;
    const newPlanName = subscriptionData.reason;
    const newAmountFromMP = subscriptionData.auto_recurring.transaction_amount;
    const nextPaymentDate = subscriptionData.next_payment_date;

    // 7. Obtener usuario de Cognito
    const cognitoUser = await client.send(
      new AdminGetUserCommand({
        UserPoolId: "us-east-2_EVU1jxAq4",
        Username: userId,
      })
    );

    const currentPlan =
      cognitoUser.UserAttributes?.find((attr) => attr.Name === "custom:plan")
        ?.Value || "free";

    // 8. Lógica de actualización de plan
    const existingSubscription = await clientSchema.models.UserSubscription.get(
      { id: userId }
    ).catch(() => ({ data: null }));

    const currentPlanPrice = existingSubscription.data?.planPrice || 0;
    const isUpgrade =
      currentPlan === "free" || newAmountFromMP > currentPlanPrice;

    // Determinar fechas clave
    const nextPaymentDateISO = new Date(nextPaymentDate).toISOString();
    const now = new Date();
    const existingPaymentDate = existingSubscription.data?.nextPaymentDate
      ? new Date(existingSubscription.data.nextPaymentDate)
      : null;

    // Configurar datos para DynamoDB
    const updateData = {
      id: userId,
      subscriptionId: subscriptionId,
      planPrice: newAmountFromMP,
      nextPaymentDate: nextPaymentDateISO,
      lastFourDigits: paymentData.card.last_four_digits,

      planName: isUpgrade
        ? newPlanName
        : existingSubscription.data?.planName || currentPlan,
      pendingPlan:
        !isUpgrade && existingPaymentDate && existingPaymentDate > now
          ? newPlanName
          : null,
      pendingStartDate:
        !isUpgrade && existingPaymentDate && existingPaymentDate > now
          ? existingPaymentDate.toISOString()
          : null,
    };

    // Actualizar DynamoDB
    if (existingSubscription.data) {
      await clientSchema.models.UserSubscription.update(updateData);
    } else {
      await clientSchema.models.UserSubscription.create({
        ...updateData,
        userId: userId,
      });
    }

    // Actualizar Cognito SOLO si es upgrade o no hay tiempo restante
    if (newPlanName !== currentPlan) {
      const shouldUpdateCognito =
        isUpgrade || !existingPaymentDate || existingPaymentDate <= now;

      if (shouldUpdateCognito) {
        await client.send(
          new AdminUpdateUserAttributesCommand({
            UserPoolId: "us-east-2_EVU1jxAq4",
            Username: userId,
            UserAttributes: [{ Name: "custom:plan", Value: newPlanName }],
          })
        );
        console.log(`✅ Plan actualizado en Cognito a ${newPlanName}`);
      } else {
        console.log(
          `⏳ Cambio a ${newPlanName} programado para ${existingPaymentDate}`
        );
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "OK" }),
    };
  } catch (error: any) {
    console.error("❌ Error en la función Lambda:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error procesando el webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
