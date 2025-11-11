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

import type {
  IDevServer,
  UpdateSectionSettingParams,
  UpdateBlockSettingParams,
  UpdateSubBlockSettingParams,
  ReorderSectionsParams,
  ReorderBlocksParams,
  ReorderSubBlocksParams,
  ChangeAppliedCallback,
  ErrorCallback,
} from '../../domain/ports/dev-server.port';
import type { Template, TemplateType } from '../../domain/entities/template.entity';
import type { AppliedChange } from '../../domain/entities/editor-session.entity';

/**
 * Mensajes del servidor al cliente
 */
type ServerMessage =
  | { type: 'CHANGE_APPLIED'; payload: AppliedChange }
  | { type: 'RENDER_ERROR'; payload: { error: string; sectionId: string } }
  | { type: 'TEMPLATE_LOADED'; payload: { template: Template } }
  | { type: 'CONNECTED' }
  | { type: 'PING' };

/**
 * Mensajes del cliente al servidor
 */
type ClientMessage =
  | { type: 'UPDATE_SECTION_SETTING'; payload: UpdateSectionSettingParams; templateType: TemplateType }
  | { type: 'UPDATE_BLOCK_SETTING'; payload: UpdateBlockSettingParams; templateType: TemplateType }
  | { type: 'UPDATE_SUB_BLOCK_SETTING'; payload: UpdateSubBlockSettingParams; templateType: TemplateType }
  | { type: 'REORDER_SECTIONS'; payload: ReorderSectionsParams; templateType: TemplateType }
  | { type: 'REORDER_BLOCKS'; payload: ReorderBlocksParams; templateType: TemplateType }
  | { type: 'REORDER_SUB_BLOCKS'; payload: ReorderSubBlocksParams; templateType: TemplateType }
  | { type: 'LOAD_TEMPLATE'; payload: { storeId: string; templateType: TemplateType } };

interface TemplateLoadPromise {
  resolve: (template: Template) => void;
  reject: (error: Error) => void;
}

const CONNECTION_TIMEOUT_MS = 10000;
const TEMPLATE_LOAD_TIMEOUT_MS = 15000;
const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;
const PING_INTERVAL_MS = 30000;

const createError = (message: string): Error => new Error(message);

const buildWebSocketUrl = (websocketEndpoint: string, storeId: string, templateType: TemplateType): string => {
  return `${websocketEndpoint}?storeId=${storeId}&templateType=${templateType}`;
};

/**
 * Adaptador: Dev Server (WebSocket)
 * Implementación concreta del cliente WebSocket para comunicación con el Dev Server
 */
export class WebSocketDevServerAdapter implements IDevServer {
  private websocket: WebSocket | null = null;
  private changeAppliedCallback: ChangeAppliedCallback | null = null;
  private errorCallback: ErrorCallback | null = null;
  private websocketEndpoint: string;
  private apiBaseUrl: string;
  private storeId: string | null = null;
  private templateType: TemplateType | null = null;
  private templateLoadPromise: TemplateLoadPromise | null = null;
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isReconnecting: boolean = false;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private connectionState: { hasResolved: boolean } = { hasResolved: false };
  private connectionResolve: (() => void) | null = null;

  constructor(websocketEndpoint: string, apiBaseUrl: string) {
    this.websocketEndpoint = websocketEndpoint;
    this.apiBaseUrl = apiBaseUrl;
  }

  async connect(
    storeId: string,
    onChangeApplied: ChangeAppliedCallback,
    onError: ErrorCallback,
    templateType: TemplateType = 'index'
  ): Promise<void> {
    if (this.isConnected()) {
      return;
    }

    this.cancelReconnect();
    this.stopPing();

    this.changeAppliedCallback = onChangeApplied;
    this.errorCallback = onError;
    this.storeId = storeId;
    this.templateType = templateType;
    this.reconnectAttempts = 0;

    return this.establishConnection(storeId, templateType);
  }

  private establishConnection(storeId: string, templateType: TemplateType): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = buildWebSocketUrl(this.websocketEndpoint, storeId, templateType);
        this.websocket = new WebSocket(wsUrl);
        this.connectionState = { hasResolved: false };
        this.connectionResolve = resolve;

        this.setupEventHandlers(this.connectionState, resolve, reject);
        this.setupConnectionTimeout(this.connectionState, resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupEventHandlers(
    connectionState: { hasResolved: boolean },
    resolve: () => void,
    reject: (error: Error) => void
  ): void {
    if (!this.websocket) return;

    this.websocket.onopen = () => {
      this.startPing();
      // Resolver la conexión cuando el WebSocket se abre
      // El servidor puede enviar CONNECTED, pero no es necesario esperarlo
      if (!connectionState.hasResolved) {
        // Dar un pequeño delay para asegurar que el servidor haya procesado la conexión
        setTimeout(() => {
          this.resolveConnection(connectionState, resolve);
        }, 100);
      }
    };

    this.websocket.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        this.handleServerMessage(message);
      } catch (error) {
        this.handleError(error instanceof Error ? error : createError('Error parsing message'));
      }
    };

