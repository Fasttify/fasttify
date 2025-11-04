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

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { UseSidebarStateResult } from './useSidebarState';

interface UseSettingsPaneParams {
  currentSettings: Record<string, any>;
  sidebarState: UseSidebarStateResult;
  hotReload?: {
    updateSectionSetting: (sectionId: string, settingId: string, value: unknown) => Promise<void>;
    updateBlockSetting: (sectionId: string, blockId: string, settingId: string, value: unknown) => Promise<void>;
    updateSubBlockSetting: (
      sectionId: string,
      blockId: string,
      subBlockId: string,
      settingId: string,
      value: unknown
    ) => Promise<void>;
    isConnected: boolean;
  };
}

interface UseSettingsPaneResult {
  localSettings: Record<string, any>;
  handleSettingChange: (settingId: string, value: any) => void;
}

interface PendingChange {
  settingId: string;
  value: any;
}

const DEBOUNCE_DELAY_MS = 300;

// Helper: Ejecutar update según el tipo de elemento seleccionado
const executeUpdate = async (
  hotReload: NonNullable<UseSettingsPaneParams['hotReload']>,
  sidebarState: UseSidebarStateResult,
  settingId: string,
  value: unknown
): Promise<void> => {
  const { selectedSectionId, selectedBlockId, selectedSubBlockId } = sidebarState;

  if (!selectedSectionId) {
    return;
  }

  if (selectedSubBlockId && selectedBlockId) {
    return hotReload.updateSubBlockSetting(selectedSectionId, selectedBlockId, selectedSubBlockId, settingId, value);
  }

  if (selectedBlockId) {
    return hotReload.updateBlockSetting(selectedSectionId, selectedBlockId, settingId, value);
  }

  return hotReload.updateSectionSetting(selectedSectionId, settingId, value);
};

// Helper: Validar si se puede enviar el cambio
const canSendChange = (hotReload?: UseSettingsPaneParams['hotReload'], selectedSectionId?: string | null): boolean => {
  return Boolean(hotReload?.isConnected && selectedSectionId);
};

export function useSettingsPane({
  currentSettings,
  sidebarState,
  hotReload,
}: UseSettingsPaneParams): UseSettingsPaneResult {
  const [localSettings, setLocalSettings] = useState<Record<string, any>>(currentSettings);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Map<string, PendingChange>>(new Map());

  const selectionKey = useMemo(
    () =>
      `${sidebarState.selectedSectionId || ''}-${sidebarState.selectedBlockId || ''}-${sidebarState.selectedSubBlockId || ''}`,
    [sidebarState.selectedSectionId, sidebarState.selectedBlockId, sidebarState.selectedSubBlockId]
  );

  // Helper: Limpiar recursos (timeouts y cambios pendientes)
  const clearDebounceResources = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    pendingChangesRef.current.clear();
  }, []);

  // Sincronizar settings y limpiar recursos al cambiar de selección
  useEffect(() => {
    setLocalSettings(currentSettings);
    clearDebounceResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey]);

  // Limpiar timeout al desmontar
  useEffect(() => clearDebounceResources, [clearDebounceResources]);

  // Helper: Revertir cambio local si falla
  const revertLocalChange = useCallback(
    (settingId: string) => {
      setLocalSettings((prev) => ({
        ...prev,
        [settingId]: currentSettings[settingId],
      }));
    },
    [currentSettings]
  );

  // Helper: Procesar un cambio individual con manejo de errores
  const processChange = useCallback(
    async (change: PendingChange) => {
      if (!hotReload) return;

      try {
        await executeUpdate(hotReload, sidebarState, change.settingId, change.value);
      } catch (error) {
        console.error('Error updating setting:', error);
        revertLocalChange(change.settingId);
      }
    },
    [hotReload, sidebarState, revertLocalChange]
  );

  // Función para enviar cambios al servidor
  const sendChangesToServer = useCallback(async () => {
    if (!canSendChange(hotReload, sidebarState.selectedSectionId)) {
      return;
    }

    const changes = Array.from(pendingChangesRef.current.values());
    pendingChangesRef.current.clear();

    await Promise.all(changes.map(processChange));
  }, [hotReload, sidebarState.selectedSectionId, processChange]);

  // Helper: Programar envío de cambios con debounce
  const scheduleDebouncedSend = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      debounceTimeoutRef.current = null;
      sendChangesToServer();
    }, DEBOUNCE_DELAY_MS);
  }, [sendChangesToServer]);

  const handleSettingChange = useCallback(
    (settingId: string, value: any) => {
      setLocalSettings((prev) => ({ ...prev, [settingId]: value }));

      if (!canSendChange(hotReload, sidebarState.selectedSectionId)) {
        if (!hotReload) console.warn('Hot reload not available');
        else if (!hotReload.isConnected) console.warn('Hot reload not connected');
        return;
      }

      pendingChangesRef.current.set(settingId, { settingId, value });
      scheduleDebouncedSend();
    },
    [hotReload, sidebarState.selectedSectionId, scheduleDebouncedSend]
  );

  return {
    localSettings,
    handleSettingChange,
  };
}
