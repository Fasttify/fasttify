import { defineBackend } from '@aws-amplify/backend';
import { Stack, Duration } from 'aws-cdk-lib';
import { AuthorizationType, Cors, LambdaIntegration, MethodLoggingLevel, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
//import * as kms from 'aws-cdk-lib/aws-kms';
import { postConfirmation } from './auth/post-confirmation/resource';
import { auth } from './auth/resource';
import {
  data,
  generateHaikuFunction,
  generatePriceSuggestionFunction,
  generateProductDescriptionFunction,
} from './data/resource';
import { bulkEmailAPI, bulkEmailProcessor } from './functions/bulk-email/resource';
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
  bulkEmailAPI,
  bulkEmailProcessor,
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
const { cfnResources } = backend.data.resources;
cfnResources.amplifyDynamoDbTables['Cart'].timeToLiveAttribute = {
  attributeName: 'ttl',
  enabled: true,
};

cfnResources.amplifyDynamoDbTables['CheckoutSession'].timeToLiveAttribute = {
  attributeName: 'ttl',
  enabled: true,
};

// Configuración de colas SQS para email masivo
const emailQueue = new Queue(backend.stack, 'EmailQueue', {
  queueName: `email-queue-${stageName}`,
  visibilityTimeout: Duration.minutes(15), // Tiempo para procesar emails
  receiveMessageWaitTime: Duration.seconds(20), // Long polling
  deadLetterQueue: {
    queue: new Queue(backend.stack, 'EmailDeadLetterQueue', {
      queueName: `email-dlq-${stageName}`,
    }),
    maxReceiveCount: 3, // Máximo 3 reintentos antes de DLQ
  },
});

const highPriorityEmailQueue = new Queue(backend.stack, 'HighPriorityEmailQueue', {
  queueName: `email-high-priority-queue-${stageName}`,
  visibilityTimeout: Duration.minutes(15),
  receiveMessageWaitTime: Duration.seconds(20),
  deadLetterQueue: {
    queue: new Queue(backend.stack, 'HighPriorityEmailDeadLetterQueue', {
      queueName: `email-high-priority-dlq-${stageName}`,
    }),
    maxReceiveCount: 3,
  },
});

// Conectar las colas al procesador de emails
backend.bulkEmailProcessor.resources.lambda.addEventSource(
  new SqsEventSource(emailQueue, {
    batchSize: 10, // Procesar hasta 10 mensajes por vez
    maxBatchingWindow: Duration.seconds(30),
  })
);

backend.bulkEmailProcessor.resources.lambda.addEventSource(
  new SqsEventSource(highPriorityEmailQueue, {
    batchSize: 5, // Menor batch para alta prioridad = más rápido
    maxBatchingWindow: Duration.seconds(10),
  })
);

// Configurar variables de entorno usando node context
backend.bulkEmailAPI.resources.lambda.node.addDependency(emailQueue);
backend.bulkEmailAPI.resources.lambda.node.addDependency(highPriorityEmailQueue);
backend.bulkEmailProcessor.resources.lambda.node.addDependency(emailQueue);
backend.bulkEmailProcessor.resources.lambda.node.addDependency(highPriorityEmailQueue);

// Usar CfnFunction para configurar variables de entorno
const apiLambda = backend.bulkEmailAPI.resources.lambda.node.defaultChild as CfnFunction;
const processorLambda = backend.bulkEmailProcessor.resources.lambda.node.defaultChild as CfnFunction;

if (apiLambda) {
  apiLambda.addPropertyOverride('Environment.Variables.EMAIL_QUEUE_URL', emailQueue.queueUrl);
  apiLambda.addPropertyOverride('Environment.Variables.HIGH_PRIORITY_QUEUE_URL', highPriorityEmailQueue.queueUrl);
}

if (processorLambda) {
  processorLambda.addPropertyOverride('Environment.Variables.EMAIL_QUEUE_URL', emailQueue.queueUrl);
  processorLambda.addPropertyOverride('Environment.Variables.HIGH_PRIORITY_QUEUE_URL', highPriorityEmailQueue.queueUrl);
}

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

// Permisos SES para funciones de email masivo
backend.bulkEmailAPI.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['ses:SendEmail', 'ses:SendRawEmail'],
    resources: ['*'],
  })
);

backend.bulkEmailProcessor.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['ses:SendEmail', 'ses:SendRawEmail'],
    resources: ['*'],
  })
);

// Permisos SQS para funciones de email
backend.bulkEmailAPI.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['sqs:SendMessage', 'sqs:GetQueueAttributes'],
    resources: [emailQueue.queueArn, highPriorityEmailQueue.queueArn],
  })
);

backend.bulkEmailProcessor.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes', 'sqs:ChangeMessageVisibility'],
    resources: [emailQueue.queueArn, highPriorityEmailQueue.queueArn],
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
 * API para Email Masivo
 *
 */

const bulkEmailApi = new RestApi(apiStack, 'BulkEmailApi', {
  restApiName: `BulkEmailApi-${stageName}`,
  deploy: true,
  deployOptions: deployConfig,
  defaultCorsPreflightOptions: corsConfig,
});

const bulkEmailIntegration = new LambdaIntegration(backend.bulkEmailAPI.resources.lambda);
const emailResource = bulkEmailApi.root.addResource('email');

emailResource.addResource('send-bulk').addMethod('POST', bulkEmailIntegration);
emailResource.addResource('test-email').addMethod('POST', bulkEmailIntegration);

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
        `${bulkEmailApi.arnForExecuteApi('*', '/email/*', stageName)}`,
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
      BulkEmailApi: {
        endpoint: bulkEmailApi.url,
        region: Stack.of(bulkEmailApi).region,
        apiName: bulkEmailApi.restApiName,
        stage: stageName,
      },
    },
    EmailQueues: {
      emailQueueUrl: emailQueue.queueUrl,
      highPriorityQueueUrl: highPriorityEmailQueue.queueUrl,
    },
  },
});
