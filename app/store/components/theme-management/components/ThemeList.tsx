'use client';

import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  DataTable,
  EmptyState,
  InlineStack,
  Modal,
  Popover,
  Spinner,
  Text,
} from '@shopify/polaris';
import {
  AlertCircleIcon,
  DeleteIcon,
  EditIcon,
  MenuHorizontalIcon,
  PlusIcon,
  StatusActiveIcon,
} from '@shopify/polaris-icons';
import { useState } from 'react';
import { useThemeList } from '../hooks/useThemeList';
import { ThemeUploadForm } from './ThemeUploadForm';

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

export function ThemeList({ storeId }: { storeId: string }) {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { themes, loading, error, activateTheme, deleteTheme, refreshThemes } = useThemeList(storeId);

  const handleActivateTheme = async () => {
    if (selectedTheme) {
      try {
        setIsActivating(true);
        await activateTheme(selectedTheme.id);
        setShowActivateModal(false);
        setSelectedTheme(null);
      } catch (error) {
        console.error('Error activating theme:', error);
      } finally {
        setIsActivating(false);
      }
    }
  };

  const handleDeleteTheme = async () => {
    if (selectedTheme) {
      try {
        setIsDeleting(true);
        await deleteTheme(selectedTheme.id);
        setShowDeleteModal(false);
        setSelectedTheme(null);
      } catch (error) {
        console.error('Error deleting theme:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

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
    <BlockStack key={theme.id} gap="100">
      <Text as="p" variant="bodyMd" fontWeight="semibold">
        {theme.name}
      </Text>
      <Text as="p" variant="bodySm" tone="subdued">
        v{theme.version} • {theme.author}
      </Text>
    </BlockStack>,
    <Text as="p" variant="bodySm" tone="subdued">
      {theme.description || 'Sin descripción'}
    </Text>,
    <BlockStack gap="100">
      <Text as="p" variant="bodySm">
        {theme.fileCount} archivos
      </Text>
      <Text as="p" variant="bodySm" tone="subdued">
        {formatFileSize(theme.totalSize)}
      </Text>
    </BlockStack>,
    <Badge tone={theme.isActive ? 'success' : 'info'}>{theme.isActive ? 'Activo' : 'Inactivo'}</Badge>,
    <Text as="p" variant="bodySm" tone="subdued">
      {formatDate(theme.updatedAt)}
    </Text>,
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
      <BlockStack gap="100">
        {!theme.isActive && (
          <Button
            size="micro"
            variant="tertiary"
            icon={StatusActiveIcon}
            onClick={() => {
              setSelectedTheme(theme);
              setShowActivateModal(true);
              setActivePopover(null);
            }}>
            Activar
          </Button>
        )}
        <Button
          size="micro"
          variant="tertiary"
          icon={EditIcon}
          onClick={() => {
            // TODO: Implementar edición
            setActivePopover(null);
          }}>
          Editar
        </Button>
        <Button
          size="micro"
          variant="tertiary"
          icon={DeleteIcon}
          tone="critical"
          onClick={() => {
            setSelectedTheme(theme);
            setShowDeleteModal(true);
            setActivePopover(null);
          }}>
          Eliminar
        </Button>
      </BlockStack>
    </Popover>,
  ]);

  const headers = ['Tema', 'Descripción', 'Archivos', 'Estado', 'Última modificación', 'Acciones'];

  if (loading) {
    return (
      <Card>
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}>
          <Spinner size="large" />
          <Text as="p" variant="bodyMd" tone="subdued">
            Cargando temas...
          </Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Banner tone="critical" icon={AlertCircleIcon}>
          <p>Error al cargar los temas: {error}</p>
        </Banner>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div style={{ padding: '1rem' }}>
          <BlockStack gap="400">
            <Text as="p" variant="headingMd" fontWeight="semibold">
              Gestión de Temas
            </Text>
            <InlineStack align="end">
              <Button variant="primary" icon={PlusIcon} onClick={() => setShowUploadModal(true)}>
                Subir nuevo tema
              </Button>
            </InlineStack>
          </BlockStack>
        </div>

        {themes.length === 0 ? (
          <EmptyState
            heading="No hay temas subidos"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
            <p>Sube tu primer tema para personalizar la apariencia de tu tienda.</p>
            <Button variant="primary" icon={PlusIcon} onClick={() => setShowUploadModal(true)}>
              Subir tema
            </Button>
          </EmptyState>
        ) : (
          <DataTable
            columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
            headings={headers}
            rows={rows}
            hoverable
          />
        )}
      </Card>

      {/* Modal de subida de tema */}
      {showUploadModal && (
        <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)} title="Subir Tema Personalizado">
          <Modal.Section>
            <ThemeUploadForm
              storeId={storeId}
              onUpload={async (file: File) => {
                const formData = new FormData();
                formData.append('theme', file);

                const response = await fetch(`/api/stores/${storeId}/themes/upload`, {
                  method: 'POST',
                  body: formData,
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Error al subir el tema');
                }

                const result = await response.json();
                return result.details || result;
              }}
              onConfirm={async (result, file) => {
                try {
                  const formData = new FormData();
                  formData.append('theme', file);
                  formData.append('themeData', JSON.stringify(result));

                  const response = await fetch(`/api/stores/${storeId}/themes/confirm`, {
                    method: 'POST',
                    body: formData,
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al confirmar el tema');
                  }

                  const confirmResult = await response.json();

                  if (confirmResult.success && confirmResult.processId) {
                    // No cerramos aún; el formulario hará polling y cerrará automático tras completar
                    // Lanzar un refresh eventual por si ya aparece
                    setTimeout(() => refreshThemes(), 2000);
                    return { ok: true, processId: confirmResult.processId as string };
                  }
                  return { ok: false };
                } catch (error) {
                  console.error('Error confirming theme:', error);
                  return { ok: false };
                }
              }}
              onCancel={() => {
                setShowUploadModal(false);
                refreshThemes();
              }}
            />
          </Modal.Section>
        </Modal>
      )}

      {/* Modal de confirmación de activación */}
      {showActivateModal && selectedTheme && (
        <Modal
          open={showActivateModal}
          onClose={() => setShowActivateModal(false)}
          title="Activar tema"
          primaryAction={{
            content: 'Activar',
            onAction: handleActivateTheme,
            icon: StatusActiveIcon,
            loading: isActivating,
            disabled: isActivating,
          }}
          secondaryActions={[
            {
              content: 'Cancelar',
              onAction: () => setShowActivateModal(false),
              disabled: isActivating,
            },
          ]}>
          <Modal.Section>
            <BlockStack gap="400">
              <Text as="p" variant="bodyMd">
                ¿Estás seguro de que quieres activar el tema "{selectedTheme.name}"?
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Este tema reemplazará el tema actualmente activo.
              </Text>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedTheme && (
        <Modal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Eliminar tema"
          primaryAction={{
            content: 'Eliminar',
            onAction: handleDeleteTheme,
            destructive: true,
            icon: DeleteIcon,
            loading: isDeleting,
            disabled: isDeleting,
          }}
          secondaryActions={[
            {
              content: 'Cancelar',
              onAction: () => setShowDeleteModal(false),
              disabled: isDeleting,
            },
          ]}>
          <Modal.Section>
            <BlockStack gap="400">
              <Text as="p" variant="bodyMd">
                ¿Estás seguro de que quieres eliminar el tema "{selectedTheme.name}"?
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Esta acción no se puede deshacer. El tema se eliminará permanentemente.
              </Text>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </>
  );
}
