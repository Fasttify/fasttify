import { DropZone, Text, BlockStack, InlineStack, Icon } from '@shopify/polaris';
import { ImageIcon } from '@shopify/polaris-icons';
import { isValidMediaFile } from '@/lib/utils/validation-utils';
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
      const mediaFiles = acceptedFiles.filter((file) => isValidMediaFile(file));

      setFileCount(mediaFiles.length);
      setTotalSize(mediaFiles.reduce((total, file) => total + file.size, 0));

      onDrop(mediaFiles);

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
      <DropZone allowMultiple={allowMultipleSelection} onDrop={handleDropZoneDrop} accept="image/*,video/*,audio/*">
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
                {fileCount} archivo{fileCount !== 1 ? 's' : ''} seleccionado{fileCount !== 1 ? 's' : ''}
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
