/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { APIGatewayProxyWebsocketHandlerV2, APIGatewayProxyWebsocketEventV2, Context } from 'aws-lambda';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/websocketDevServer';
import type { Schema } from '../../data/resource';
import { ConnectWebSocketUseCase, DisconnectWebSocketUseCase } from './application/use-cases';
import { AmplifyConnectionRepositoryAdapter, ApiGatewayMessageSenderAdapter } from './infrastructure/adapters';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

const connectionRepository = new AmplifyConnectionRepositoryAdapter(client);
const messageSender = new ApiGatewayMessageSenderAdapter(env.WEBSOCKET_API_ENDPOINT);

const connectWebSocketUseCase = new ConnectWebSocketUseCase(connectionRepository, messageSender);
const disconnectWebSocketUseCase = new DisconnectWebSocketUseCase(connectionRepository);

/**
 * Handler principal para WebSocket API Gateway
 * Maneja las rutas: $connect, $disconnect, $default
 */
export const handler: APIGatewayProxyWebsocketHandlerV2 = async (
  event: APIGatewayProxyWebsocketEventV2,
  context: Context
) => {
  const routeKey = event.requestContext.routeKey;

  try {
    switch (routeKey) {
      case '$connect':
        return await handleConnect(event);
      case '$disconnect':
        return await handleDisconnect(event);
      case '$default':
        return await handleDefault(event);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Unknown route' }),
        };
    }
  } catch (error) {
    console.error('Error handling WebSocket event:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

/**
 * Maneja la conexión de un cliente WebSocket
 */
async function handleConnect(event: APIGatewayProxyWebsocketEventV2) {
  const connectionId = event.requestContext.connectionId;

  // En WebSocket API Gateway v2, los query params están en requestContext
  const queryParams = (event as { queryStringParameters?: Record<string, string> }).queryStringParameters || {};
  const storeId = queryParams.storeId;
  const templateType = queryParams.templateType;

  if (!storeId || !templateType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing storeId or templateType' }),
    };
  }

  try {
    await connectWebSocketUseCase.execute({
      connectionId,
      storeId,
      templateType,
    });

    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error('Error connecting WebSocket:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to connect' }),
    };
  }
}

/**
 * Maneja la desconexión de un cliente WebSocket
 */
async function handleDisconnect(event: APIGatewayProxyWebsocketEventV2) {
  const connectionId = event.requestContext.connectionId;

  try {
    await disconnectWebSocketUseCase.execute({
      connectionId,
    });

    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error('Error disconnecting WebSocket:', error);
    // No fallar la desconexión, solo loggear el error
    return {
      statusCode: 200,
    };
  }
}

/**
 * Maneja mensajes del cliente WebSocket
 */
async function handleDefault(event: APIGatewayProxyWebsocketEventV2) {
  const connectionId = event.requestContext.connectionId;
  const body = event.body;

  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No message body' }),
    };
  }

  try {
    const message = JSON.parse(body);
    console.log(`Message from ${connectionId}:`, message);

    // Por ahora, solo loggear los mensajes
    // En el futuro, se pueden procesar mensajes específicos del cliente

    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error('Error parsing message:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid message format' }),
    };
  }
}
