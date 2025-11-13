/**
 * Configuración de API Gateway WebSocket
 */

import { Stack } from 'aws-cdk-lib';
import { WebSocketApi, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { stageName } from './environment';

export interface WebSocketApiResources {
  webSocketApi: WebSocketApi;
  webSocketStage: WebSocketStage;
}

/**
 * Crea la API Gateway WebSocket para el Dev Server
 */
export function createWebSocketApi(stack: Stack, websocketHandler: any, dataBackend?: any): WebSocketApiResources {
  /**
   * Crear la API WebSocket
   */
  const webSocketApi = new WebSocketApi(stack, 'WebSocketDevServerApi', {
    apiName: `WebSocketDevServerApi-${stageName}`,
    description: 'WebSocket API para el Dev Server del Theme Studio',
    connectRouteOptions: {
      integration: new WebSocketLambdaIntegration('ConnectIntegration', websocketHandler),
    },
    disconnectRouteOptions: {
      integration: new WebSocketLambdaIntegration('DisconnectIntegration', websocketHandler),
    },
    defaultRouteOptions: {
      integration: new WebSocketLambdaIntegration('DefaultIntegration', websocketHandler),
    },
  });

  /**
   * Crear el stage para la API
   */
  const webSocketStage = new WebSocketStage(stack, 'WebSocketDevServerStage', {
    webSocketApi,
    stageName,
    autoDeploy: true,
  });

  /**
   * Dar permisos a la Lambda para gestionar conexiones WebSocket
   */
  websocketHandler.addToRolePolicy(
    new PolicyStatement({
      actions: ['execute-api:ManageConnections'],
      resources: [`arn:aws:execute-api:${stack.region}:${stack.account}:${webSocketApi.apiId}/${stageName}/*`],
    })
  );

  // Permisos para DynamoDB
  if (dataBackend?.resources?.cfnResources?.awsAppsyncApiId) {
    const apiId = dataBackend.resources.cfnResources.awsAppsyncApiId;
    websocketHandler.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:DeleteItem', 'dynamodb:Query'],
        resources: [
          `arn:aws:dynamodb:${stack.region}:${stack.account}:table/WebSocketConnection-${apiId}-*`,
          `arn:aws:dynamodb:${stack.region}:${stack.account}:table/WebSocketConnection-${apiId}-*/index/*`,
        ],
      })
    );
  }

  return {
    webSocketApi,
    webSocketStage,
  };
}
