import { logger } from '@/renderer-engine/lib/logger';
import { templateDevSynchronizer } from '@/renderer-engine/services/templates/sync/template-dev-synchronizer';
import { NextRequest } from 'next/server';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';

// Almacén de conexiones SSE activas
const activeConnections = new Set<ReadableStreamDefaultController>();

/**
 * Endpoint SSE (Server-Sent Events) para notificaciones en tiempo real
 */
export async function GET(request: NextRequest) {
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
        } catch (error) {
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
