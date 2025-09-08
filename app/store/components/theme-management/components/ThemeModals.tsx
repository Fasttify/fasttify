'use client';

import { BlockStack, Button, Modal, Text } from '@shopify/polaris';
import { DeleteIcon, StatusActiveIcon } from '@shopify/polaris-icons';

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

interface ThemeModalsProps {
  selectedTheme: Theme | null;
  showActivateModal: boolean;
  showDeleteModal: boolean;
  isActivating: boolean;
  isDeleting: boolean;
  onCloseActivateModal: () => void;
  onCloseDeleteModal: () => void;
  onConfirmActivate: () => void;
  onConfirmDelete: () => void;
}

export function ThemeModals({
  selectedTheme,
  showActivateModal,
  showDeleteModal,
  isActivating,
  isDeleting,
  onCloseActivateModal,
  onCloseDeleteModal,
  onConfirmActivate,
  onConfirmDelete,
}: ThemeModalsProps) {
  return (
    <>
      {/* Modal de confirmación de activación */}
      {showActivateModal && selectedTheme && (
        <Modal
          open={showActivateModal}
          onClose={onCloseActivateModal}
          title="Activar tema"
          primaryAction={{
            content: 'Activar',
            onAction: onConfirmActivate,
            icon: StatusActiveIcon,
            loading: isActivating,
            disabled: isActivating,
          }}
          secondaryActions={[
            {
              content: 'Cancelar',
              onAction: onCloseActivateModal,
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
          onClose={onCloseDeleteModal}
          title="Eliminar tema"
          primaryAction={{
            content: 'Eliminar',
            onAction: onConfirmDelete,
            destructive: true,
            icon: DeleteIcon,
            loading: isDeleting,
            disabled: isDeleting,
          }}
          secondaryActions={[
            {
              content: 'Cancelar',
              onAction: onCloseDeleteModal,
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
