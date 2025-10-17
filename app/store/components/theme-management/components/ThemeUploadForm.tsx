import { Banner, BlockStack, Icon, InlineStack, ProgressBar, Spinner, Text } from '@shopify/polaris';
import { AlertCircleIcon, CheckCircleIcon, UploadIcon } from '@shopify/polaris-icons';
import { useCallback } from 'react';
import { useThemeUpload } from '@/app/store/components/theme-management/hooks/useThemeUpload';
import type { ThemeUploadFormProps } from '@/app/store/components/theme-management/types/theme-types';
import { formatFileSize } from '@/app/store/components/theme-management/utils/theme-utils';

export function ThemeUploadForm({
  storeId,
  onUpload,
  onConfirm,
  onCancel: _onCancel,
  onFileSelect,
}: ThemeUploadFormProps) {
  const {
    selectedFile,
    isUploading,
    isProcessing,
    processingStatus,
    processingError,
    uploadProgress,
    error,
    handleFileSelect,
  } = useThemeUpload({
    storeId,
    onUpload,
    onConfirm,
  });

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
        onFileSelect?.(file);
      }
    },
    [handleFileSelect, onFileSelect]
  );

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
        onFileSelect?.(file);
      }
    },
    [handleFileSelect, onFileSelect]
  );

  return (
    <BlockStack gap="400">
      {/* Instrucciones */}
      <Text as="p" variant="bodyMd" tone="subdued">
        Sube un archivo ZIP de tu tema de Fasttify. Los temas subidos se publicarán por defecto.
      </Text>
      <Text as="p" variant="bodySm" tone="subdued">
        Tamaño máximo del archivo: 50 MB
      </Text>

      {/* Área de drop */}
      <div
        style={{
          border: '2px dashed var(--p-color-border)',
          borderRadius: 'var(--p-border-radius-200)',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: selectedFile ? 'var(--p-color-surface-selected)' : 'transparent',
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('theme-file-input')?.click()}>
        <input
          id="theme-file-input"
          type="file"
          accept=".zip"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {selectedFile ? (
          <BlockStack gap="200" align="center">
            <Text as="p" variant="bodyMd" fontWeight="medium">
              {selectedFile.name}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {formatFileSize(selectedFile.size)}
            </Text>
          </BlockStack>
        ) : (
          <BlockStack gap="200" align="center">
            <Icon source={UploadIcon} tone="subdued" />
            <Text as="p" variant="bodyMd" tone="subdued">
              Arrastra tu archivo ZIP aquí o haz clic para seleccionar
            </Text>
          </BlockStack>
        )}
      </div>

      {/* Error */}
      {error && (
        <Banner tone="critical" icon={AlertCircleIcon}>
          <p>{error}</p>
        </Banner>
      )}

      {/* Progreso */}
      {isUploading && (
        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            Procesando tema...
          </Text>
          <ProgressBar progress={uploadProgress} size="small" />
        </BlockStack>
      )}

      {/* Estado de procesamiento */}
      {isProcessing || processingStatus === 'processing' ? (
        <Banner>
          <BlockStack gap="200">
            <InlineStack gap="200" align="start">
              <Spinner size="small" />
              <Text as="p" variant="bodyMd">
                Procesando tema... Esto puede tardar unos segundos.
              </Text>
            </InlineStack>
          </BlockStack>
        </Banner>
      ) : processingStatus === 'completed' ? (
        <Banner tone="success" icon={CheckCircleIcon}>
          <p>¡Tema subido correctamente! Cerrando…</p>
        </Banner>
      ) : processingStatus === 'error' ? (
        <Banner tone="critical" icon={AlertCircleIcon}>
          <p>{processingError || 'Ocurrió un error al procesar el tema'}</p>
        </Banner>
      ) : null}
    </BlockStack>
  );
}
