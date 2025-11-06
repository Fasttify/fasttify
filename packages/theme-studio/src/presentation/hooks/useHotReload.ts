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

import { useCallback, useEffect, useRef } from 'react';
import { UpdateSectionSettingUseCase } from '../../application/use-cases/update-section-setting.use-case';
import { UpdateBlockSettingUseCase } from '../../application/use-cases/update-block-setting.use-case';
import { UpdateSubBlockSettingUseCase } from '../../application/use-cases/update-sub-block-setting.use-case';
import { ReorderSectionsUseCase } from '../../application/use-cases/reorder-sections.use-case';
import { ReorderBlocksUseCase } from '../../application/use-cases/reorder-blocks.use-case';
import { ReorderSubBlocksUseCase } from '../../application/use-cases/reorder-sub-blocks.use-case';
import { DevServerAdapter } from '../../infrastructure/adapters/dev-server.adapter';
import { TemplateManagerAdapter } from '../../infrastructure/adapters/template-manager.adapter';
import { TemplateRepositoryAdapter } from '../../infrastructure/adapters/template-repository.adapter';
import { HistoryManagerAdapter } from '../../infrastructure/adapters/history-manager.adapter';
import type { RefObject } from 'react';
import type { TemplateType } from '../../domain/entities/template.entity';
import type { ChangeAppliedCallback, ErrorCallback } from '../../domain/ports/dev-server.port';
import type { IHistoryManager } from '../../domain/ports/history-manager.port';

interface UseHotReloadParams {
  storeId: string;
  apiBaseUrl: string;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  currentPageId?: string;
  enabled?: boolean;
}

interface UseHotReloadResult {
  updateSectionSetting: (sectionId: string, settingId: string, value: unknown) => Promise<void>;
  updateBlockSetting: (sectionId: string, blockId: string, settingId: string, value: unknown) => Promise<void>;
  updateSubBlockSetting: (
    sectionId: string,
    blockId: string,
    subBlockId: string,
    settingId: string,
    value: unknown
  ) => Promise<void>;
  reorderSections: (oldIndex: number, newIndex: number) => Promise<void>;
  reorderBlocks: (sectionId: string, oldIndex: number, newIndex: number) => Promise<void>;
  reorderSubBlocks: (sectionId: string, blockId: string, oldIndex: number, newIndex: number) => Promise<void>;
  isConnected: boolean;
  hasPendingChanges: boolean;
  devServer: DevServerAdapter | null;
  templateManager: TemplateManagerAdapter | null;
  historyManager: IHistoryManager | null;
}

/**
 * Hook de presentación: useHotReload
 * Proporciona funciones para actualizar settings con hot-reload
 * Maneja la comunicación con el Dev Server y actualización del iframe
 */
