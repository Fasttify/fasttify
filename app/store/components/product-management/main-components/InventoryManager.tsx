import { useProducts } from '@/app/store/hooks/useProducts'
import { InventoryTracking } from '@/app/store/components/product-management/main-components/InventoryTracking'
import { InventoryPage } from '@/app/store/components/product-management/main-components/InventoryPage'
import { Loader } from '@/components/ui/loader'
import { useProductPagination } from '@/app/store/components/product-management/hooks/useProductPagination'

interface InventoryManagerProps {
  storeId: string
}

export function InventoryManager({ storeId }: InventoryManagerProps) {
  const {
    products,
    loading,
    paginationLoading,
    error,
    hasNextPage,
    loadNextPage,
    refreshProducts,
  } = useProducts(storeId)

  // Transformar los productos al formato de inventario
  const inventoryData = products.map(product => ({
    id: product.id,
    name: product.name,
    sku: product.sku || `SKU-${product.id}`,
    images: product.images,
    unavailable: 0,
    committed: 0,
    available: product.quantity || 0,
    inStock: product.quantity || 0,
  }))

  const {
    currentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedProducts,
    loadingMoreProducts,
    handlePageChange,
  } = useProductPagination({
    sortedProducts: inventoryData,
    hasNextPage,
    loadNextPage,
  })

  if (loading) {
    return (
      <div className="py-20">
        <Loader color="black" size="large" centered text="Cargando inventario..." />
      </div>
    )
  }

  return inventoryData.length === 0 ? (
    <InventoryPage />
  ) : (
    <InventoryTracking
      data={paginatedProducts}
      loading={paginationLoading}
      error={error}
      hasNextPage={hasNextPage}
      loadNextPage={loadNextPage}
      refreshInventory={refreshProducts}
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
      handlePageChange={handlePageChange}
      loadingMoreProducts={loadingMoreProducts}
    />
  )
}

export default InventoryManager
