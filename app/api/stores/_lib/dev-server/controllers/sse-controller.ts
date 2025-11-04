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

import { NextRequest, NextResponse } from 'next/server';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/liquid-forge';
import type { TemplateType } from '@fasttify/theme-studio';
import type { AppliedChangePayload } from '../domain/entities/dev-session.entity';
import { TemplateLoaderAdapter } from '../infrastructure/adapters/template-loader.adapter';
import { devSessionManager } from '../infrastructure/services/dev-session-manager.service';

const templateLoader = new TemplateLoaderAdapter();

/**
 * Conexiones SSE activas por storeId:templateType
 */
const activeConnections = new Map<string, Set<ReadableStreamDefaultController>>();

function getConnectionKey(storeId: string, templateType: TemplateType): string {
  return `${storeId}:${templateType}`;
}

/**
 * Maneja una conexión SSE para hot-reload del editor
 */
export async function handleSSEConnection(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  const encoder = new TextEncoder();

  // Obtener parámetros de la URL
  const url = new URL(request.url);
  const storeId = url.searchParams.get('storeId');
  const templateType = url.searchParams.get('templateType') as TemplateType | null;

  if (!storeId || !templateType) {
    return NextResponse.json(
      { error: 'Missing storeId or templateType' },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const connectionKey = getConnectionKey(storeId, templateType);

  const stream = new ReadableStream({
    start(controller) {
      // Agregar conexión al mapa
      if (!activeConnections.has(connectionKey)) {
        activeConnections.set(connectionKey, new Set());
      }
      const connections = activeConnections.get(connectionKey);
      if (connections) {
        connections.add(controller);
      }

      // Enviar mensaje de conexión
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`));

      // Cargar y enviar template inicial
      templateLoader
        .loadTemplate(storeId, templateType)
        .then((template) => {
          const session = devSessionManager.createOrGetSession(storeId, templateType, template);
          const message = JSON.stringify({
            type: 'TEMPLATE_LOADED',
            payload: {
              template: session.template,
            },
          });
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        })
        .catch((error) => {
          logger.error(`Error loading template for SSE connection`, error, 'SSEController');
        });

      // Ping cada 30 segundos para mantener la conexión viva
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`));
        } catch (_error) {
          clearInterval(pingInterval);
        }
      }, 30000);

      // Limpiar al cerrar la conexión
      request.signal.addEventListener('abort', () => {
        const connections = activeConnections.get(connectionKey);
        if (connections) {
          connections.delete(controller);
          if (connections.size === 0) {
            activeConnections.delete(connectionKey);
          }
        }
        clearInterval(pingInterval);
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

/**
 * Envía un cambio aplicado a todas las conexiones SSE de un storeId:templateType
 */
export function broadcastChangeApplied(
  storeId: string,
  templateType: TemplateType,
  change: AppliedChangePayload
): void {
  const connectionKey = getConnectionKey(storeId, templateType);
  const connections = activeConnections.get(connectionKey);

  if (!connections || connections.size === 0) {
    return;
  }

  const encoder = new TextEncoder();
  const message = JSON.stringify({
    type: 'CHANGE_APPLIED',
    payload: change,
  });

  connections.forEach((controller) => {
    try {
      controller.enqueue(encoder.encode(`data: ${message}\n\n`));
    } catch (error) {
      logger.error('Error sending SSE change message', error, 'SSEController');
      connections.delete(controller);
    }
  });
}

/**
 * Envía un error de renderizado a todas las conexiones SSE
 */
export function broadcastRenderError(
  storeId: string,
  templateType: TemplateType,
  error: string,
  sectionId: string
): void {
  const connectionKey = getConnectionKey(storeId, templateType);
  const connections = activeConnections.get(connectionKey);

  if (!connections || connections.size === 0) {
    return;
  }

  const encoder = new TextEncoder();
  const message = JSON.stringify({
    type: 'RENDER_ERROR',
    payload: {
      error,
      sectionId,
    },
  });

  connections.forEach((controller) => {
    try {
      controller.enqueue(encoder.encode(`data: ${message}\n\n`));
    } catch (err) {
      logger.error('Error sending SSE error message', err, 'SSEController');
      connections.delete(controller);
    }
  });
}

/**
 * Envía un template cargado a todas las conexiones SSE
 */
export function broadcastTemplateLoaded(storeId: string, templateType: TemplateType, template: any): void {
  const connectionKey = getConnectionKey(storeId, templateType);
  const connections = activeConnections.get(connectionKey);

  if (!connections || connections.size === 0) {
    return;
  }

  const encoder = new TextEncoder();
  const message = JSON.stringify({
    type: 'TEMPLATE_LOADED',
    payload: {
      template,
    },
  });

  connections.forEach((controller) => {
    try {
      controller.enqueue(encoder.encode(`data: ${message}\n\n`));
    } catch (err) {
      logger.error('Error sending SSE template loaded message', err, 'SSEController');
      connections.delete(controller);
    }
  });
}
