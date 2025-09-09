import {
  Banner,
  BlockStack,
  Button,
  Card,
  Icon,
  InlineStack,
  ProgressBar,
  Spinner,
  Text,
  Thumbnail,
} from '@shopify/polaris';
import { AlertCircleIcon, CheckCircleIcon, UploadIcon } from '@shopify/polaris-icons';
import { useCallback } from 'react';
import { useThemeUpload } from '../hooks/useThemeUpload';
import type { ThemeUploadFormProps } from '../types/theme-types';
import { formatFileSize, getValidationTone } from '../utils/theme-utils';

export function ThemeUploadForm({ storeId, onUpload, onConfirm, onCancel: _onCancel }: ThemeUploadFormProps) {
  const {
    selectedFile,
    uploadResult,
    isUploading,
    isConfirming,
    isProcessing,
    processingStatus,
    processingError,
    uploadProgress,
    error,
    handleFileSelect,
    handleUpload,
    handleConfirm,
    handleCancel,
    handleClearFile,
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
        // Automáticamente iniciar el upload cuando se arrastra un archivo
        setTimeout(() => handleUpload(), 100);
      }
    },
    [handleFileSelect, handleUpload]
  );

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
        setTimeout(() => handleUpload(), 100);
      }
    },
    [handleFileSelect, handleUpload]
  );

  return (
    <BlockStack gap="500">
      {/* Área de subida */}
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Seleccionar Archivo
          </Text>

          <Text as="p" tone="subdued">
            Sube tu tema en formato ZIP. El archivo debe contener la estructura completa del tema.
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

            <BlockStack gap="200" align="center">
              <Icon source={UploadIcon} tone="subdued" />
              <Text as="p" variant="bodyMd" tone="subdued">
                {selectedFile ? selectedFile.name : 'Arrastra tu archivo ZIP aquí o haz clic para seleccionar'}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Máximo 50MB
              </Text>
            </BlockStack>
          </div>

          {/* Archivo seleccionado */}
          {selectedFile && (
            <Card>
              <InlineStack align="space-between">
                <InlineStack gap="200">
                  <Thumbnail source={UploadIcon} alt="Theme file" />
                  <BlockStack gap="100">
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                      {selectedFile.name}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {formatFileSize(selectedFile.size)}
                    </Text>
                  </BlockStack>
                </InlineStack>
                <InlineStack gap="200">
                  {!uploadResult && !isUploading && (
                    <Button onClick={handleUpload} loading={isUploading}>
                      Procesar Tema
                    </Button>
                  )}
                  <Button variant="plain" onClick={handleClearFile} accessibilityLabel="Remove file">
                    Eliminar
                  </Button>
                </InlineStack>
              </InlineStack>
            </Card>
          )}

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
        </BlockStack>
      </Card>

      {/* Resultado de la validación */}
      {uploadResult && uploadResult.validation && (
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h3" variant="headingMd">
                Resultado de la Validación
              </Text>
              <Banner
                tone={getValidationTone(uploadResult.validation?.isValid)}
                icon={uploadResult.validation?.isValid ? CheckCircleIcon : AlertCircleIcon}>
                {uploadResult.validation?.isValid ? 'Tema válido' : 'Tema con problemas'}
              </Banner>
            </InlineStack>

            {/* Información del tema */}
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" fontWeight="medium">
                {uploadResult.theme?.name || 'Tema sin nombre'} v{uploadResult.theme?.version || '1.0.0'}
              </Text>
              {uploadResult.theme?.author && (
                <Text as="p" variant="bodySm" tone="subdued">
                  Por {uploadResult.theme.author}
                </Text>
              )}
              {uploadResult.theme?.description && (
                <Text as="p" variant="bodySm" tone="subdued">
                  {uploadResult.theme.description}
                </Text>
              )}
            </BlockStack>

            {/* Estadísticas */}
            <InlineStack gap="400">
              <Text as="p" variant="bodySm">
                {uploadResult.theme?.fileCount || 0} archivos
              </Text>
              <Text as="p" variant="bodySm">
                {uploadResult.theme?.assetCount || 0} assets
              </Text>
              <Text as="p" variant="bodySm">
                {uploadResult.theme?.sectionCount || 0} secciones
              </Text>
              <Text as="p" variant="bodySm">
                {uploadResult.theme?.templateCount || 0} templates
              </Text>
            </InlineStack>

            {/* Errores y advertencias */}
            {uploadResult.validation?.errorCount > 0 && (
              <BlockStack gap="200">
                <Text as="p" variant="bodyMd" fontWeight="medium" tone="critical">
                  Errores ({uploadResult.validation.errorCount})
                </Text>
                {uploadResult.validation.errors?.slice(0, 3).map((error, index) => (
                  <Text as="p" key={index} variant="bodySm" tone="critical">
                    • {error.message}
                  </Text>
                ))}
              </BlockStack>
            )}

            {uploadResult.validation?.warningCount > 0 && (
              <BlockStack gap="200">
                <Text as="p" variant="bodyMd" fontWeight="medium" tone="caution">
                  Advertencias ({uploadResult.validation.warningCount})
                </Text>
                {uploadResult.validation.warnings?.slice(0, 3).map((warning, index) => (
                  <Text as="p" key={index} variant="bodySm" tone="subdued">
                    • {warning.message}
                  </Text>
                ))}
              </BlockStack>
            )}

            {/* Estado de confirmación y procesamiento */}
            {processingStatus === 'completed' ? (
              <Banner tone="success" icon={CheckCircleIcon}>
                <p>¡Tema confirmado y almacenado correctamente! Cerrando…</p>
              </Banner>
            ) : isProcessing || processingStatus === 'processing' ? (
              <Banner>
                <BlockStack gap="200">
                  <InlineStack gap="200" align="start">
                    <Spinner size="small" />
                    <Text as="p" variant="bodyMd">
                      Confirmando y almacenando el tema... Esto puede tardar 30–60 segundos.
                    </Text>
                  </InlineStack>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Puedes mantener esta ventana abierta; se cerrará automáticamente al finalizar.
                  </Text>
                </BlockStack>
              </Banner>
            ) : processingStatus === 'error' ? (
              <Banner tone="critical" icon={AlertCircleIcon}>
                <p>{processingError || 'Ocurrió un error al confirmar el tema'}</p>
              </Banner>
            ) : (
              <InlineStack gap="200">
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  loading={isConfirming}
                  disabled={!uploadResult.validation?.isValid || isConfirming}>
                  {isConfirming ? 'Confirmando...' : 'Confirmar y Activar Tema'}
                </Button>
                <Button onClick={handleCancel} disabled={isConfirming}>
                  Cancelar
                </Button>
              </InlineStack>
            )}
          </BlockStack>
        </Card>
      )}
    </BlockStack>
  );
}
