import { ResourceList, ResourceItem, Thumbnail, Text, EmptyState, Icon } from '@shopify/polaris';
import { ImageIcon } from '@shopify/polaris-icons';
import { IProduct } from '@/app/store/components/product-management/collections/types/collection-types';
import { getProductImageUrl } from '@/app/store/components/product-management/collections/utils/collectionUtils';

interface SelectedProductsListProps {
  selectedProducts: IProduct[];
  onRemoveProduct: (productId: string) => void;
  onOpenDialog: () => void;
}

export function SelectedProductsList({ selectedProducts, onRemoveProduct, onOpenDialog }: SelectedProductsListProps) {
  // Función para renderizar el media con fallback
  const renderMedia = (product: IProduct) => {
    const imageUrl = getProductImageUrl(product);

    if (imageUrl) {
      return <Thumbnail source={imageUrl} alt={product.name} />;
    }

    // Fallback cuando no hay imagen
    return (
      <div
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#f6f6f7',
          borderRadius: 'var(--p-border-radius-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #e1e3e5',
        }}>
        <Icon source={ImageIcon} tone="subdued" />
      </div>
    );
  };

  return (
    <ResourceList
      resourceName={{ singular: 'producto', plural: 'productos' }}
      items={selectedProducts}
      renderItem={(item) => {
        const { id, name } = item;

        return (
          <ResourceItem
            id={id}
            media={renderMedia(item)}
            onClick={() => onOpenDialog()}
            accessibilityLabel={`Ver detalles de ${name}`}
            shortcutActions={[
              {
                content: 'Eliminar',
                onAction: () => onRemoveProduct(id),
              },
            ]}>
            <Text variant="bodyMd" fontWeight="bold" as="h3">
              {name}
            </Text>
          </ResourceItem>
        );
      }}
      emptyState={
        <EmptyState
          heading="No hay productos en esta colección"
          action={{
            content: 'Añadir productos',
            onAction: onOpenDialog,
          }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
          <p>Añade productos para empezar a construir tu colección.</p>
        </EmptyState>
      }
    />
  );
}
