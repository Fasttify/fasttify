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
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';

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
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spinner accessibilityLabel="Cargando productos" size="large" />
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
              const imageUrl = getProductImageUrl(item);
              const media = <Thumbnail source={imageUrl || ''} alt={name} />;

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
              <EmptyState
                heading="No se encontraron productos"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
                <p>Prueba con un término de búsqueda diferente.</p>
              </EmptyState>
            }
          />
        )}
      </Modal.Section>
      {!loading && products.length > 0 && (
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
