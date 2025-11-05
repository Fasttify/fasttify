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
  ChangeAppliedCallback,
  ErrorCallback,
} from '../../domain/ports/dev-server.port';
import type { Template, TemplateType } from '../../domain/entities/template.entity';
import type { AppliedChange } from '../../domain/entities/editor-session.entity';

/**
 * Mensajes SSE del servidor al cliente
 */
type ServerMessage =
  | { type: 'CHANGE_APPLIED'; payload: AppliedChange }
  | { type: 'RENDER_ERROR'; payload: { error: string; sectionId: string } }
  | { type: 'TEMPLATE_LOADED'; payload: { template: Template } }
  | { type: 'CONNECTED' }
  | { type: 'PING' };

interface TemplateLoadPromise {
  resolve: (template: Template) => void;
  reject: (error: Error) => void;
}

const CONNECTION_TIMEOUT_MS = 10000;
const TEMPLATE_LOAD_TIMEOUT_MS = 15000;
const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;

// Helper: Construir URL del SSE endpoint
const buildSSEUrl = (apiBaseUrl: string, storeId: string, templateType: TemplateType): string => {
  return `${apiBaseUrl}/stores/${storeId}/dev/ws?storeId=${storeId}&templateType=${templateType}`;
};

// Helper: Crear error estándar
const createError = (message: string): Error => new Error(message);

// Helper: Validar conexión SSE
const isConnected = (eventSource: EventSource | null): boolean => {
  return eventSource !== null && eventSource.readyState === EventSource.OPEN;
};

/**
 * Adaptador: Dev Server (SSE)
 * Implementación concreta del cliente SSE para comunicación con el Dev Server
 */
export class DevServerAdapter implements IDevServer {
  private eventSource: EventSource | null = null;
  private changeAppliedCallback: ChangeAppliedCallback | null = null;
  private errorCallback: ErrorCallback | null = null;
  private apiBaseUrl: string;
  private storeId: string | null = null;
  private templateType: TemplateType | null = null;
  private templateLoadPromise: TemplateLoadPromise | null = null;
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isReconnecting: boolean = false;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  async connect(
    storeId: string,
    onChangeApplied: ChangeAppliedCallback,
    onError: ErrorCallback,
    templateType: TemplateType = 'index'
  ): Promise<void> {
    if (isConnected(this.eventSource)) {
      return;
    }

    // Cancelar reconexión pendiente si existe
    this.cancelReconnect();

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
        const sseUrl = buildSSEUrl(this.apiBaseUrl, storeId, templateType);
        this.eventSource = new EventSource(sseUrl);

        const connectionState = { hasResolved: false };

        this.setupEventHandlers(connectionState, resolve, reject);
        this.setupConnectionTimeout(connectionState, resolve, reject);
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
    if (!this.eventSource) return;

    this.eventSource.onopen = () => this.resolveConnection(connectionState, resolve);

    this.eventSource.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        this.handleServerMessage(message);

        if (message.type === 'CONNECTED') {
          this.resolveConnection(connectionState, resolve);
        }
      } catch (error) {
        this.handleError(error instanceof Error ? error : createError('Error parsing message'));
      }
    };

    this.eventSource.onerror = () => {
      const readyState = this.eventSource?.readyState;

      // Si ya estaba conectado y ahora hay error, intentar reconectar
      if (connectionState.hasResolved && readyState === EventSource.CLOSED) {
        // No rechazar la promesa aquí, solo programar reconexión
        this.scheduleReconnect();
        return;
      }

      // Si aún no se resolvió y está cerrado, rechazar
      if (!connectionState.hasResolved && readyState === EventSource.CLOSED) {
        connectionState.hasResolved = true;
        reject(createError('SSE connection failed'));
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
      if (isConnected(this.eventSource)) {
        resolve();
      } else {
        reject(createError('SSE connection timeout'));
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
    this.closeEventSource();
    this.clearCallbacks();
    this.clearState();
  }

  private closeEventSource(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
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
  }

  private scheduleReconnect(): void {
    if (this.isReconnecting || !this.storeId || !this.templateType) {
      return;
    }

    // Si ya está conectado, no reconectar
    if (isConnected(this.eventSource)) {
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

      // Si ya está conectado durante el delay, cancelar reconexión
      if (isConnected(this.eventSource)) {
        this.reconnectAttempts = 0;
        return;
      }

      this.closeEventSource();

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

  async loadTemplate(storeId: string, templateType: TemplateType): Promise<Template> {
    this.ensureConnected();
    this.templateType = templateType;

    return this.waitForTemplate();
  }

  private ensureConnected(): void {
    if (!isConnected(this.eventSource)) {
      throw createError('SSE is not connected');
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
    });
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

  isConnected(): boolean {
    return isConnected(this.eventSource);
  }

  private async sendUpdateRequest(
    type: string,
    payload: UpdateSectionSettingParams | UpdateBlockSettingParams | UpdateSubBlockSettingParams,
    storeId: string
  ): Promise<void> {
    this.ensureConnected();
    this.ensureTemplateType();

    try {
      const response = await this.postUpdateRequest(type, payload, storeId);
      await this.validateResponse(response);
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

  private async postUpdateRequest(
    type: string,
    payload: UpdateSectionSettingParams | UpdateBlockSettingParams | UpdateSubBlockSettingParams,
    storeId: string
  ): Promise<Response> {
    return fetch(`${this.apiBaseUrl}/stores/${storeId}/dev/update`, {
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
  }

  private async validateResponse(response: Response): Promise<void> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw createError(error.error || 'Failed to update setting');
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
        // Confirmación de conexión - no acción necesaria
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
