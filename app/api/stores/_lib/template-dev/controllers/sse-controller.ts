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
import { logger } from '@fasttify/liquid-forge/lib/logger';
import { templateDevSynchronizer } from '@fasttify/liquid-forge/services/templates/sync/template-dev-synchronizer';
import { cacheManager } from '@fasttify/liquid-forge/index';

/**
 * Conexiones SSE activas.
 */
const activeConnections = new Set<ReadableStreamDefaultController>();

/**
 * Clasifica el tipo de cambio en base a la ruta del archivo.
 */
function classifyKind(filePath: string): 'css' | 'asset' | 'template' | 'settings' {
  const p = filePath.toLowerCase();
  if (p.endsWith('.css') || p.endsWith('.css.liquid')) return 'css';
  if (p.includes('/assets/')) {
    if (
      p.endsWith('.png') ||
      p.endsWith('.jpg') ||
      p.endsWith('.jpeg') ||
      p.endsWith('.webp') ||
      p.endsWith('.svg') ||
      p.endsWith('.gif') ||
      p.endsWith('.woff') ||
      p.endsWith('.woff2') ||
      p.endsWith('.ttf')
    ) {
      return 'asset';
    }
    if (p.endsWith('.js') || p.endsWith('.js.liquid')) return 'asset';
  }
  if (p.startsWith('config/') && (p.endsWith('.json') || p.endsWith('.json.liquid'))) return 'settings';
  return 'template';
}

/**
 * Buffer de cambios y configuración de debounce.
 */
let pending: Array<{ path: string; event: string; timestamp: number }> = [];
let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_MS = 200;

/**
 * Maneja una conexión SSE y emite eventos de cambios de plantillas.
 */
export async function handleSSEConnection(request: NextRequest): Promise<Response> {
  const corsHeaders = await getNextCorsHeaders(request);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      activeConnections.add(controller);
      if (activeConnections.size === 1) {
        templateDevSynchronizer.onChanges((changes) => {
          pending.push(...changes);
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            const now = Date.now();
            const storeId = templateDevSynchronizer.getStoreId();
            const latestByPath = new Map<string, { path: string; event: string; timestamp: number }>();
            for (const ch of pending) latestByPath.set(ch.path, ch);
            const batch = Array.from(latestByPath.values());
            pending = [];

            let hasTemplateChange = false;
            batch.forEach((ch) => {
              const kind = classifyKind(ch.path);
              if (kind === 'template') hasTemplateChange = true;
              const msg = JSON.stringify({
                type: 'change',
                path: ch.path,
                event: ch.event,
                kind,
                timestamp: ch.timestamp,
              });
              activeConnections.forEach((c) => {
                try {
                  c.enqueue(encoder.encode(`data: ${msg}\n\n`));
                } catch (error) {
                  logger.error('Error sending SSE change message', error, 'SSE');
                }
              });
            });

            if (hasTemplateChange) {
              try {
                if (storeId) {
                  cacheManager.clearCache();
                }
              } catch (err) {
                logger.error('Error invalidating store cache on reload', err, 'SSE');
              }
              const summary = JSON.stringify({ type: 'reload', timestamp: now });
              activeConnections.forEach((c) => {
                try {
                  c.enqueue(encoder.encode(`data: ${summary}\n\n`));
                } catch (error) {
                  logger.error('Error sending SSE summary message', error, 'SSE');
                }
              });
            }
          }, DEBOUNCE_MS);
        });
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`));
        } catch (_error) {
          clearInterval(pingInterval);
        }
      }, 30000);
      request.signal.addEventListener('abort', () => {
        activeConnections.delete(controller);
        clearInterval(pingInterval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
