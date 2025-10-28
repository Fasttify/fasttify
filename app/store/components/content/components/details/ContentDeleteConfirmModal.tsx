'use client';

import { Modal, BlockStack, Text, Button } from '@shopify/polaris';

interface ContentDeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileCount: number;
}

export function ContentDeleteConfirmModal({ open, onClose, onConfirm, fileCount }: ContentDeleteConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Eliminar ${fileCount} archivo${fileCount > 1 ? 's' : ''}?`}
      primaryAction={{
        content: 'Eliminar',
        destructive: true,
        onAction: handleConfirm,
      }}
      secondaryActions={[
        {
          content: 'Cancelar',
          onAction: onClose,
        },
      ]}>
      <Modal.Section>
        <BlockStack gap="400">
          <Text variant="bodyMd" as="p">
            Esta acción no se puede deshacer. El archivo{fileCount > 1 ? 's' : ''} será eliminado de todos los lugares
            donde se esté usando en tu tienda.
          </Text>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
