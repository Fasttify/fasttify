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

import type { Client } from 'aws-amplify/data';
import type { Schema } from '../../../../data/resource';
import type { IConnectionRepository } from '../../domain/ports/connection-repository.port';
import type { CreateConnectionParams, WebSocketConnection } from '../../domain/entities/websocket-connection.entity';

export class AmplifyConnectionRepositoryAdapter implements IConnectionRepository {
  constructor(private readonly client: Client<Schema>) {}

  async save(params: CreateConnectionParams): Promise<void> {
    const storeIdTemplateType = `${params.storeId}#${params.templateType}`;
    const ttl = Math.floor(Date.now() / 1000) + 2 * 60 * 60; // 2 horas
    const connectedAt = new Date().toISOString();

    await this.client.models.WebSocketConnection.create({
      connectionId: params.connectionId,
      storeId: params.storeId,
      templateType: params.templateType,
      connectedAt,
      storeIdTemplateType,
      ttl,
    });
  }

  async delete(connectionId: string): Promise<void> {
    await this.client.models.WebSocketConnection.delete({
      connectionId,
    });
  }

  async findByStoreAndTemplate(storeId: string, templateType: string): Promise<WebSocketConnection[]> {
    const storeIdTemplateType = `${storeId}#${templateType}`;

    const { data: connections } =
      await this.client.models.WebSocketConnection.listWebSocketConnectionByStoreIdTemplateType({
        storeIdTemplateType,
      });

    if (!connections) {
      return [];
    }

    return connections.map((conn) => ({
      connectionId: conn.connectionId,
      storeId: conn.storeId,
      templateType: conn.templateType,
      connectedAt: conn.connectedAt,
      storeIdTemplateType: conn.storeIdTemplateType,
      ttl: conn.ttl ?? undefined,
    }));
  }

  async findById(connectionId: string): Promise<WebSocketConnection | null> {
    const { data: connection } = await this.client.models.WebSocketConnection.get({
      connectionId,
    });

    if (!connection) {
      return null;
    }

    return {
      connectionId: connection.connectionId,
      storeId: connection.storeId,
      templateType: connection.templateType,
      connectedAt: connection.connectedAt,
      storeIdTemplateType: connection.storeIdTemplateType,
      ttl: connection.ttl ?? undefined,
    };
  }
}
