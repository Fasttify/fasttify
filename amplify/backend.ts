import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { createSubscription } from "./functions/createSubscription/resource";
import { webHookPlan } from "./functions/webHookPlan/resource";
import { Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  createSubscription,
  webHookPlan,
});

const apiStack = backend.createStack("api-stack");

const myRestApi = new RestApi(apiStack, "RestApi", {
  restApiName: "SubscriptionApi",
  deploy: true,
  deployOptions: {
    stageName: "dev",
  },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS, // Permitir todos los orígenes (ajustar en producción)
    allowMethods: Cors.ALL_METHODS, // Permitir todos los métodos HTTP
    allowHeaders: Cors.DEFAULT_HEADERS, // Permitir headers por defecto
  },
});

// Integrar la función Lambda createSubscription con la API
const createSubscriptionIntegration = new LambdaIntegration(
  backend.createSubscription.resources.lambda
);

// Crear una ruta para la suscripción
const subscriptionPath = myRestApi.root.addResource("subscribe", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.NONE, // Sin autenticación (ajustar en producción)
  },
});

// Agregar el método POST para la suscripción
subscriptionPath.addMethod("POST", createSubscriptionIntegration);

// Integrar la función Lambda webHookPlan con la API
const webHookPlanIntegration = new LambdaIntegration(
  backend.webHookPlan.resources.lambda
);

// Crear una ruta para el webhook de Mercado Pago
const webhookPath = myRestApi.root.addResource("webhook", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.NONE, // Sin autenticación (ajustar en producción)
  },
});



// Agregar el método POST para el webhook
webhookPath.addMethod("POST", webHookPlanIntegration);

// Crear una política de IAM para permitir invocar la API
const apiRestPolicy = new Policy(apiStack, "RestApiPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        `${myRestApi.arnForExecuteApi("*", "/subscribe", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/webhook", "dev")}`,
      ],
    }),
  ],
});

// Adjuntar la política a los roles de IAM
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);

// Agregar salidas a la configuración
backend.addOutput({
  custom: {
    API: {
      [myRestApi.restApiName]: {
        endpoint: myRestApi.url,
        region: Stack.of(myRestApi).region,
        apiName: myRestApi.restApiName,
      },
    },
  },
});
