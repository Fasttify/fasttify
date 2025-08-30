import { IProduct } from '@/app/store/components/product-management/collections/types/collection-types';
import {
  formatPrice,
  getProductImageUrl,
} from '@/app/store/components/product-management/collections/utils/collectionUtils';
import { ProductPagination } from '@/app/store/components/product-management/products/components/listing/ProductPagination';
import {
  Box,
  EmptyState,
  Modal,
  ResourceItem,
  ResourceList,
  Spinner,
  Text,
  TextField,
  Thumbnail,
  Icon,
} from '@shopify/polaris';
import { SearchIcon, ImageIcon } from '@shopify/polaris-icons';

interface ProductSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  products: IProduct[];
  selectedProductIds: string[];
  onProductSelect: (productId: string[]) => void;
  onConfirm: () => void;
  loading: boolean;
  // Propiedades de paginación
  currentPage: number;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
}

export function ProductSelectionDialog({
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  products,
  selectedProductIds,
  onProductSelect,
  onConfirm,
  loading,
  // Propiedades de paginación
  currentPage,
  itemsPerPage,
  setItemsPerPage,
  hasNextPage,
  hasPreviousPage,
  nextPage,
  previousPage,
}: ProductSelectionDialogProps) {
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
    <Modal
      size="large"
      open={isOpen}
      onClose={onClose}
      title="Seleccionar productos"
      primaryAction={{
        content: 'Confirmar selección',
        onAction: onConfirm,
        disabled: loading,
      }}
      secondaryActions={[
        {
          content: 'Cancelar',
          onAction: onClose,
        },
      ]}>
      <Modal.Section>
        <TextField
          label="Buscar productos"
          labelHidden
          placeholder="Buscar productos"
          value={searchTerm}
          onChange={onSearchChange}
          prefix={<SearchIcon />}
          autoComplete="off"
        />
      </Modal.Section>
      <Modal.Section>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <Spinner accessibilityLabel="Cargando productos" size="small" />
          </div>
        ) : (
          <ResourceList
            resourceName={{ singular: 'producto', plural: 'productos' }}
            items={products}
            selectedItems={selectedProductIds}
            onSelectionChange={onProductSelect}
            selectable
            renderItem={(item) => {
              const { id, name, price } = item;
              const media = renderMedia(item);

              return (
                <ResourceItem
                  id={id}
                  media={media}
                  accessibilityLabel={`Ver detalles de ${name}`}
                  onClick={() => {
                    onProductSelect([id]);
                  }}>
                  <Text variant="bodyMd" fontWeight="bold" as="h3">
                    {name}
                  </Text>
                  <div>{formatPrice(price)}</div>
                </ResourceItem>
              );
            }}
            emptyState={
              hasPreviousPage ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text variant="bodyMd" tone="subdued" as="p">
                    No hay productos en esta página. Usa la paginación para navegar a otras páginas.
                  </Text>
                </div>
              ) : (
                <EmptyState
                  heading="No se encontraron productos"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
                  <p>Prueba con un término de búsqueda diferente.</p>
                </EmptyState>
              )
            }
          />
        )}
      </Modal.Section>
      {!loading && (products.length > 0 || hasPreviousPage) && (
        <Modal.Section>
          <Box padding="300" background="bg-surface">
            <ProductPagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              onNext={nextPage}
              onPrevious={previousPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              currentItemsCount={products.length}
            />
          </Box>
        </Modal.Section>
      )}
    </Modal>
  );
}
