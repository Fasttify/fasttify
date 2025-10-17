'use client';

import { BlockStack, Button, InlineStack, Modal, Text } from '@shopify/polaris';
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
        <Modal open={showActivateModal} onClose={onCloseActivateModal} title="Activar tema" size="small">
          <Modal.Section>
            <BlockStack gap="400">
              <Text as="p" variant="bodyMd">
                ¿Estás seguro de que quieres activar el tema &quot;{selectedTheme.name}&quot;?
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Este tema reemplazará el tema actualmente activo.
              </Text>
            </BlockStack>
          </Modal.Section>
          <Modal.Section>
            <InlineStack align="end" gap="200">
              <Button onClick={onCloseActivateModal} disabled={isActivating} size="slim">
                Cancelar
              </Button>
              <Button
                variant="primary"
                icon={StatusActiveIcon}
                onClick={onConfirmActivate}
                loading={isActivating}
                disabled={isActivating}
                size="slim">
                Activar
              </Button>
            </InlineStack>
          </Modal.Section>
        </Modal>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedTheme && (
        <Modal open={showDeleteModal} onClose={onCloseDeleteModal} title="Eliminar tema" size="small">
          <Modal.Section>
            <BlockStack gap="400">
              <Text as="p" variant="bodyMd">
                ¿Estás seguro de que quieres eliminar el tema &quot;{selectedTheme.name}&quot;?
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Esta acción no se puede deshacer. El tema se eliminará permanentemente.
              </Text>
            </BlockStack>
          </Modal.Section>
          <Modal.Section>
            <InlineStack align="end" gap="200">
              <Button onClick={onCloseDeleteModal} disabled={isDeleting} size="slim">
                Cancelar
              </Button>
              <Button
                variant="primary"
                tone="critical"
                icon={DeleteIcon}
                onClick={onConfirmDelete}
                loading={isDeleting}
                disabled={isDeleting}
                size="slim">
                Eliminar
              </Button>
            </InlineStack>
          </Modal.Section>
        </Modal>
      )}
    </>
  );
}
