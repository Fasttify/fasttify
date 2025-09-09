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

import { NextRequest } from 'next/server';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/renderer-engine/lib/logger';
import { templateDevSynchronizer } from '@/renderer-engine/services/templates/sync/template-dev-synchronizer';

// Almacén de conexiones SSE activas
const activeConnections = new Set<ReadableStreamDefaultController>();

export async function handleSSEConnection(request: NextRequest): Promise<Response> {
  const corsHeaders = await getNextCorsHeaders(request);
  // Configurar cabeceras para SSE
  const encoder = new TextEncoder();

  // Crear un stream para SSE
  const stream = new ReadableStream({
    start(controller) {
      // Registrar esta conexión
      activeConnections.add(controller);

      // Configurar el callback para notificar cuando hay cambios
      if (activeConnections.size === 1) {
        // Solo configurar el callback la primera vez
        templateDevSynchronizer.onChanges(() => {
          // Notificar a todos los clientes conectados
          const message = JSON.stringify({
            type: 'reload',
            timestamp: Date.now(),
          });

          activeConnections.forEach((controller) => {
            try {
              controller.enqueue(encoder.encode(`data: ${message}\n\n`));
            } catch (error) {
              logger.error('Error sending SSE message', error, 'SSE');
            }
          });
        });
      }

      // Enviar un mensaje inicial de conexión
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      // Enviar un ping cada 30 segundos para mantener la conexión viva
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`));
        } catch (_error) {
          clearInterval(pingInterval);
        }
      }, 30000);

      // Limpiar cuando la conexión se cierra
      request.signal.addEventListener('abort', () => {
        activeConnections.delete(controller);
        clearInterval(pingInterval);
        logger.debug(`[SSE] Client disconnected, remaining: ${activeConnections.size}`, undefined, 'SSE');
      });
    },
  });

  // Devolver la respuesta SSE
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...corsHeaders,
    },
  });
}