export function useHotReload({
  storeId,
  apiBaseUrl,
  iframeRef,
  currentPageId = 'index',
  enabled = true,
}: UseHotReloadParams): UseHotReloadResult {
  const devServerRef = useRef<DevServerAdapter | null>(null);
  const templateManagerRef = useRef<TemplateManagerAdapter | null>(null);
  const historyManagerRef = useRef<HistoryManagerAdapter | null>(null);
  const updateSectionSettingUseCaseRef = useRef<UpdateSectionSettingUseCase | null>(null);
  const updateBlockSettingUseCaseRef = useRef<UpdateBlockSettingUseCase | null>(null);
  const updateSubBlockSettingUseCaseRef = useRef<UpdateSubBlockSettingUseCase | null>(null);
  const reorderSectionsUseCaseRef = useRef<ReorderSectionsUseCase | null>(null);
  const reorderBlocksUseCaseRef = useRef<ReorderBlocksUseCase | null>(null);
  const reorderSubBlocksUseCaseRef = useRef<ReorderSubBlocksUseCase | null>(null);
  const lastPageIdRef = useRef<string | null>(null);

  // Helper para manejar cambios aplicados en el iframe
  const handleChangeApplied: ChangeAppliedCallback = useCallback(
    (change) => {
      if (change.html && iframeRef.current?.contentWindow) {
        const iframe = iframeRef.current;
        const sectionElement = iframe.contentDocument?.querySelector(`[data-section-id="${change.sectionId}"]`);
        if (sectionElement) {
          sectionElement.outerHTML = change.html;
        }
      }
    },
    [iframeRef]
  );

  // Helper para manejar errores
  const handleError: ErrorCallback = useCallback((error) => {
    console.error('Error from Dev Server:', error);
  }, []);

  // Helper para conectar y cargar template
  const connectAndLoadTemplate = useCallback(
    async (devServer: DevServerAdapter, templateManager: TemplateManagerAdapter, pageId: string) => {
      await devServer.connect(storeId, handleChangeApplied, handleError, pageId as TemplateType);
      const template = await devServer.loadTemplate(storeId, pageId as any);
      if (template) {
        templateManager.setTemplate(template);
      }
    },
    [storeId, handleChangeApplied, handleError]
  );

  // Inicializar adaptadores y manejar conexión/reconexión
  useEffect(() => {
    if (!enabled || !storeId) return;

    const needsReconnect = lastPageIdRef.current !== null && lastPageIdRef.current !== currentPageId;
    const isInitialized = devServerRef.current !== null;

    // Inicializar adaptadores solo si no están inicializados
    if (!isInitialized) {
      const devServer = new DevServerAdapter(apiBaseUrl);
      const templateRepository = new TemplateRepositoryAdapter(apiBaseUrl);
      const templateManager = new TemplateManagerAdapter(templateRepository);
      const historyManager = new HistoryManagerAdapter();

      devServerRef.current = devServer;
      templateManagerRef.current = templateManager;
      historyManagerRef.current = historyManager;
      updateSectionSettingUseCaseRef.current = new UpdateSectionSettingUseCase(
        devServer,
        templateManager,
        historyManager
      );
      updateBlockSettingUseCaseRef.current = new UpdateBlockSettingUseCase(devServer, templateManager, historyManager);
      updateSubBlockSettingUseCaseRef.current = new UpdateSubBlockSettingUseCase(
        devServer,
        templateManager,
        historyManager
      );
      reorderSectionsUseCaseRef.current = new ReorderSectionsUseCase(devServer, templateManager, historyManager);
      reorderBlocksUseCaseRef.current = new ReorderBlocksUseCase(devServer, templateManager, historyManager);
      reorderSubBlocksUseCaseRef.current = new ReorderSubBlocksUseCase(devServer, templateManager, historyManager);
    }

    const devServer = devServerRef.current!;
    const templateManager = templateManagerRef.current!;
    const historyManager = historyManagerRef.current!;

    // Reconectar si cambió la página
    if (needsReconnect) {
      // Limpiar historial al cambiar de página
      historyManager.clear();
      devServer
        .disconnect()
        .then(() => connectAndLoadTemplate(devServer, templateManager, currentPageId))
        .catch((error) => console.error('Error reconnecting to Dev Server:', error));
    } else if (!isInitialized) {
      // Conexión inicial
      connectAndLoadTemplate(devServer, templateManager, currentPageId).catch((error) =>
        console.error('Error connecting to Dev Server:', error)
      );
    }

    lastPageIdRef.current = currentPageId;

    return () => {
      if (needsReconnect || !enabled) {
        devServer.disconnect().catch(() => {
          // Ignorar errores al desconectar
        });
      }
    };
  }, [storeId, apiBaseUrl, enabled, currentPageId, connectAndLoadTemplate]);

  // Helper genérico para ejecutar casos de uso
  const executeUseCase = useCallback(
    async <T extends { execute: (params: any) => Promise<void> }>(useCaseRef: { current: T | null }, params: any) => {
      if (!useCaseRef.current) {
        throw new Error('Hot reload is not initialized');
      }
      await useCaseRef.current.execute(params);
    },
    []
  );

  const updateSectionSetting = useCallback(
    async (sectionId: string, settingId: string, value: unknown): Promise<void> => {
      await executeUseCase(updateSectionSettingUseCaseRef, { storeId, sectionId, settingId, value });
    },
    [storeId, executeUseCase]
  );

  const updateBlockSetting = useCallback(
    async (sectionId: string, blockId: string, settingId: string, value: unknown): Promise<void> => {
      await executeUseCase(updateBlockSettingUseCaseRef, { storeId, sectionId, blockId, settingId, value });
    },
    [storeId, executeUseCase]
  );

  const updateSubBlockSetting = useCallback(
    async (
      sectionId: string,
      blockId: string,
      subBlockId: string,
      settingId: string,
      value: unknown
    ): Promise<void> => {
      await executeUseCase(updateSubBlockSettingUseCaseRef, {
        storeId,
        sectionId,
        blockId,
        subBlockId,
        settingId,
        value,
      });
    },
    [storeId, executeUseCase]
  );

  const reorderSections = useCallback(
    async (oldIndex: number, newIndex: number): Promise<void> => {
      await executeUseCase(reorderSectionsUseCaseRef, { storeId, oldIndex, newIndex });
    },
    [storeId, executeUseCase]
  );

  const reorderBlocks = useCallback(
    async (sectionId: string, oldIndex: number, newIndex: number): Promise<void> => {
      await executeUseCase(reorderBlocksUseCaseRef, { storeId, sectionId, oldIndex, newIndex });
    },
    [storeId, executeUseCase]
  );

  const reorderSubBlocks = useCallback(
    async (sectionId: string, blockId: string, oldIndex: number, newIndex: number): Promise<void> => {
      await executeUseCase(reorderSubBlocksUseCaseRef, { storeId, sectionId, blockId, oldIndex, newIndex });
    },
    [storeId, executeUseCase]
  );

  const isConnected = devServerRef.current?.isConnected() ?? false;
  const hasPendingChanges = templateManagerRef.current?.hasPendingChanges() ?? false;

  return {
    updateSectionSetting,
    updateBlockSetting,
    updateSubBlockSetting,
    reorderSections,
    reorderBlocks,
    reorderSubBlocks,
    isConnected,
    hasPendingChanges,
    devServer: devServerRef.current,
    templateManager: templateManagerRef.current,
    historyManager: historyManagerRef.current,
  };
}
