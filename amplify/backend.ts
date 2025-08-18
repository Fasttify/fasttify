import { defineBackend } from '@aws-amplify/backend';
import { CfnOutput, Stack } from 'aws-cdk-lib';
import { AuthorizationType, Cors, LambdaIntegration, MethodLoggingLevel, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
//import * as kms from 'aws-cdk-lib/aws-kms';
import { postConfirmation } from './auth/post-confirmation/resource';
import { auth } from './auth/resource';
import {
  data,
  generateHaikuFunction,
  generatePriceSuggestionFunction,
  generateProductDescriptionFunction,
} from './data/resource';
import { checkStoreDomain } from './functions/checkStoreDomain/resource';
import { createSubscription } from './functions/createSubscription/resource';
import { managePaymentKeys } from './functions/managePaymentKeys/resource';
import { planScheduler } from './functions/planScheduler/resource';
import { storeImages } from './functions/storeImages/resource';
import { webHookPlan } from './functions/webHookPlan/resource';
import { storage } from './storage/resource';

/**
 * Detección simple de entorno
 */
const isProduction = process.env.APP_ENV === 'production';

const stageName = isProduction ? 'prod' : 'dev';

/**
 * Configuración de CORS según entorno
 */
const corsConfig = isProduction
  ? {
      allowOrigins: ['https://fasttify.com', 'https://www.fasttify.com'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
      allowCredentials: true,
    }
  : {
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: Cors.ALL_METHODS,
      allowHeaders: Cors.DEFAULT_HEADERS,
      allowCredentials: false,
    };

/**
 * Configuración base de deployment
 */
const deployConfig = {
  stageName,
  ...(isProduction && {
    throttle: {
      rateLimit: 200,
      burstLimit: 400,
    },
    metricsEnabled: true,
    loggingLevel: MethodLoggingLevel.INFO,
  }),
};

console.log(`🚀 Configurando backend para: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
console.log(`📋 Stage: ${stageName}`);

/**
 * Definición del backend con sus respectivos recursos.
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  createSubscription,
  webHookPlan,
  planScheduler,
  postConfirmation,
  generateHaikuFunction,
  checkStoreDomain,
  generateProductDescriptionFunction,
  generatePriceSuggestionFunction,
  storeImages,
  managePaymentKeys,
});

backend.generateHaikuFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      'bedrock:InvokeModel',
      'bedrock:InvokeModelWithResponseStream',
      'bedrock:CreateInferenceProfile',
      'bedrock:GetInferenceProfile',
      'bedrock:ListInferenceProfiles',
    ],
    resources: [
      'arn:aws:bedrock:*::foundation-model/*',
      'arn:aws:bedrock:*:*:inference-profile/*',
      'arn:aws:bedrock:*:*:application-inference-profile/*',
    ],
  })
);

backend.generateProductDescriptionFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      'bedrock:InvokeModel',
      'bedrock:InvokeModelWithResponseStream',
      'bedrock:CreateInferenceProfile',
      'bedrock:GetInferenceProfile',
      'bedrock:ListInferenceProfiles',
    ],
    resources: [
      'arn:aws:bedrock:*::foundation-model/*',
      'arn:aws:bedrock:*:*:inference-profile/*',
      'arn:aws:bedrock:*:*:application-inference-profile/*',
    ],
  })
);

backend.generatePriceSuggestionFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      'bedrock:InvokeModel',
      'bedrock:InvokeModelWithResponseStream',
      'bedrock:CreateInferenceProfile',
      'bedrock:GetInferenceProfile',
      'bedrock:ListInferenceProfiles',
    ],
    resources: [
      'arn:aws:bedrock:*::foundation-model/*',
      'arn:aws:bedrock:*:*:inference-profile/*',
      'arn:aws:bedrock:*:*:application-inference-profile/*',
    ],
  })
);

// Define la clave KMS para la encriptación de las claves de pago
/*const paymentKeysKmsKey = new kms.Key(backend.stack, 'PaymentKeysKmsKey', {
  description: 'KMS key for encrypting payment gateway keys',
  enableKeyRotation: true, // Habilitar la rotación de claves para mayor seguridad
  alias: `alias/FasttifyPaymentKeys-${stageName}`, // Alias amigable para referenciar la clave
});

// Otorga permisos a la función Lambda para usar la clave KMS
backend.managePaymentKeys.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['kms:Encrypt', 'kms:Decrypt', 'kms:GenerateDataKey'], // Añadido GenerateDataKey para ciertas operaciones
    resources: [paymentKeysKmsKey.keyArn], // Apunta a la nueva clave KMS
  })
);

// Exporta el ARN de la clave KMS como una salida de CloudFormation
new CfnOutput(backend.stack, 'PaymentKeysKmsKeyArn', {
  value: paymentKeysKmsKey.keyArn,
  description: 'ARN of the KMS key for encrypting payment gateway keys',
});*/

backend.postConfirmation.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['ses:SendEmail', 'ses:SendRawEmail'],
    resources: ['*'],
  })
);

backend.storeImages.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['s3:ListBucket', 's3:GetObject', 's3:PutObject', 's3:DeleteObject'],
    resources: [backend.storage.resources.bucket.bucketArn, `${backend.storage.resources.bucket.bucketArn}/*`],
  })
);

const apiStack = backend.createStack('api-stack');

/**
 *
 * API para Suscripciones
 *
 */
const subscriptionApi = new RestApi(apiStack, 'SubscriptionApi', {
  restApiName: `SubscriptionApi-${stageName}`,
  deploy: true,
  deployOptions: deployConfig,
  defaultCorsPreflightOptions: corsConfig,
});

const createSubscriptionIntegration = new LambdaIntegration(backend.createSubscription.resources.lambda);

const subscribeResource = subscriptionApi.root.addResource('subscribe', {
  defaultMethodOptions: { authorizationType: AuthorizationType.NONE },
});

subscribeResource.addMethod('POST', createSubscriptionIntegration);

/**
 *
 * API para Webhook de Planes
 *
 */
const webHookApi = new RestApi(apiStack, 'WebHookApi', {
  restApiName: `WebHookApi-${stageName}`,
  deploy: true,
  deployOptions: deployConfig,
  defaultCorsPreflightOptions: corsConfig,
});

const webHookPlanIntegration = new LambdaIntegration(backend.webHookPlan.resources.lambda);

const webhookResource = webHookApi.root.addResource('webhook', {
  defaultMethodOptions: { authorizationType: AuthorizationType.NONE },
});

webhookResource.addMethod('POST', webHookPlanIntegration);

/**
 *
 * API para Validar Disponibilidad de Dominio
 *
 */
const checkStoreDomainApi = new RestApi(apiStack, 'CheckStoreDomainApi', {
  restApiName: `CheckStoreDomainApi-${stageName}`,
  deploy: true,
  deployOptions: deployConfig,
  defaultCorsPreflightOptions: corsConfig,
});
const checkStoreDomainIntegration = new LambdaIntegration(backend.checkStoreDomain.resources.lambda);

const checkStoreDomainResource = checkStoreDomainApi.root.addResource('check-store-domain', {
  defaultMethodOptions: { authorizationType: AuthorizationType.NONE },
});

checkStoreDomainResource.addMethod('GET', checkStoreDomainIntegration);

/**
 *
 * API para Almacenar Imágenes
 *
 */

const storeImagesApi = new RestApi(apiStack, 'StoreImagesApi', {
  restApiName: `StoreImagesApi-${stageName}`,
  deploy: true,
  deployOptions: deployConfig,
  defaultCorsPreflightOptions: corsConfig,
});
const storeImagesIntegration = new LambdaIntegration(backend.storeImages.resources.lambda);
const storeImagesResource = storeImagesApi.root.addResource('store-images');

storeImagesResource.addMethod('POST', storeImagesIntegration);

/**
 *
 * Política de IAM para Invocar las APIs
 *
 */
const apiRestPolicy = new Policy(apiStack, 'RestApiPolicy', {
  statements: [
    new PolicyStatement({
      actions: ['execute-api:Invoke'],
      resources: [
        `${subscriptionApi.arnForExecuteApi('*', '/subscribe', stageName)}`,
        `${webHookApi.arnForExecuteApi('*', '/webhook', stageName)}`,
        `${checkStoreDomainApi.arnForExecuteApi('*', '/check-store-domain', stageName)}`,
        `${storeImagesApi.arnForExecuteApi('*', '/store-images', stageName)}`,
      ],
    }),
  ],
});

// Adjuntar la política a los roles autenticados y no autenticados
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(apiRestPolicy);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(apiRestPolicy);

/**
 *
 * Salidas del Backend
 *
 */
backend.addOutput({
  custom: {
    Environment: {
      stage: stageName,
      isProduction,
    },
    APIs: {
      SubscriptionApi: {
        endpoint: subscriptionApi.url,
        region: Stack.of(subscriptionApi).region,
        apiName: subscriptionApi.restApiName,
        stage: stageName,
      },
      WebHookApi: {
        endpoint: webHookApi.url,
        region: Stack.of(webHookApi).region,
        apiName: webHookApi.restApiName,
        stage: stageName,
      },
      CheckStoreDomainApi: {
        endpoint: checkStoreDomainApi.url,
        region: Stack.of(checkStoreDomainApi).region,
        apiName: checkStoreDomainApi.restApiName,
        stage: stageName,
      },

      StoreImagesApi: {
        endpoint: storeImagesApi.url,
        region: Stack.of(storeImagesApi).region,
        apiName: storeImagesApi.restApiName,
        stage: stageName,
      },
    },
  },
});
