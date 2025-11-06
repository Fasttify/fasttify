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

import { useEffect, useState, useRef, useCallback } from 'react';
import { DevServerAdapter } from '../../infrastructure/adapters/dev-server.adapter';
import type { IDevServer } from '../../domain/ports/dev-server.port';
import type { AppliedChange } from '../../domain/entities/editor-session.entity';
import type { Template, TemplateType } from '../../domain/entities/template.entity';

interface UseDevServerParams {
  storeId: string;
  apiBaseUrl: string;
  enabled?: boolean;
}

interface UseDevServerResult {
  devServer: IDevServer | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  loadTemplate: (templateType: TemplateType) => Promise<Template | null>;
  onChangeApplied: (callback: (change: AppliedChange) => void) => void;
}

/**
 * Hook de presentación: useDevServer
 * Gestiona la conexión y comunicación con el Dev Server
 */
export function useDevServer({ storeId, apiBaseUrl, enabled = true }: UseDevServerParams): UseDevServerResult {
  const [devServer, setDevServer] = useState<IDevServer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const changeAppliedCallbacksRef = useRef<Set<(change: AppliedChange) => void>>(new Set());

  const handleChangeApplied = useCallback((change: AppliedChange) => {
    changeAppliedCallbacksRef.current.forEach((callback) => {
      try {
        callback(change);
      } catch (err) {
        console.error('Error from Dev Server:', err);
      }
    });
  }, []);

  const handleError = useCallback((err: Error) => {
    setError(err);
    setIsConnected(false);
  }, []);

  const connect = useCallback(async () => {
    if (!enabled || !storeId) return;

    setIsConnecting(true);
    setError(null);

    try {
      const server = new DevServerAdapter(apiBaseUrl);
      await server.connect(storeId, handleChangeApplied, handleError);
      setDevServer(server);
      setIsConnected(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error connecting to Dev Server');
      setError(error);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [storeId, apiBaseUrl, enabled, handleChangeApplied, handleError]);

  const disconnect = useCallback(async () => {
    if (devServer) {
      await devServer.disconnect();
      setDevServer(null);
      setIsConnected(false);
    }
  }, [devServer]);

  const loadTemplate = useCallback(
    async (templateType: TemplateType): Promise<Template | null> => {
      if (!devServer || !isConnected) {
        return null;
      }

      try {
        return await devServer.loadTemplate(storeId, templateType);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Error loading template');
        setError(error);
        return null;
      }
    },
    [devServer, isConnected, storeId]
  );

  const onChangeApplied = useCallback((callback: (change: AppliedChange) => void) => {
    changeAppliedCallbacksRef.current.add(callback);
    return () => {
      changeAppliedCallbacksRef.current.delete(callback);
    };
  }, []);

  // Conectar automáticamente cuando se monta el componente
  useEffect(() => {
    if (enabled && storeId) {
      connect();
    }

    return () => {
      if (devServer) {
        disconnect();
      }
    };
  }, [enabled, storeId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    devServer,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    loadTemplate,
    onChangeApplied,
  };
}
