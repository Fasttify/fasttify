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

import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import outputs from '@/amplify_outputs.json';
import type { TemplateType } from '@fasttify/theme-studio';
import type { AppliedChangePayload } from '../../domain/entities/dev-session.entity';
import { logger } from '@/liquid-forge';
import { fullSchemaCookiesClient } from '@/utils/client/AmplifyUtils';

/**
 * Servicio: WebSocket Broadcast
 * Gestiona el envío de mensajes a conexiones WebSocket usando API Gateway Management API
 */
export class WebSocketBroadcastService {
  private readonly managementApiClient: ApiGatewayManagementApiClient | null;

  constructor() {
    const managementEndpoint = outputs.custom?.APIs?.WebSocketDevServerApi?.managementEndpoint;
    if (!managementEndpoint) {
      logger.warn(
        'WebSocket management endpoint not found. WebSocket broadcast will be disabled.',
        'WebSocketBroadcastService'
      );
      this.managementApiClient = null;
      return;
    }

    this.managementApiClient = new ApiGatewayManagementApiClient({
      endpoint: managementEndpoint,
    });
  }

  /**
   * Envía un mensaje a todas las conexiones WebSocket de un storeId:templateType
   */
  async broadcastMessage(storeId: string, templateType: TemplateType, message: string): Promise<void> {
    if (!this.managementApiClient) {
      logger.warn('WebSocket broadcast service is not available', 'WebSocketBroadcastService');
      return;
    }

    const managementApiClient = this.managementApiClient;

    try {
      // Obtener todas las conexiones activas desde DynamoDB
      const storeIdTemplateType = `${storeId}#${templateType}`;
      const { data: connections } =
        await fullSchemaCookiesClient.models.WebSocketConnection.listWebSocketConnectionByStoreIdTemplateType({
          storeIdTemplateType,
        });

      if (!connections || connections.length === 0) {
        return;
      }

      // Enviar mensaje a todas las conexiones
      const promises = connections.map(async (connection) => {
        if (!connection.connectionId) {
          return;
        }

        try {
          await managementApiClient.send(
            new PostToConnectionCommand({
              ConnectionId: connection.connectionId,
              Data: new TextEncoder().encode(message),
            })
          );
        } catch (error) {
          // Si la conexión ya no existe (GoneException), eliminarla de DynamoDB
          if (error instanceof Error && (error.name === 'GoneException' || error.name === '410')) {
            try {
              await fullSchemaCookiesClient.models.WebSocketConnection.delete({
                connectionId: connection.connectionId,
              });
            } catch (deleteError) {
              logger.error(
                `Error deleting dead connection ${connection.connectionId}`,
                deleteError,
                'WebSocketBroadcastService'
              );
            }
            return;
          }
          logger.error(
            `Error sending message to connection ${connection.connectionId}`,
            error,
            'WebSocketBroadcastService'
          );
        }
      });

      await Promise.allSettled(promises);
    } catch (error) {
      logger.error('Error broadcasting WebSocket message', error, 'WebSocketBroadcastService');
    }
  }

  /**
   * Envía un cambio aplicado a todas las conexiones WebSocket
   */
  async broadcastChangeApplied(
    storeId: string,
    templateType: TemplateType,
    change: AppliedChangePayload
  ): Promise<void> {
    const message = JSON.stringify({
      type: 'CHANGE_APPLIED',
      payload: change,
    });

    await this.broadcastMessage(storeId, templateType, message);
  }

  /**
   * Envía un error de renderizado a todas las conexiones WebSocket
   */
  async broadcastRenderError(
    storeId: string,
    templateType: TemplateType,
    error: string,
    sectionId: string
  ): Promise<void> {
    const message = JSON.stringify({
      type: 'RENDER_ERROR',
      payload: {
        error,
        sectionId,
      },
    });

    await this.broadcastMessage(storeId, templateType, message);
  }

  /**
   * Envía un template cargado a todas las conexiones WebSocket
   */
  async broadcastTemplateLoaded(storeId: string, templateType: TemplateType, template: unknown): Promise<void> {
    const message = JSON.stringify({
      type: 'TEMPLATE_LOADED',
      payload: {
        template,
      },
    });

    await this.broadcastMessage(storeId, templateType, message);
  }
}

export const websocketBroadcastService = new WebSocketBroadcastService();
