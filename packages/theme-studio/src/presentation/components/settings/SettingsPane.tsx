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

'use client';

import { Card, BlockStack, Text, Button, Box, Scrollable, InlineStack } from '@shopify/polaris';
import { useSelectedSection } from '../../hooks/useSelectedSection';
import type { UseSidebarStateResult } from '../../hooks/useSidebarState';
import { SettingsGroup } from './SettingsGroup';
import { useMemo, useState, useCallback, useEffect } from 'react';

interface SettingsPaneProps {
  storeId: string;
  apiBaseUrl: string;
  currentPageId: string;
  sidebarState: UseSidebarStateResult;
  imageSelectorComponent?: (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect?: (image: { url: string } | null) => void;
    initialSelectedImage?: string | null;
  }) => React.ReactElement | null;
}

export function SettingsPane({
  storeId,
  apiBaseUrl,
  currentPageId,
  sidebarState,
  imageSelectorComponent,
}: SettingsPaneProps) {
  const { section, block, schema, currentSettings } = useSelectedSection({
    storeId,
    apiBaseUrl,
    currentPageId,
    selectedSectionId: sidebarState.selectedSectionId,
    selectedBlockId: sidebarState.selectedBlockId,
  });

  const [localSettings, setLocalSettings] = useState<Record<string, any>>(currentSettings);

  // Agrupar settings por headers
  const groupedSettings = useMemo(() => {
    if (!schema?.settings) {
      return [];
    }

    const groups: Array<{ header?: any; settings: any[] }> = [];
    let currentGroup: { header?: any; settings: any[] } = { settings: [] };

    for (const setting of schema.settings) {
      if (setting.type === 'header') {
        // Guardar grupo anterior si tiene settings
        if (currentGroup.settings.length > 0) {
          groups.push(currentGroup);
        }
        // Crear nuevo grupo con header
        currentGroup = { header: setting, settings: [] };
      } else {
        // Agregar setting al grupo actual
        currentGroup.settings.push(setting);
      }
    }

    // Agregar el último grupo si tiene settings
    if (currentGroup.settings.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, [schema]);

  // Sincronizar localSettings con currentSettings cuando cambian
  useEffect(() => {
    setLocalSettings(currentSettings);
  }, [currentSettings]);

  const handleSettingChange = useCallback((settingId: string, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      [settingId]: value,
    }));
  }, []);

  const handleRemoveBlock = useCallback(() => {
    if (!section || !block) return;

    // TODO: Implementar eliminación de bloque
    console.log('Remove block:', block.id);
  }, [section, block]);

  if (!sidebarState.selectedSectionId) {
    return (
      <div>
        <Box padding="200">
          <Card padding="300">
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Ajustes
              </Text>
              <Box padding="200">
                <Text as="p" variant="bodyMd" tone="subdued">
                  Selecciona una sección o bloque para editar sus ajustes
                </Text>
              </Box>
            </BlockStack>
          </Card>
        </Box>
      </div>
    );
  }

  const displayName = useMemo(() => {
    if (block) {
      const blockSchema = section?.schema?.blocks?.find((b: any) => b.type === block.type);
      return blockSchema?.name || block.type;
    }
    return section?.name || 'Sección';
  }, [block, section]);

  return (
    <div>
      <Box padding="200">
        <Card padding="300">
          <BlockStack gap="300">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h2" variant="headingMd">
                {displayName}
              </Text>
              {block && (
                <Button variant="plain" tone="critical" onClick={handleRemoveBlock}>
                  Eliminar bloque
                </Button>
              )}
            </InlineStack>
            <Scrollable style={{ height: 'calc(100vh - 160px)' }}>
              <Box padding="200">
                <BlockStack gap="400">
                  {groupedSettings.map((group, index) => (
                    <SettingsGroup
                      key={index}
                      settings={group.header ? [group.header, ...group.settings] : group.settings}
                      currentSettings={localSettings}
                      onSettingChange={handleSettingChange}
                      imageSelectorComponent={imageSelectorComponent}
                    />
                  ))}
                  {groupedSettings.length === 0 && (
                    <Text as="p" variant="bodyMd" tone="subdued">
                      No hay ajustes disponibles para esta sección
                    </Text>
                  )}
                </BlockStack>
              </Box>
            </Scrollable>
          </BlockStack>
        </Card>
      </Box>
    </div>
  );
}
