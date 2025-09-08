'use client';

import { Banner, BlockStack, Button, Card, EmptyState, InlineStack, Modal, Spinner, Text } from '@shopify/polaris';
import { AlertCircleIcon, PlusIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { useThemeList } from '../hooks/useThemeList';
import { useThemeActions } from '../hooks/useThemeActions';
import { ThemeTable } from './ThemeTable';
import { ThemeModals } from './ThemeModals';
import { ThemeUploadForm } from './ThemeUploadForm';

export function ThemeList({ storeId }: { storeId: string }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { themes, loading, error, activateTheme, deleteTheme, refreshThemes } = useThemeList(storeId);

  const {
    selectedTheme,
    showActivateModal,
    showDeleteModal,
    isActivating,
    isDeleting,
    openActivateModal,
    openDeleteModal,
    handleEditTheme,
    handleActivateTheme,
    handleDeleteTheme,
    closeActivateModal,
    closeDeleteModal,
  } = useThemeActions({ storeId, activateTheme, deleteTheme, refreshThemes });

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
          <ThemeTable
            themes={themes}
            onActivateTheme={openActivateModal}
            onEditTheme={handleEditTheme}
            onDeleteTheme={openDeleteModal}
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

      <ThemeModals
        selectedTheme={selectedTheme}
        showActivateModal={showActivateModal}
        showDeleteModal={showDeleteModal}
        isActivating={isActivating}
        isDeleting={isDeleting}
        onCloseActivateModal={closeActivateModal}
        onCloseDeleteModal={closeDeleteModal}
        onConfirmActivate={handleActivateTheme}
        onConfirmDelete={handleDeleteTheme}
      />
    </>
  );
}
