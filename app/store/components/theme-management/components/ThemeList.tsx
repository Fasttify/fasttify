'use client';

import { Banner, BlockStack, Button, Card, Spinner, Text } from '@shopify/polaris';
import { AlertCircleIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { useThemeList } from '@/app/store/components/theme-management/hooks/useThemeList';
import { useThemeActions } from '@/app/store/components/theme-management/hooks/useThemeActions';
import { ThemeModals } from '@/app/store/components/theme-management/components/ThemeModals';
import { ThemeUploadModal } from '@/app/store/components/theme-management/components/ThemeUploadModal';
import { ThemePreviewCard } from '@/app/store/components/theme-management/components/ThemePreviewCard';
import { InactiveThemesList } from '@/app/store/components/theme-management/components/InactiveThemesList';

export function ThemeList({ storeId }: { storeId: string }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { themes, loading, error, activateTheme, deleteTheme, refreshThemes } = useThemeList(storeId);

  const {
    selectedTheme,
    showActivateModal,
    showDeleteModal,
    isActivating,
    isDeleting,
    handleActivateTheme,
    handleDeleteTheme,
    handleThemeAction,
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

  const activeTheme = themes.find((theme) => theme.isActive);
  const inactiveThemes = themes.filter((theme) => !theme.isActive);

  const handleCustomize = () => {
    if (activeTheme) {
      handleThemeAction('edit', activeTheme);
    }
  };

  const handleUploadTheme = () => {
    setShowUploadModal(true);
  };

  return (
    <>
      <BlockStack gap="400">
        {activeTheme ? (
          <ThemePreviewCard
            theme={activeTheme}
            onCustomize={handleCustomize}
            onAction={handleThemeAction}
            onUploadTheme={handleUploadTheme}
          />
        ) : (
          <Card>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <BlockStack gap="300" align="center">
                <Text as="p" variant="bodyMd" tone="subdued">
                  No hay tema activo. Sube un tema para comenzar.
                </Text>
                <Button variant="primary" onClick={handleUploadTheme}>
                  Subir tema
                </Button>
              </BlockStack>
            </div>
          </Card>
        )}

        {inactiveThemes.length > 0 && <InactiveThemesList themes={inactiveThemes} onAction={handleThemeAction} />}

        {themes.length === 0 && (
          <Card>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <Text as="p" variant="bodyMd" tone="subdued">
                No hay temas subidos. Sube tu primer tema para personalizar la apariencia de tu tienda.
              </Text>
            </div>
          </Card>
        )}
      </BlockStack>

      {/* Modal de subida de tema */}
      <ThemeUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
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
