import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource'
import { storage } from './storage/resource'
import { createSubscription } from './functions/createSubscription/resource'
import { webHookPlan } from './functions/webHookPlan/resource'
import { planScheduler } from './functions/planScheduler/resource'
import { checkStoreName } from './functions/checkStoreName/resource'
import { checkStoreDomain } from './functions/checkStoreDomain/resource'
import { postConfirmation } from './auth/post-confirmation/resource'
import { apiKeyManager } from './functions/LambdaEncryptKeys/resource'
import { storeImages } from './functions/storeImages/resource'
import {
  data,
  generateHaikuFunction,
  generateProductDescriptionFunction,
  generatePriceSuggestionFunction,
} from './data/resource'
import { Stack } from 'aws-cdk-lib'
import { AuthorizationType, Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { Policy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam'

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
  checkStoreName,
  postConfirmation,
  generateHaikuFunction,
  checkStoreDomain,
  apiKeyManager,
  generateProductDescriptionFunction,
  generatePriceSuggestionFunction,
  storeImages,
})

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
)

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
)

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
)

backend.postConfirmation.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['ses:SendEmail', 'ses:SendRawEmail'],
    resources: ['*'],
  })
)

backend.storeImages.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['s3:ListBucket', 's3:GetObject', 's3:PutObject', 's3:DeleteObject'],
    resources: [
      backend.storage.resources.bucket.bucketArn,
      `${backend.storage.resources.bucket.bucketArn}/*`,
    ],
  })
)

const apiStack = backend.createStack('api-stack')

/**
 *
 * API para Suscripciones
 *
 */
const subscriptionApi = new RestApi(apiStack, 'SubscriptionApi', {
  restApiName: 'SubscriptionApi',
  deploy: true,
  deployOptions: { stageName: 'dev' },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS, // Se debe ajustar en produccion para solicitar autorizacion
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
})

const createSubscriptionIntegration = new LambdaIntegration(
  backend.createSubscription.resources.lambda
)

const subscribeResource = subscriptionApi.root.addResource('subscribe', {
  defaultMethodOptions: { authorizationType: AuthorizationType.NONE },
})

subscribeResource.addMethod('POST', createSubscriptionIntegration)

/**
 *
 * API para Webhook de Planes
 *
 */
const webHookApi = new RestApi(apiStack, 'WebHookApi', {
  restApiName: 'WebHookApi',
  deploy: true,
  deployOptions: { stageName: 'dev' },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
})

const webHookPlanIntegration = new LambdaIntegration(backend.webHookPlan.resources.lambda)

const webhookResource = webHookApi.root.addResource('webhook', {
  defaultMethodOptions: { authorizationType: AuthorizationType.NONE },
})

webhookResource.addMethod('POST', webHookPlanIntegration)

/**
 *
 * API para Validar Nombre de Tienda
 *
 */
const checkStoreNameApi = new RestApi(apiStack, 'CheckStoreNameApi', {
  restApiName: 'CheckStoreNameApi',
  deploy: true,
  deployOptions: { stageName: 'dev' },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
})
const checkStoreNameIntegration = new LambdaIntegration(backend.checkStoreName.resources.lambda)

const checkStoreNameResource = checkStoreNameApi.root.addResource('check-store-name', {
  defaultMethodOptions: { authorizationType: AuthorizationType.NONE },
})

checkStoreNameResource.addMethod('GET', checkStoreNameIntegration)

/**
 *
 * API para Validar Disponibilidad de Dominio
 *
 */
const checkStoreDomainApi = new RestApi(apiStack, 'CheckStoreDomainApi', {
  restApiName: 'CheckStoreDomain',
  deploy: true,
  deployOptions: { stageName: 'dev' },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
})
const checkStoreDomainIntegration = new LambdaIntegration(backend.checkStoreDomain.resources.lambda)

const checkStoreDomainResource = checkStoreDomainApi.root.addResource('check-store-domain', {
  defaultMethodOptions: { authorizationType: AuthorizationType.NONE },
})

checkStoreDomainResource.addMethod('GET', checkStoreDomainIntegration)

/**
 *
 * API para Gestión de Claves API
 *
 */
const apiKeyManagerApi = new RestApi(apiStack, 'ApiKeyManagerApi', {
  restApiName: 'ApiKeyManagerApi',
  deploy: true,
  deployOptions: { stageName: 'dev' },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
})

const apiKeyManagerIntegration = new LambdaIntegration(backend.apiKeyManager.resources.lambda)

const apiKeyManagerResource = apiKeyManagerApi.root.addResource('api-keys')
apiKeyManagerResource.addMethod('POST', apiKeyManagerIntegration)

/**
 *
 * API para Almacenar Imágenes
 *
 */

const storeImagesApi = new RestApi(apiStack, 'StoreImagesApi', {
  restApiName: 'StoreImagesApi',
  deploy: true,
  deployOptions: { stageName: 'dev' },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
})
const storeImagesIntegration = new LambdaIntegration(backend.storeImages.resources.lambda)
const storeImagesResource = storeImagesApi.root.addResource('store-images')

storeImagesResource.addMethod('POST', storeImagesIntegration)

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
        `${subscriptionApi.arnForExecuteApi('*', '/subscribe', 'dev')}`,
        `${webHookApi.arnForExecuteApi('*', '/webhook', 'dev')}`,
        `${checkStoreNameApi.arnForExecuteApi('*', '/check-store-name', 'dev')}`,
        `${checkStoreDomainApi.arnForExecuteApi('*', '/check-store-domain', 'dev')}`,
        `${apiKeyManagerApi.arnForExecuteApi('*', '/api-keys', 'dev')}`,
        `${storeImagesApi.arnForExecuteApi('*', '/store-images', 'dev')}`,
      ],
    }),
  ],
})

// Adjuntar la política a los roles autenticados y no autenticados
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(apiRestPolicy)
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(apiRestPolicy)

/**
 *
 * Salidas del Backend
 *
 */
backend.addOutput({
  custom: {
    APIs: {
      SubscriptionApi: {
        endpoint: subscriptionApi.url,
        region: Stack.of(subscriptionApi).region,
        apiName: subscriptionApi.restApiName,
      },
      WebHookApi: {
        endpoint: webHookApi.url,
        region: Stack.of(webHookApi).region,
        apiName: webHookApi.restApiName,
      },
      CheckStoreNameApi: {
        endpoint: checkStoreNameApi.url,
        region: Stack.of(checkStoreNameApi).region,
        apiName: checkStoreNameApi.restApiName,
      },
      CheckStoreDomainApi: {
        endpoint: checkStoreDomainApi.url,
        region: Stack.of(checkStoreDomainApi).region,
        apiName: checkStoreDomainApi.restApiName,
      },
      ApiKeyManagerApi: {
        endpoint: apiKeyManagerApi.url,
        region: Stack.of(apiKeyManagerApi).region,
        apiName: apiKeyManagerApi.restApiName,
      },
      StoreImagesApi: {
        endpoint: storeImagesApi.url,
        region: Stack.of(storeImagesApi).region,
        apiName: storeImagesApi.restApiName,
      },
    },
  },
})
