'use client';

import { ActionList, BlockStack, Button, Card, InlineStack, Popover, Text } from '@shopify/polaris';
import { DeleteIcon, EditIcon, MenuHorizontalIcon, StatusActiveIcon, ViewIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import Image from 'next/image';
import type { InactiveThemesListProps } from '@/app/store/components/theme-management/types/theme-types';

const THEME_PREVIEW_PLACEHOLDER =
  'https://images.unsplash.com/photo-1741482529153-a98d81235d06?q=80&w=2070&auto=format&fit=crop';

export function InactiveThemesList({ themes, onAction }: InactiveThemesListProps) {
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAction = (action: string, themeId: string): void => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      onAction(action, theme);
    }
    setActivePopover(null);
  };

  const getThemeActions = (themeId: string) => [
    {
      content: 'Activar',
      icon: StatusActiveIcon,
      onAction: () => handleAction('activate', themeId),
    },

    {
      content: 'Editar código',
      icon: EditIcon,
      onAction: () => handleAction('edit', themeId),
    },
    {
      content: 'Eliminar',
      icon: DeleteIcon,
      destructive: true,
      onAction: () => handleAction('delete', themeId),
    },
  ];

  if (themes.length === 0) {
    return null;
  }

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd" fontWeight="semibold">
          Otros temas
        </Text>

        <BlockStack gap="300">
          {themes.map((theme) => (
            <Card key={theme.id}>
              <InlineStack align="space-between">
                <InlineStack gap="300">
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
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                      {theme.name}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      v{theme.version} • {formatDate(theme.updatedAt)}
                    </Text>
                  </BlockStack>
                </InlineStack>

                <Popover
                  active={activePopover === theme.id}
                  activator={
                    <Button
                      size="micro"
                      icon={MenuHorizontalIcon}
                      onClick={() => setActivePopover(activePopover === theme.id ? null : theme.id)}
                    />
                  }
                  onClose={() => setActivePopover(null)}
                  preferredPosition="below"
                  preferredAlignment="right">
                  <ActionList actionRole="menuitem" items={getThemeActions(theme.id)} />
                </Popover>
              </InlineStack>
            </Card>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
