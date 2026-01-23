import { BlockStack, Modal, Text } from '@shopify/polaris';
import { DuplicateIcon } from '@shopify/polaris-icons';

interface DuplicateConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  isLoading?: boolean;
}

export function DuplicateConfirmModal({
  open,
  onClose,
  onConfirm,
  productName,
  isLoading = false,
}: DuplicateConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Duplicar producto"
      primaryAction={{
        content: 'Duplicar',
        onAction: onConfirm,
        loading: isLoading,
        icon: DuplicateIcon,
      }}
      secondaryActions={[
        {
          content: 'Cancelar',
          onAction: onClose,
        },
      ]}>
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p">
            ¿Estás seguro de que deseas duplicar el producto <strong>&ldquo;{productName}&rdquo;</strong>?
          </Text>
          <Text as="p" tone="subdued">
            Se creará una copia del producto con el nombre &ldquo;{productName} (Copia)&rdquo; y se establecerá como
            borrador. Podrás editar la copia después de crearla.
          </Text>
          <BlockStack gap="200">
            <Text as="h4" variant="headingSm">
              Lo que se copiará:
            </Text>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Información básica del producto</li>
              <li>Precios y costos</li>
              <li>Imágenes</li>
              <li>Atributos y variantes</li>
              <li>Categoría y colección</li>
            </ul>
            <Text as="h4" variant="headingSm">
              Lo que se reseteará:
            </Text>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Estado (se establecerá como borrador)</li>
              <li>Cantidad en inventario (se establecerá en 0)</li>
              <li>SKU (se agregará &quot;-copy&quot; al final)</li>
              <li>Slug (se agregará &quot;-copy&quot; al final)</li>
            </ul>
          </BlockStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
