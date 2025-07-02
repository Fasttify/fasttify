import { DropZone, Text, BlockStack, InlineStack, Icon } from '@shopify/polaris';
import { ImageIcon } from '@shopify/polaris-icons';
import { useCallback, useState } from 'react';

interface UploadDropZoneProps {
  onDrop: (files: File[]) => void;
  allowMultipleSelection: boolean;
}

export default function UploadDropZone({ onDrop, allowMultipleSelection }: UploadDropZoneProps) {
  const [fileCount, setFileCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);

  const handleDropZoneDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
      const imageFiles = acceptedFiles.filter((file) => file.type.startsWith('image/'));

      setFileCount(imageFiles.length);
      setTotalSize(imageFiles.reduce((total, file) => total + file.size, 0));

      onDrop(imageFiles);

      // Limpiar el contador después de un momento para mostrar que se procesaron
      setTimeout(() => {
        setFileCount(0);
        setTotalSize(0);
      }, 2000);
    },
    [onDrop]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <BlockStack gap="300">
      <DropZone allowMultiple={allowMultipleSelection} onDrop={handleDropZoneDrop} accept="image/*">
        <DropZone.FileUpload actionHint="o arrástralos y suéltalos" />
      </DropZone>

      {/* Contador simple y limpio */}
      {fileCount > 0 && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#f6f6f7',
            borderRadius: '8px',
            border: '1px solid #e1e3e5',
          }}>
          <InlineStack gap="200" align="center">
            <Icon source={ImageIcon} tone="subdued" />
            <BlockStack gap="050">
              <Text as="p" variant="bodySm" fontWeight="medium">
                {fileCount} imagen{fileCount !== 1 ? 'es' : ''} seleccionada
                {fileCount !== 1 ? 's' : ''}
              </Text>
              {totalSize > 0 && (
                <Text as="p" variant="bodySm" tone="subdued">
                  Tamaño total: {formatFileSize(totalSize)}
                </Text>
              )}
            </BlockStack>
            <Text as="p" variant="bodySm" tone="success">
              ✓ Listo para subir
            </Text>
          </InlineStack>
        </div>
      )}
    </BlockStack>
  );
}
