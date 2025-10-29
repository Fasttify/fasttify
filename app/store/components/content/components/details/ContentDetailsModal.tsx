'use client';

import { Modal, Thumbnail, Text } from '@shopify/polaris';
import type { S3Image } from '@/app/store/components/images-selector/types/s3-types';
import { formatFileSize, formatDate, getFileName } from '@/app/store/components/content/utils/content-utils';

interface ContentDetailsModalProps {
  image: S3Image | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function ContentDetailsModal({ image, open, onClose, onDelete }: ContentDetailsModalProps) {
  if (!image) return null;

  const handleDelete = () => {
    if (image.id || image.key) {
      onDelete(image.id || image.key);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalles del archivo"
      primaryAction={{
        content: 'Cerrar',
        onAction: onClose,
      }}
      secondaryActions={[
        {
          content: 'Eliminar',
          destructive: true,
          onAction: handleDelete,
        },
      ]}>
      <Modal.Section>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Thumbnail source={image.url} alt={image.filename} size="large" />
            <div>
              <Text variant="headingMd" as="h2">
                {getFileName(image.filename)}
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                {formatFileSize(image.size)}
              </Text>
            </div>
          </div>

          <div className="space-y-2">
            <Text variant="bodySm" fontWeight="semibold" as="span">
              URL:
            </Text>
            <Text variant="bodySm" as="span" tone="subdued">
              {image.url}
            </Text>
          </div>

          <div className="space-y-2">
            <Text variant="bodySm" fontWeight="semibold" as="span">
              Fecha de subida:
            </Text>
            <Text variant="bodySm" as="span" tone="subdued">
              {formatDate(image.lastModified)}
            </Text>
          </div>

          <div className="space-y-2">
            <Text variant="bodySm" fontWeight="semibold" as="span">
              Tipo:
            </Text>
            <Text variant="bodySm" as="span" tone="subdued">
              {image.type || 'N/A'}
            </Text>
          </div>
        </div>
      </Modal.Section>
    </Modal>
  );
}
