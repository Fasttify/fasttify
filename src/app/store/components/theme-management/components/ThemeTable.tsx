'use client';

import { ActionList, Badge, BlockStack, Button, DataTable, Popover, Text } from '@shopify/polaris';
import { DeleteIcon, EditIcon, MenuHorizontalIcon, StatusActiveIcon } from '@shopify/polaris-icons';
import { useState } from 'react';

interface Theme {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  isActive: boolean;
  fileCount: number;
  totalSize: number;
  createdAt: string;
  updatedAt: string;
}

interface ThemeTableProps {
  themes: Theme[];
  onActivateTheme: (theme: Theme) => void;
  onEditTheme: (theme: Theme) => void;
  onDeleteTheme: (theme: Theme) => void;
}

export function ThemeTable({ themes, onActivateTheme, onEditTheme, onDeleteTheme }: ThemeTableProps) {
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const rows = themes.map((theme) => [
    <BlockStack key={`${theme.id}-name`} gap="100">
      <Text as="p" variant="bodyMd" fontWeight="semibold">
        {theme.name}
      </Text>
      <Text as="p" variant="bodySm" tone="subdued">
        v{theme.version} • {theme.author}
      </Text>
    </BlockStack>,
    <Text key={`${theme.id}-description`} as="p" variant="bodySm" tone="subdued">
      {theme.description || 'Sin descripción'}
    </Text>,
    <BlockStack key={`${theme.id}-files`} gap="100">
      <Text as="p" variant="bodySm">
        {theme.fileCount} archivos
      </Text>
      <Text as="p" variant="bodySm" tone="subdued">
        {formatFileSize(theme.totalSize)}
      </Text>
    </BlockStack>,
    <Badge key={`${theme.id}-status`} tone={theme.isActive ? 'success' : 'info'}>
      {theme.isActive ? 'Activo' : 'Inactivo'}
    </Badge>,
    <Text key={`${theme.id}-date`} as="p" variant="bodySm" tone="subdued">
      {formatDate(theme.updatedAt)}
    </Text>,
    <Popover
      key={`${theme.id}-actions`}
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
      <ActionList
        actionRole="menuitem"
        items={[
          ...(!theme.isActive
            ? [
                {
                  content: 'Activar',
                  icon: StatusActiveIcon,
                  onAction: () => {
                    onActivateTheme(theme);
                    setActivePopover(null);
                  },
                },
              ]
            : []),
          {
            content: 'Editar',
            icon: EditIcon,
            onAction: () => {
              onEditTheme(theme);
              setActivePopover(null);
            },
          },
          {
            content: 'Eliminar',
            icon: DeleteIcon,
            destructive: true,
            onAction: () => {
              onDeleteTheme(theme);
              setActivePopover(null);
            },
          },
        ]}
      />
    </Popover>,
  ]);

  const headers = ['Tema', 'Descripción', 'Archivos', 'Estado', 'Última modificación', 'Acciones'];

  return (
    <DataTable
      columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
      headings={headers}
      rows={rows}
      hoverable
    />
  );
}