    this.websocket.onerror = () => {
      const error = createError('WebSocket connection error');
      if (!connectionState.hasResolved) {
        connectionState.hasResolved = true;
        reject(error);
      } else {
        this.handleError(error);
      }
    };

    this.websocket.onclose = (event) => {
      this.stopPing();

      // Si ya estaba conectado y ahora se cerró, intentar reconectar
      if (connectionState.hasResolved && !this.isReconnecting) {
        this.scheduleReconnect();
        return;
      }

      // Si aún no se resolvió y se cerró con error, rechazar
      if (!connectionState.hasResolved) {
        connectionState.hasResolved = true;
        reject(createError(`WebSocket connection closed: ${event.code} ${event.reason || ''}`));
      }
    };
  }

  private setupConnectionTimeout(
    connectionState: { hasResolved: boolean },
    resolve: () => void,
    reject: (error: Error) => void
  ): void {
    setTimeout(() => {
      if (connectionState.hasResolved) return;

      connectionState.hasResolved = true;
      if (this.isConnected()) {
        resolve();
      } else {
        reject(createError('WebSocket connection timeout'));
      }
    }, CONNECTION_TIMEOUT_MS);
  }

  private resolveConnection(connectionState: { hasResolved: boolean }, resolve: () => void): void {
    if (!connectionState.hasResolved) {
      connectionState.hasResolved = true;
      resolve();
    }
  }

  async disconnect(): Promise<void> {
    this.cancelReconnect();
    this.stopPing();
    this.closeWebSocket();
    this.clearCallbacks();
    this.clearState();
  }

  private closeWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  private clearCallbacks(): void {
    this.changeAppliedCallback = null;
    this.errorCallback = null;
  }

  private clearState(): void {
    this.storeId = null;
    this.templateType = null;
    this.templateLoadPromise = null;
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.connectionState = { hasResolved: false };
    this.connectionResolve = null;
  }

  private scheduleReconnect(): void {
    if (this.isReconnecting || !this.storeId || !this.templateType) {
      return;
    }

    if (this.isConnected()) {
      return;
    }

    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.handleError(createError('Max reconnection attempts reached'));
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.isReconnecting = false;

      if (!this.storeId || !this.templateType || !this.changeAppliedCallback || !this.errorCallback) {
        return;
      }

      if (this.isConnected()) {
        this.reconnectAttempts = 0;
        return;
      }

      this.closeWebSocket();

      this.establishConnection(this.storeId!, this.templateType!)
        .then(() => {
          this.reconnectAttempts = 0;
        })
        .catch((error) => {
          this.handleError(error);
          this.scheduleReconnect();
        });
    }, RECONNECT_DELAY_MS * this.reconnectAttempts);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.isReconnecting = false;
  }

  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage({ type: 'PING' });
      }
    }, PING_INTERVAL_MS);
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private sendMessage(message: { type: 'PING' }): void {
    if (!this.isConnected()) {
      return;
    }

    this.websocket!.send(JSON.stringify(message));
  }

  async loadTemplate(storeId: string, templateType: TemplateType): Promise<Template> {
    // Asegurar que estamos conectados
    if (!this.isConnected()) {
      // Si no estamos conectados, intentar conectar primero
      if (this.storeId && this.changeAppliedCallback && this.errorCallback) {
        await this.connect(this.storeId, this.changeAppliedCallback, this.errorCallback, templateType);
      } else {
        throw createError('WebSocket is not connected and cannot connect');
      }
    }

    this.templateType = templateType;

    // Cargar template directamente desde REST (más confiable que esperar por WebSocket)
    return this.loadTemplateFromRest();
  }

  private ensureConnected(): void {
    if (!this.isConnected()) {
      throw createError('WebSocket is not connected');
    }
  }

  private waitForTemplate(): Promise<Template> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.clearTemplatePromise();
        reject(createError('Timeout loading template'));
      }, TEMPLATE_LOAD_TIMEOUT_MS);

      this.templateLoadPromise = {
        resolve: (template: Template) => {
          clearTimeout(timeout);
          this.clearTemplatePromise();
          resolve(template);
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          this.clearTemplatePromise();
          reject(error);
        },
      };

      // Cargar template desde el endpoint REST
      // El servidor WebSocket puede enviar TEMPLATE_LOADED, pero cargamos desde REST como fallback
      if (this.storeId && this.templateType) {
        // Cargar desde REST (método principal)
        this.loadTemplateFromRest()
          .then((template) => {
            if (this.templateLoadPromise) {
              this.templateLoadPromise.resolve(template);
            }
          })
          .catch((error) => {
            // Si falla REST, rechazar la promesa
            if (this.templateLoadPromise) {
              this.templateLoadPromise.reject(
                error instanceof Error ? error : createError('Failed to load template from REST')
              );
            }
          });
      } else {
        reject(createError('StoreId or templateType not set'));
      }
    });
  }

  private async loadTemplateFromRest(): Promise<Template> {
    if (!this.storeId || !this.templateType) {
      throw createError('StoreId or templateType not set');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/stores/${this.storeId}/themes/templates/${this.templateType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para autenticación
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw createError(`Failed to load template: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      // Validar que el template tenga el formato correcto
      if (!data || typeof data !== 'object') {
        throw createError('Invalid template format: expected an object');
      }

      // Asegurar que el template tenga las propiedades requeridas
      return {
        type: this.templateType!,
        sections: data.sections || {},
        order: data.order || [],
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw createError(`Failed to load template: ${String(error)}`);
    }
  }

  private clearTemplatePromise(): void {
    this.templateLoadPromise = null;
  }

  async updateSectionSetting(params: UpdateSectionSettingParams): Promise<void> {
    await this.sendUpdateRequest('UPDATE_SECTION_SETTING', params, params.storeId);
  }

  async updateBlockSetting(params: UpdateBlockSettingParams): Promise<void> {
    await this.sendUpdateRequest('UPDATE_BLOCK_SETTING', params, params.storeId);
  }

  async updateSubBlockSetting(params: UpdateSubBlockSettingParams): Promise<void> {
    await this.sendUpdateRequest('UPDATE_SUB_BLOCK_SETTING', params, params.storeId);
  }

  async reorderSections(params: ReorderSectionsParams): Promise<void> {
    await this.sendUpdateRequest('REORDER_SECTIONS', params, params.storeId);
  }

  async reorderBlocks(params: ReorderBlocksParams): Promise<void> {
    await this.sendUpdateRequest('REORDER_BLOCKS', params, params.storeId);
  }

  async reorderSubBlocks(params: ReorderSubBlocksParams): Promise<void> {
    await this.sendUpdateRequest('REORDER_SUB_BLOCKS', params, params.storeId);
  }

  isConnected(): boolean {
    return this.websocket !== null && this.websocket.readyState === WebSocket.OPEN;
  }

  private async sendUpdateRequest(
    type: ClientMessage['type'],
    payload:
      | UpdateSectionSettingParams
      | UpdateBlockSettingParams
      | UpdateSubBlockSettingParams
      | ReorderSectionsParams
      | ReorderBlocksParams
      | ReorderSubBlocksParams,
    storeId: string
  ): Promise<void> {
    this.ensureConnected();
    this.ensureTemplateType();

    try {
      // Por ahora, enviar actualizaciones por REST (el servidor Lambda solo recibe mensajes)
      // En el futuro, esto se puede cambiar para enviar directamente por WebSocket
      const response = await fetch(`${this.apiBaseUrl}/stores/${storeId}/dev/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          payload,
          templateType: this.templateType,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw createError(error.error || 'Failed to update setting');
      }
    } catch (error) {
      this.handleError(error instanceof Error ? error : createError('Failed to send update'));
      throw error;
    }
  }

  private ensureTemplateType(): void {
    if (!this.templateType) {
      throw createError('Template type not set');
    }
  }

  private handleError(error: Error): void {
    if (this.errorCallback) {
      this.errorCallback(error);
    }
  }

  private handleServerMessage(message: ServerMessage): void {
    const handlers: Record<ServerMessage['type'], () => void> = {
      CHANGE_APPLIED: () => this.handleChangeApplied(message as Extract<ServerMessage, { type: 'CHANGE_APPLIED' }>),
      RENDER_ERROR: () => this.handleRenderError(message as Extract<ServerMessage, { type: 'RENDER_ERROR' }>),
      TEMPLATE_LOADED: () => this.handleTemplateLoaded(message as Extract<ServerMessage, { type: 'TEMPLATE_LOADED' }>),
      CONNECTED: () => {
        // Mensaje de confirmación del servidor - la conexión ya está resuelta en onopen
        // Pero si aún no está resuelta, resolverla ahora
        if (this.connectionResolve && !this.connectionState.hasResolved) {
          this.resolveConnection(this.connectionState, this.connectionResolve);
        }
      },
      PING: () => {
        // Mantener conexión viva - no acción necesaria
      },
    };

    handlers[message.type]?.();
  }

  private handleChangeApplied(message: Extract<ServerMessage, { type: 'CHANGE_APPLIED' }>): void {
    if (this.changeAppliedCallback) {
      this.changeAppliedCallback(message.payload);
    }
  }

  private handleRenderError(message: Extract<ServerMessage, { type: 'RENDER_ERROR' }>): void {
    if (this.errorCallback) {
      this.errorCallback(createError(message.payload.error));
    }
  }

  private handleTemplateLoaded(message: Extract<ServerMessage, { type: 'TEMPLATE_LOADED' }>): void {
    if (this.templateLoadPromise) {
      this.templateLoadPromise.resolve(message.payload.template);
    }
  }
}
