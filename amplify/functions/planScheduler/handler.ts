import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "../../../.amplify/generated/env/planScheduler";
import { type Schema } from "../../data/resource";
import type { EventBridgeHandler } from "aws-lambda";

// Configurar Amplify para acceso a datos

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);
Amplify.configure(resourceConfig, libraryOptions);

// Inicializar el cliente para DynamoDB (Amplify Data)
const clientSchema = generateClient<Schema>();

// Inicializar el cliente de Cognito
const cognitoClient = new CognitoIdentityProviderClient();

export const handler: EventBridgeHandler<
  "Scheduled Event",
  null,
  void
> = async (event: any) => {
  console.log(
    "🚀 Lambda ejecutada con evento:",
    JSON.stringify(event, null, 2)
  );

  try {
    // 1. Obtener la fecha actual
    const now = new Date("2025-03-09T22:29:08.000Z");
    console.log("📅 Fecha actual:", now.toISOString());

    // 2. Consultar DynamoDB para obtener las suscripciones pendientes de pasar a free
    console.log("🔍 Consultando suscripciones pendientes...");
    const pendingSubscriptionsResponse =
      await clientSchema.models.UserSubscription.list({
        filter: {
          pendingPlan: { eq: "free" },
          pendingStartDate: { le: now.toISOString() },
        },
      });

    const pendingSubscriptions = pendingSubscriptionsResponse.data || [];
    console.log("📊 Suscripciones encontradas:", pendingSubscriptions.length);

    const allSubscriptionsResponse =
      await clientSchema.models.UserSubscription.list();
    console.log(
      "📋 Todas las suscripciones:",
      JSON.stringify(allSubscriptionsResponse, null, 2)
    );


    // 3. Iterar sobre cada registro pendiente
    for (const subscription of pendingSubscriptions) {
      console.log(
        "➡️ Procesando suscripción:",
        JSON.stringify(subscription, null, 2)
      );
      const userId = subscription.userId;
      if (!userId) {
        console.warn("⚠️ Suscripción sin userId, omitiendo...");
        continue;
      }

      try {
        // 3.1. Actualizar el atributo en Cognito para asignar el plan "free"
        console.log(
          `🔄 Actualizando plan de usuario ${userId} en Cognito a 'free'...`
        );
        const updateCommand = new AdminUpdateUserAttributesCommand({
          UserPoolId: "us-east-2_EVU1jxAq4",
          Username: userId,
          UserAttributes: [{ Name: "custom:plan", Value: "free" }],
        });
        await cognitoClient.send(updateCommand);
        console.log(`✅ Usuario ${userId} actualizado en Cognito.`);
      } catch (cognitoError) {
        console.error(
          `❌ Error actualizando usuario ${userId} en Cognito:`,
          cognitoError
        );
        continue;
      }

      try {
        // 3.2. Actualizar el registro en DynamoDB
        console.log(
          `🔄 Actualizando suscripción en DynamoDB para usuario ${userId}...`
        );
        await clientSchema.models.UserSubscription.update({
          id: userId,
          subscriptionId: subscription.subscriptionId,
          planName: "free",
          nextPaymentDate: null,
          pendingPlan: null,
          pendingStartDate: null,
        });
        console.log(
          `✅ Suscripción de usuario ${userId} actualizada en DynamoDB.`
        );
      } catch (dbError) {
        console.error(
          `❌ Error actualizando suscripción de usuario ${userId} en DynamoDB:`,
          dbError
        );
      }
    }

    console.log(
      "✅ Se han actualizado todas las suscripciones pendientes a free."
    );
  } catch (error) {
    console.error("❌ Error en la Lambda programada:", error);
  }
};
