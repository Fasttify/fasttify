/**
 * Configuración de salidas del backend
 */

import { Stack } from 'aws-cdk-lib';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { WebSocketApi, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { isProduction, stageName } from './environment';

export interface BackendOutputs {
  [key: string]: unknown;
  Environment: {
    stage: string;
    isProduction: boolean;
  };
  APIs: {
    SubscriptionApi: ApiOutput;
    WebHookApi: ApiOutput;
    CheckStoreDomainApi: ApiOutput;
    StoreImagesApi: ApiOutput;
    BulkEmailApi: ApiOutput;
    StoreLimitsApi: ApiOutput;
    WebSocketDevServerApi?: WebSocketApiOutput;
  };
  EmailQueues: {
    emailQueueUrl: string;
    highPriorityQueueUrl: string;
  };
}

interface ApiOutput {
  endpoint: string;
  region: string;
  apiName: string;
  stage: string;
}

interface WebSocketApiOutput {
  endpoint: string;
  managementEndpoint: string;
  region: string;
  apiId: string;
  stage: string;
}

/**
 * Crea la configuración de salidas del backend
 */
export function createBackendOutputs(
  subscriptionApi: RestApi,
  webHookApi: RestApi,
  checkStoreDomainApi: RestApi,
  storeImagesApi: RestApi,
  bulkEmailApi: RestApi,
  storeLimitsApi: RestApi,
  emailQueue: Queue,
  highPriorityEmailQueue: Queue,
  webSocketApi?: WebSocketApi,
  webSocketStage?: WebSocketStage
): BackendOutputs {
  return {
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
      StoreLimitsApi: {
        endpoint: storeLimitsApi.url,
        region: Stack.of(storeLimitsApi).region,
        apiName: storeLimitsApi.restApiName,
        stage: stageName,
      },
      ...(webSocketApi && webSocketStage
        ? {
            WebSocketDevServerApi: {
              endpoint: `wss://${webSocketApi.apiId}.execute-api.${Stack.of(webSocketApi).region}.amazonaws.com/${stageName}`,
              managementEndpoint: `https://${webSocketApi.apiId}.execute-api.${Stack.of(webSocketApi).region}.amazonaws.com/${stageName}`,
              region: Stack.of(webSocketApi).region,
              apiId: webSocketApi.apiId,
              stage: stageName,
            },
          }
        : {}),
    },
    EmailQueues: {
      emailQueueUrl: emailQueue.queueUrl,
      highPriorityQueueUrl: highPriorityEmailQueue.queueUrl,
    },
  };
}
