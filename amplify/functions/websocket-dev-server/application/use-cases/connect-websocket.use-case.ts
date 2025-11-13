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

import type { IConnectionRepository } from '../../domain/ports/connection-repository.port';
import type { IMessageSender } from '../../domain/ports/message-sender.port';

export interface ConnectWebSocketParams {
  connectionId: string;
  storeId: string;
  templateType: string;
}

export class ConnectWebSocketUseCase {
  constructor(
    private readonly connectionRepository: IConnectionRepository,
    private readonly messageSender: IMessageSender
  ) {}

  async execute(params: ConnectWebSocketParams): Promise<void> {
    const { connectionId, storeId, templateType } = params;

    // Guardar conexión
    await this.connectionRepository.save({
      connectionId,
      storeId,
      templateType,
    });

    // Enviar mensaje de conexión establecida
    const message = JSON.stringify({
      type: 'CONNECTED',
    });

    await this.messageSender.sendToConnection(connectionId, message);
  }
}
