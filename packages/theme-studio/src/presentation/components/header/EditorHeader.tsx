/*
 * Theme Studio - Editor Header
 */

'use client';

import { InlineStack, Button, ButtonGroup, Badge, Text, Box, Tooltip, Icon, SkeletonBodyText } from '@shopify/polaris';
import { DesktopIcon, TabletIcon, MobileIcon, UndoIcon, RedoIcon, ExitIcon } from '@shopify/polaris-icons';
import { PageSelector } from '../page-selector/PageSelector';
import { useStoreTemplates } from '../../hooks/useStoreTemplates';

interface EditorHeaderProps {
  storeId?: string;
  apiBaseUrl?: string;
  pageTitle?: string;
  live?: boolean;
  device: 'desktop' | 'tablet' | 'mobile';
  onChangeDevice: (d: 'desktop' | 'tablet' | 'mobile') => void;
  onExit?: () => void;
  onInspector?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  hasPendingChanges?: boolean;
  onPageSelect?: (pageId: string, pageUrl: string) => void;
}

export function EditorHeader({
  storeId,
  apiBaseUrl,
  pageTitle = 'Home page',
  live = true,
  device,
  onChangeDevice,
  onExit,
  onInspector,
  onUndo,
  onRedo,
  onSave,
  isSaving,
  hasPendingChanges = false,
  onPageSelect,
}: EditorHeaderProps) {
  const { isLoading: isLoadingTemplates } = useStoreTemplates({
    storeId,
    apiBaseUrl: apiBaseUrl || '',
  });

  return (
    <Box padding="300" borderColor="border" borderBlockEndWidth="025">
      <InlineStack align="space-between" blockAlign="center">
        <InlineStack gap="200" blockAlign="center">
          <Tooltip content="Salir">
            <Button variant="plain" onClick={onExit} accessibilityLabel="Salir" icon={<Icon source={ExitIcon} />} />
          </Tooltip>
          {live && <Badge tone="success">Live</Badge>}
          {storeId && apiBaseUrl ? (
            isLoadingTemplates ? (
              <div style={{ minHeight: '36px', minWidth: '120px', display: 'flex', alignItems: 'center' }}>
                <SkeletonBodyText lines={1} />
              </div>
            ) : (
              <PageSelector
                storeId={storeId}
                apiBaseUrl={apiBaseUrl}
                currentPage={pageTitle}
                onPageSelect={onPageSelect}
              />
            )
          ) : (
            <Text as="p" variant="bodyMd">
              {pageTitle}
            </Text>
          )}
        </InlineStack>

        <InlineStack gap="300" blockAlign="center">
          <Box background="bg-fill-tertiary" borderColor="border" borderWidth="025" borderRadius="200">
            <ButtonGroup>
              <Tooltip content="Desktop">
                <Box padding="100" borderRadius="200" background={device === 'desktop' ? 'bg-fill' : undefined}>
                  <Button
                    onClick={() => onChangeDevice('desktop')}
                    accessibilityLabel="Desktop"
                    icon={<Icon source={DesktopIcon} tone={device === 'desktop' ? 'base' : 'subdued'} />}
                    variant="plain"
                  />
                </Box>
              </Tooltip>
              <Tooltip content="Tablet">
                <Box padding="100" borderRadius="200" background={device === 'tablet' ? 'bg-fill' : undefined}>
                  <Button
                    onClick={() => onChangeDevice('tablet')}
                    accessibilityLabel="Tablet"
                    icon={<Icon source={TabletIcon} tone={device === 'tablet' ? 'base' : 'subdued'} />}
                    variant="plain"
                  />
                </Box>
              </Tooltip>
              <Tooltip content="Mobile">
                <Box padding="100" borderRadius="200" background={device === 'mobile' ? 'bg-fill' : undefined}>
                  <Button
                    onClick={() => onChangeDevice('mobile')}
                    accessibilityLabel="Mobile"
                    icon={<Icon source={MobileIcon} tone={device === 'mobile' ? 'base' : 'subdued'} />}
                    variant="plain"
                  />
                </Box>
              </Tooltip>
            </ButtonGroup>
          </Box>

          <Tooltip content="Deshacer (Ctrl+Z)">
            <Button
              onClick={onUndo}
              accessibilityLabel="Deshacer"
              icon={<Icon source={UndoIcon} />}
              variant="tertiary"
              disabled={!onUndo}
            />
          </Tooltip>
          <Tooltip content="Rehacer (Ctrl+Y)">
            <Button
              onClick={onRedo}
              accessibilityLabel="Rehacer"
              icon={<Icon source={RedoIcon} />}
              variant="tertiary"
              disabled={!onRedo}
            />
          </Tooltip>

          <Tooltip content="Guardar (Ctrl+S)">
            <Button
              variant="primary"
              onClick={onSave}
              loading={isSaving}
              accessibilityLabel="Guardar"
              disabled={isSaving || !hasPendingChanges}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </Tooltip>
        </InlineStack>
      </InlineStack>
    </Box>
  );
}
