/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import { UndoChangeUseCase } from '../../application/use-cases/undo-change.use-case';
import { RedoChangeUseCase } from '../../application/use-cases/redo-change.use-case';
import { DevServerAdapter } from '../../infrastructure/adapters/dev-server.adapter';
import { TemplateManagerAdapter } from '../../infrastructure/adapters/template-manager.adapter';
import type { IHistoryManager } from '../../domain/ports/history-manager.port';

interface UseHistoryParams {
  storeId: string;
  devServer: DevServerAdapter | null;
  templateManager: TemplateManagerAdapter | null;
  historyManager: IHistoryManager | null;
}

interface UseHistoryResult {
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Hook de presentación: useHistory
 * Proporciona funcionalidad de undo/redo para el Theme Studio
 */
export function useHistory({
  storeId,
  devServer,
  templateManager,
  historyManager,
}: UseHistoryParams): UseHistoryResult {
  const undoChangeUseCaseRef = useRef<UndoChangeUseCase | null>(null);
  const redoChangeUseCaseRef = useRef<RedoChangeUseCase | null>(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Inicializar casos de uso cuando los adaptadores estén disponibles
  useEffect(() => {
    if (devServer && templateManager && historyManager) {
      undoChangeUseCaseRef.current = new UndoChangeUseCase(historyManager, templateManager, devServer);
      redoChangeUseCaseRef.current = new RedoChangeUseCase(historyManager, templateManager, devServer);

      // Actualizar estado inicial
      setCanUndo(historyManager.canUndo());
      setCanRedo(historyManager.canRedo());
    }
  }, [devServer, templateManager, historyManager]);

  // Actualizar estado del historial cuando cambia
  useEffect(() => {
    if (!historyManager) {
      setCanUndo(false);
      setCanRedo(false);
      return;
    }

    const updateHistoryState = () => {
      setCanUndo(historyManager.canUndo());
      setCanRedo(historyManager.canRedo());
    };

    // Actualizar estado inicial
    updateHistoryState();

    // Actualizar estado periódicamente (cada segundo)
    // Esto es necesario porque no hay un evento observable en el history manager
    const interval = setInterval(updateHistoryState, 1000);

    return () => clearInterval(interval);
  }, [historyManager]);

  const undo = useCallback(async () => {
    if (!historyManager || !devServer || !templateManager) {
      return;
    }

    // Asegurarse de que el caso de uso esté inicializado
    if (!undoChangeUseCaseRef.current) {
      undoChangeUseCaseRef.current = new UndoChangeUseCase(historyManager, templateManager, devServer);
    }

    try {
      await undoChangeUseCaseRef.current.execute(storeId);
      // Actualizar estado después de undo
      setCanUndo(historyManager.canUndo());
      setCanRedo(historyManager.canRedo());
    } catch (error) {
      console.error('Error undoing change:', error);
    }
  }, [storeId, historyManager, devServer, templateManager]);

  const redo = useCallback(async () => {
    if (!historyManager || !devServer || !templateManager) {
      return;
    }

    // Asegurarse de que el caso de uso esté inicializado
    if (!redoChangeUseCaseRef.current) {
      redoChangeUseCaseRef.current = new RedoChangeUseCase(historyManager, templateManager, devServer);
    }

    try {
      await redoChangeUseCaseRef.current.execute(storeId);
      // Actualizar estado después de redo
      setCanUndo(historyManager.canUndo());
      setCanRedo(historyManager.canRedo());
    } catch (error) {
      console.error('Error redoing change:', error);
    }
  }, [storeId, historyManager, devServer, templateManager]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
