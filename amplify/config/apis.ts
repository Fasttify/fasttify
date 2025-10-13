/**
 * Configuración de APIs REST
 */

import { Stack } from 'aws-cdk-lib';
import { AuthorizationType, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { corsConfig, deployConfig, isProduction, stageName } from './environment';

export interface ApiResources {
  subscriptionApi: RestApi;
  webHookApi: RestApi;
  checkStoreDomainApi: RestApi;
  storeImagesApi: RestApi;
  bulkEmailApi: RestApi;
  storeLimitsApi: RestApi;
  apiRestPolicy: Policy;
}

/**
 * Crea todas las APIs REST del sistema
 */
export function createRestApis(stack: Stack, backend: any): ApiResources {
  /**
   * API para Suscripciones
   */
  const subscriptionApi = new RestApi(stack, 'SubscriptionApi', {
    restApiName: `SubscriptionApi-${stageName}`,
    deploy: true,
    deployOptions: deployConfig,
    defaultCorsPreflightOptions: corsConfig,
  });

  const createSubscriptionIntegration = new LambdaIntegration(backend.createSubscription.resources.lambda);

  const subscribeResource = subscriptionApi.root.addResource('subscribe', {
    defaultMethodOptions: {
      authorizationType: isProduction ? AuthorizationType.IAM : AuthorizationType.NONE,
    },
  });

  subscribeResource.addMethod('POST', createSubscriptionIntegration);

  /**
   * API para Webhook de Planes
   */
  const webHookApi = new RestApi(stack, 'WebHookApi', {
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
   * API para Validar Disponibilidad de Dominio
   */
  const checkStoreDomainApi = new RestApi(stack, 'CheckStoreDomainApi', {
    restApiName: `CheckStoreDomainApi-${stageName}`,
    deploy: true,
    deployOptions: deployConfig,
    defaultCorsPreflightOptions: corsConfig,
  });

  const checkStoreDomainIntegration = new LambdaIntegration(backend.checkStoreDomain.resources.lambda);

  const checkStoreDomainResource = checkStoreDomainApi.root.addResource('check-store-domain', {
    defaultMethodOptions: {
      authorizationType: isProduction ? AuthorizationType.IAM : AuthorizationType.NONE,
    },
  });

  checkStoreDomainResource.addMethod('GET', checkStoreDomainIntegration);

  /**
   * API para Almacenar Imágenes
   */
  const storeImagesApi = new RestApi(stack, 'StoreImagesApi', {
    restApiName: `StoreImagesApi-${stageName}`,
    deploy: true,
    deployOptions: deployConfig,
    defaultCorsPreflightOptions: corsConfig,
  });

  const storeImagesIntegration = new LambdaIntegration(backend.storeImages.resources.lambda);

  const storeImagesResource = storeImagesApi.root.addResource('store-images', {
    defaultMethodOptions: {
      authorizationType: isProduction ? AuthorizationType.IAM : AuthorizationType.NONE,
    },
  });

  storeImagesResource.addMethod('POST', storeImagesIntegration);

  /**
   * API para Email Masivo
   */
  const bulkEmailApi = new RestApi(stack, 'BulkEmailApi', {
    restApiName: `BulkEmailApi-${stageName}`,
    deploy: true,
    deployOptions: deployConfig,
    defaultCorsPreflightOptions: corsConfig,
  });

  const bulkEmailIntegration = new LambdaIntegration(backend.bulkEmailAPI.resources.lambda);

  const emailResource = bulkEmailApi.root.addResource('email', {
    defaultMethodOptions: {
      authorizationType: isProduction ? AuthorizationType.IAM : AuthorizationType.NONE,
    },
  });

  emailResource.addResource('send-bulk').addMethod('POST', bulkEmailIntegration);
  emailResource.addResource('test-email').addMethod('POST', bulkEmailIntegration);

  /**
   * API para Validar Límites de Tiendas
   */
  const storeLimitsApi = new RestApi(stack, 'StoreLimitsApi', {
    restApiName: `StoreLimitsApi-${stageName}`,
    deploy: true,
    deployOptions: deployConfig,
    defaultCorsPreflightOptions: corsConfig,
  });

  const storeLimitsIntegration = new LambdaIntegration(backend.validateStoreLimits.resources.lambda);

  const storeLimitsResource = storeLimitsApi.root.addResource('validate-limits', {
    defaultMethodOptions: {
      authorizationType: isProduction ? AuthorizationType.IAM : AuthorizationType.NONE,
    },
  });

  storeLimitsResource.addMethod('POST', storeLimitsIntegration);

  /**
   * Política de IAM para Invocar las APIs
   */
  const apiRestPolicy = new Policy(stack, 'RestApiPolicy', {
    statements: [
      new PolicyStatement({
        actions: ['execute-api:Invoke'],
        resources: [
          `${subscriptionApi.arnForExecuteApi('*', '/subscribe', stageName)}`,
          `${webHookApi.arnForExecuteApi('*', '/webhook', stageName)}`,
          `${checkStoreDomainApi.arnForExecuteApi('*', '/check-store-domain', stageName)}`,
          `${storeImagesApi.arnForExecuteApi('*', '/store-images', stageName)}`,
          `${bulkEmailApi.arnForExecuteApi('*', '/email/*', stageName)}`,
          `${storeLimitsApi.arnForExecuteApi('*', '/validate-limits', stageName)}`,
        ],
      }),
    ],
  });

  return {
    subscriptionApi,
    webHookApi,
    checkStoreDomainApi,
    storeImagesApi,
    bulkEmailApi,
    storeLimitsApi,
    apiRestPolicy,
  };
}
