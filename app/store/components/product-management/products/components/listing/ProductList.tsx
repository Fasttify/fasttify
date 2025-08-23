import { handleExportProducts } from '@/app/store/components/product-management/utils/product-utils';
import { routes } from '@/utils/client/routes';
import { Box, Button, ButtonGroup, Card, Text } from '@shopify/polaris';
import { useRouter } from 'next/navigation';

// Hooks
import { useProductDuplication } from '@/app/store/components/product-management/products/hooks/useProductDuplication';
import { useProductFilters } from '@/app/store/components/product-management/products/hooks/useProductFilters';
import { useProductSelection } from '@/app/store/components/product-management/products/hooks/useProductSelection';

// Components
import { DuplicateConfirmModal } from '@/app/store/components/product-management/products/components/listing/DuplicateConfirmModal';
import { ProductCardMobile } from '@/app/store/components/product-management/products/components/listing/ProductCardMobile';
import { ProductEmptyState } from '@/app/store/components/product-management/products/components/listing/ProductEmtyState';
import { ProductFilters } from '@/app/store/components/product-management/products/components/listing/ProductFilters';
import { ProductPagination } from '@/app/store/components/product-management/products/components/listing/ProductPagination';
import { ProductTableDesktop } from '@/app/store/components/product-management/products/components/listing/ProductTableDesktop';
import { useToast } from '@/app/store/context/ToastContext';
import { ProductIcon } from '@shopify/polaris-icons';

// Types
import type { ProductListProps } from '@/app/store/components/product-management/products/types/product-types';

export function ProductList({
  storeId,
  products,
  error,
  hasNextPage,
  hasPreviousPage,
  nextPage,
  previousPage,
  currentPage,
  deleteMultipleProducts,
  deleteProduct,
  duplicateProduct,
  itemsPerPage,
  setItemsPerPage,
}: ProductListProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // Hooks para manejar diferentes aspectos de la tabla
  const { selectedProducts, handleSelectProduct, setSelectedProducts } = useProductSelection();
  const { activeTab, setActiveTab, searchQuery, setSearchQuery, sortedProducts, toggleSort, sortDirection, sortField } =
    useProductFilters(products);

  // Hook para manejar duplicación de productos
  const {
    isDuplicating,
    duplicatingProductId,
    showConfirmModal,
    pendingProduct,
    handleDuplicateProduct,
    confirmDuplication,
    cancelDuplication,
  } = useProductDuplication({
    duplicateProduct,
    onSuccess: (duplicatedProduct) => {
      // Opcional: redirigir al producto duplicado para editarlo
      // router.push(routes.store.products.edit(storeId, duplicatedProduct.id));//
    },
  });

  // Funciones de navegación y acciones
  const handleAddProduct = () => {
    router.push(routes.store.products.add(storeId));
  };

  const handleEditProduct = (id: string) => {
    router.push(routes.store.products.edit(storeId, id));
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      const success = await deleteProduct(id);
      if (success) {
        showToast('Producto eliminado correctamente');
        setSelectedProducts((prev) => prev.filter((productId) => productId !== id));
      } else {
        showToast('Error al eliminar el producto');
      }
    }
  };

  const handleDuplicateProductWithName = (id: string) => {
    const product = products.find((p) => p.id === id);
    handleDuplicateProduct(id, product?.name);
  };

  const handleDeleteSelected = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;

    if (confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} productos?`)) {
      const success = await deleteMultipleProducts(selectedIds);
      if (success) {
        showToast(`${selectedIds.length} productos eliminados correctamente`);
        setSelectedProducts([]);
      } else {
        showToast(`Error al eliminar algunos productos`);
      }
    }
  };

  if (error) {
    return <ProductEmptyState handleAddProduct={handleAddProduct} error={error} />;
  }

  return (
    <div className="w-full mt-8">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
        <div className=" flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ProductIcon width={20} height={20} />
            <Text as="h1" variant="headingLg" fontWeight="regular">
              Productos
            </Text>
          </div>
          <Text as="p" variant="bodyMd" tone="subdued">
            Administra y controla tus productos en tiempo real.
          </Text>
        </div>
        <ButtonGroup>
          <Button onClick={() => console.log('Importar productos')}>Importar</Button>
          <Button onClick={() => handleExportProducts(products, [], showToast)}>Exportar</Button>
          <Button variant="primary" onClick={handleAddProduct}>
            Añadir producto
          </Button>
        </ButtonGroup>
      </div>

      <Card>
        <ProductFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <ProductTableDesktop
          products={sortedProducts}
          handleEditProduct={handleEditProduct}
          handleDeleteProduct={handleDeleteProduct}
          handleDuplicateProduct={handleDuplicateProductWithName}
          handleDeleteSelected={handleDeleteSelected}
          visibleColumns={{
            product: true,
            status: true,
            inventory: true,
            price: true,
            category: true,
            actions: true,
          }}
          toggleSort={toggleSort}
          sortDirection={sortDirection === 'asc' ? 'ascending' : 'descending'}
          sortField={sortField ?? 'name'}
          selectedProducts={selectedProducts}
          handleSelectProduct={handleSelectProduct}
        />

        {/* Vista móvil */}
        <div className="sm:hidden">
          <ProductCardMobile
            products={sortedProducts}
            selectedProducts={selectedProducts}
            handleSelectProduct={handleSelectProduct}
            handleEditProduct={handleEditProduct}
            handleDeleteProduct={handleDeleteProduct}
            handleDuplicateProduct={handleDuplicateProductWithName}
            visibleColumns={{
              product: true,
              status: true,
              inventory: true,
              price: true,
              category: true,
              actions: true,
            }}
          />
        </div>

        <Box padding="400" background="bg-surface">
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
      </Card>

      {/* Modal de confirmación de duplicación */}
      {showConfirmModal && pendingProduct && (
        <DuplicateConfirmModal
          open={showConfirmModal}
          onClose={cancelDuplication}
          onConfirm={confirmDuplication}
          productName={pendingProduct.name}
          isLoading={isDuplicating}
        />
      )}
    </div>
  );
}
