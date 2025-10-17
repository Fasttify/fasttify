'use client';

import { ActionList, Badge, BlockStack, Button, Card, InlineStack, Popover, Text } from '@shopify/polaris';
import { DeleteIcon, EditIcon, MenuHorizontalIcon, ViewIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import Image from 'next/image';
import type { ThemePreviewCardProps } from '@/app/store/components/theme-management/types/theme-types';
import { ImportThemeDropdown } from '@/app/store/components/theme-management/components/ImportThemeDropdown';

const THEME_PREVIEW_PLACEHOLDER =
  'https://images.unsplash.com/photo-1741482529153-a98d81235d06?q=80&w=2070&auto=format&fit=crop';

interface ThemePreviewCardPropsWithUpload extends ThemePreviewCardProps {
  onUploadTheme: () => void;
}

export function ThemePreviewCard({ theme, onCustomize, onAction, onUploadTheme }: ThemePreviewCardPropsWithUpload) {
  const [activePopover, setActivePopover] = useState(false);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAction = (action: string): void => {
    onAction(action, theme);
    setActivePopover(false);
  };

  const themeActions = [
    {
      content: 'Vista previa',
      icon: ViewIcon,
      onAction: () => handleAction('preview'),
    },
    {
      content: 'Editar código',
      icon: EditIcon,
      onAction: () => handleAction('edit'),
    },
    {
      content: 'Eliminar',
      icon: DeleteIcon,
      destructive: true,
      onAction: () => handleAction('delete'),
    },
  ];

  return (
    <Card>
      <BlockStack gap="400">
        {/* Header con título y acciones */}
        <InlineStack align="space-between">
          <Text as="h2" variant="headingMd" fontWeight="semibold">
            Temas
          </Text>
          <InlineStack gap="200">
            <ImportThemeDropdown onUploadTheme={onUploadTheme} />
          </InlineStack>
        </InlineStack>

        {/* Preview del tema */}
        <div
          style={{
            position: 'relative',
            height: '400px',
            borderRadius: 'var(--p-border-radius-200)',
            overflow: 'hidden',
          }}>
          <Image
            src={theme.previewUrl || THEME_PREVIEW_PLACEHOLDER}
            alt={`Preview de ${theme.name}`}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Información del tema */}
        <InlineStack align="space-between">
          <BlockStack gap="200">
            <InlineStack gap="200" align="start">
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  position: 'relative',
                  borderRadius: 'var(--p-border-radius-200)',
                  overflow: 'hidden',
                }}>
                <Image
                  src={theme.previewUrl || THEME_PREVIEW_PLACEHOLDER}
                  alt={theme.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <BlockStack gap="100">
                <InlineStack gap="200" align="start">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    {theme.name}
                  </Text>
                  <Badge tone="success">Tema actual</Badge>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  Agregado: {formatDate(theme.createdAt)}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Versión {theme.version}
                </Text>
              </BlockStack>
            </InlineStack>
          </BlockStack>
          <InlineStack gap="200">
            <Popover
              active={activePopover}
              activator={<Button icon={MenuHorizontalIcon} onClick={() => setActivePopover(!activePopover)} />}
              onClose={() => setActivePopover(false)}
              preferredPosition="below"
              preferredAlignment="right">
              <ActionList actionRole="menuitem" items={themeActions} />
            </Popover>
            <div style={{ transform: 'scale(1.0)' }}>
              <Button variant="primary" size="micro" onClick={onCustomize}>
                Personalizar
              </Button>
            </div>
          </InlineStack>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
