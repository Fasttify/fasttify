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

  useEffect(() => {
    // Crear el worker
    workerRef.current = new Worker('/workers/theme-files.worker.js');

    // Escuchar mensajes del worker
    workerRef.current.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const { type, data } = e.data;

      if (type === 'THEME_FILES_LOADED') {
        // Resolver promesas de archivos
        pendingResolvers.current.forEach((resolve) => {
          resolve(data.files);
        });
        pendingResolvers.current.clear();
      } else if (type === 'FILE_CONTENT_LOADED') {
        // Resolver promesas de contenido
        pendingResolvers.current.forEach((resolve) => {
          resolve(data.content);
        });
        pendingResolvers.current.clear();
      } else if (type === 'ERROR') {
        // Rechazar todas las promesas pendientes
        pendingResolvers.current.forEach((resolve) => {
          resolve(null);
        });
        pendingResolvers.current.clear();
      }
    };

    // Limpiar al desmontar
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingResolvers.current.clear();
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
      });
    });
  }, []);

  const loadFileContent = useCallback((storeId: string, filePath: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        resolve(null);
        return;
      }

      const requestId = Date.now().toString();
      pendingResolvers.current.set(requestId, resolve);

      // Enviar request al worker
      workerRef.current.postMessage({
        type: 'LOAD_FILE_CONTENT',
        data: { storeId, filePath },
      });
    });
  }, []);

  return { loadThemeFiles, loadFileContent };
};
