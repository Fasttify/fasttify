import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { storage } from './storage/resource'
import { createSubscription } from './functions/createSubscription/resource'
import { webHookPlan } from './functions/webHookPlan/resource'
import { cancelPlan } from './functions/cancelPlan/resource'
import { planScheduler } from './functions/planScheduler/resource'
import { planManagement } from './functions/planManagement/resource'
import { checkStoreName } from './functions/checkStoreName/resource'
import { Stack } from 'aws-cdk-lib'
import { AuthorizationType, Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam'

/**
 * Definición del backend con sus respectivos recursos.
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  createSubscription,
  webHookPlan,
  cancelPlan,
  planScheduler,
  planManagement,
  checkStoreName,
})

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
 * API para Cancelar Planes
 *
 */
const cancelPlanApi = new RestApi(apiStack, 'CancelPlanApi', {
  restApiName: 'CancelPlanApi',
  deploy: true,
  deployOptions: { stageName: 'dev' },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
})

const cancelPlanIntegration = new LambdaIntegration(backend.cancelPlan.resources.lambda)

const cancelPlanResource = cancelPlanApi.root.addResource('cancel-plan', {
  defaultMethodOptions: { authorizationType: AuthorizationType.NONE },
})

cancelPlanResource.addMethod('POST', cancelPlanIntegration)

/**
 *
 * API para Gestión de Planes
 *
 */
const planManagementApi = new RestApi(apiStack, 'PlanManagementApi', {
  restApiName: 'PlanManagementApi',
  deploy: true,
  deployOptions: { stageName: 'dev' },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
})

const planManagementIntegration = new LambdaIntegration(backend.planManagement.resources.lambda)

const planManagementResource = planManagementApi.root.addResource('plan-management', {
  defaultMethodOptions: { authorizationType: AuthorizationType.NONE },
})

planManagementResource.addMethod('POST', planManagementIntegration)

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
        `${cancelPlanApi.arnForExecuteApi('*', '/cancel-plan', 'dev')}`,
        `${planManagementApi.arnForExecuteApi('*', '/plan-management', 'dev')}`,
        `${checkStoreNameApi.arnForExecuteApi('*', '/check-store-name', 'dev')}`,
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
      CancelPlanApi: {
        endpoint: cancelPlanApi.url,
        region: Stack.of(cancelPlanApi).region,
        apiName: cancelPlanApi.restApiName,
      },
      PlanManagementApi: {
        endpoint: planManagementApi.url,
        region: Stack.of(planManagementApi).region,
        apiName: planManagementApi.restApiName,
      },
      CheckStoreNameApi: {
        endpoint: checkStoreNameApi.url,
        region: Stack.of(checkStoreNameApi).region,
        apiName: checkStoreNameApi.restApiName,
      },
    },
  },
})
