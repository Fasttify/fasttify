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

import { useCallback, useRef, useEffect } from 'react';
import { ThemeFile } from '../../types/editor-types';

interface WorkerMessage {
  type: 'LOAD_THEME_FILES' | 'THEME_FILES_LOADED' | 'LOAD_FILE_CONTENT' | 'FILE_CONTENT_LOADED' | 'ERROR';
  data: any;
}

export const useThemeWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const pendingResolvers = useRef<Map<string, (value: any) => void>>(new Map());
  const contentCache = useRef<Map<string, string>>(new Map());
  const loadingRequests = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Solo crear el worker si no existe
    if (workerRef.current) {
      return;
    }

    try {
      // Usar worker desde lib/ para que se compile en el bundle
      workerRef.current = new Worker(new URL('@/lib/workers/theme-files.worker.js', import.meta.url));

      // Escuchar mensajes del worker
      workerRef.current.onmessage = (e: MessageEvent<WorkerMessage>) => {
        const { type, data } = e.data;

        if (type === 'THEME_FILES_LOADED') {
          // Resolver promesa específica por requestId
          const resolver = pendingResolvers.current.get(data.requestId);
          if (resolver) {
            resolver(data.files);
            pendingResolvers.current.delete(data.requestId);
          }
        } else if (type === 'FILE_CONTENT_LOADED') {
          // Resolver promesa específica por requestId
          const resolver = pendingResolvers.current.get(data.requestId);
          if (resolver) {
            // Guardar en cache
            const cacheKey = `${data.storeId}:${data.filePath}`;
            contentCache.current.set(cacheKey, data.content);
            loadingRequests.current.delete(cacheKey);

            resolver(data.content);
            pendingResolvers.current.delete(data.requestId);
          }
        } else if (type === 'ERROR') {
          // Rechazar promesa específica por requestId
          const resolver = pendingResolvers.current.get(data.requestId);
          if (resolver) {
            // Limpiar el estado de carga
            const cacheKey = `${data.storeId}:${data.filePath}`;
            loadingRequests.current.delete(cacheKey);

            // Para loadThemeFiles, devolver array vacío en lugar de null
            resolver([]);
            pendingResolvers.current.delete(data.requestId);
          }
        }
      };

      // Escuchar errores del worker
      workerRef.current.onerror = (error) => {
        console.error('Error in worker:', error);
      };
    } catch (error) {
      console.error('Error creating worker:', error);
      return;
    }

    // Limpiar al desmontar
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingResolvers.current.clear();
      contentCache.current.clear();
      loadingRequests.current.clear();
    };
  }, []);

  const loadThemeFiles = useCallback((storeId: string): Promise<ThemeFile[]> => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        resolve([]);
        return;
      }

      const requestId = Date.now().toString();
      pendingResolvers.current.set(requestId, resolve);

      // Enviar request al worker
      workerRef.current.postMessage({
        type: 'LOAD_THEME_FILES',
        data: { storeId },
        requestId,
      });
    });
  }, []);

  const loadFileContent = useCallback((storeId: string, filePath: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        resolve(null);
        return;
      }

      const cacheKey = `${storeId}:${filePath}`;

      // Verificar si ya está en cache
      if (contentCache.current.has(cacheKey)) {
        resolve(contentCache.current.get(cacheKey) || null);
        return;
      }

      // Verificar si ya hay una request en progreso para este archivo
      if (loadingRequests.current.has(cacheKey)) {
        // Esperar a que termine la request existente
        const checkInterval = setInterval(() => {
          if (contentCache.current.has(cacheKey)) {
            clearInterval(checkInterval);
            resolve(contentCache.current.get(cacheKey) || null);
          } else if (!loadingRequests.current.has(cacheKey)) {
            clearInterval(checkInterval);
            resolve(null);
          }
        }, 100);

        // Timeout después de 10 segundos
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(null);
        }, 10000);

        return;
      }

      // Marcar como en carga
      loadingRequests.current.add(cacheKey);

      const requestId = Date.now().toString();
      pendingResolvers.current.set(requestId, resolve);

      // Enviar request al worker
      workerRef.current.postMessage({
        type: 'LOAD_FILE_CONTENT',
        data: { storeId, filePath },
        requestId,
      });
    });
  }, []);

  return { loadThemeFiles, loadFileContent };
};
