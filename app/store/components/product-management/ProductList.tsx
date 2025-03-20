import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { routes } from '@/utils/routes'
import { Loader2 } from 'lucide-react'

// Hooks
import { useProductFilters } from '@/app/store/components/product-management/hooks/useProductFilters'
import { useProductPagination } from '@/app/store/components/product-management/hooks/useProductPagination'
import { useProductSelection } from '@/app/store/components/product-management/hooks/useProductSelection'
import { useResponsiveColumns } from '@/app/store/components/product-management/hooks/useResponsiveColumns'

// Components
import { ProductActions } from '@/app/store/components/product-management/product-table/product-actions'
import { ProductFilters } from '@/app/store/components/product-management/product-table/product-filters'
import { ProductPagination } from '@/app/store/components/product-management/product-table/product-pagination'
import { ProductTableDesktop } from '@/app/store/components/product-management/product-table/product-table-desktop'
import { ProductCardMobile } from '@/app/store/components/product-management/product-table/product-card-mobile'
import { ProductEmptyState } from '@/app/store/components/product-management/product-table/product-empty-state'

// Types
import type { ProductListProps } from '@/app/store/components/product-management/types/product-types'

export function ProductList({
  storeId,
  products,
  loading,
  error,
  hasNextPage,
  loadNextPage,
  deleteMultipleProducts,
  refreshProducts,
  deleteProduct,
}: ProductListProps) {
  const router = useRouter()

  // Hooks para manejar diferentes aspectos de la tabla
  const { visibleColumns, setVisibleColumns } = useResponsiveColumns()
  const { selectedProducts, handleSelectAll, handleSelectProduct, setSelectedProducts } =
    useProductSelection()
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    sortedProducts,
    toggleSort,
    renderSortIndicator,
  } = useProductFilters(products)
  const {
    currentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedProducts,
    loadingMoreProducts,
    handlePageChange,
  } = useProductPagination({
    sortedProducts,
    hasNextPage,
    loadNextPage,
  })

  // Funciones de navegación y acciones
  const handleAddProduct = () => {
    router.push(`/store/${storeId}/products/new`)
  }

  const handleEditProduct = (id: string) => {
    router.push(routes.store.products.edit(storeId, id))
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      const success = await deleteProduct(id)
      if (success) {
        toast.success('Producto eliminado correctamente')
        setSelectedProducts(prev => prev.filter(productId => productId !== id))
      } else {
        toast.error('Error al eliminar el producto')
      }
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) return

    if (confirm(`¿Estás seguro de que deseas eliminar ${selectedProducts.length} productos?`)) {
      const success = await deleteMultipleProducts(selectedProducts)
      if (success) {
        toast.success(`${selectedProducts.length} productos eliminados correctamente`)
        setSelectedProducts([])
      } else {
        toast.error(`Error al eliminar algunos productos`)
      }
    }
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border mt-4 sm:mt-8">
      <div className="p-3 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-6">
        {/* Header con título y acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
          <h1 className="text-xl font-semibold text-gray-800">Productos</h1>
          <ProductActions
            storeId={storeId}
            products={sortedProducts}
            selectedProducts={selectedProducts}
            handleAddProduct={handleAddProduct}
            handleDeleteSelected={handleDeleteSelected}
          />
        </div>

        {/* Filtros y búsqueda */}
        <ProductFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          refreshProducts={refreshProducts}
        />

        {/* Tabla de productos */}
        <div className="rounded-md border">
          {loading && (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-10 w-10 text-[#2a2a2a] animate-spin" />
              <p className="mt-2 text-sm text-muted-foreground">Cargando productos...</p>
            </div>
          )}

          {!loading && !error && sortedProducts.length === 0 && (
            <ProductEmptyState handleAddProduct={handleAddProduct} error={error} />
          )}

          {!loading && !error && sortedProducts.length > 0 && (
            <>
              {/* Vista de escritorio */}
              <ProductTableDesktop
                products={paginatedProducts}
                selectedProducts={selectedProducts}
                handleSelectAll={() => handleSelectAll(paginatedProducts)}
                handleSelectProduct={handleSelectProduct}
                handleEditProduct={handleEditProduct}
                handleDeleteProduct={handleDeleteProduct}
                visibleColumns={visibleColumns}
                toggleSort={toggleSort}
                renderSortIndicator={renderSortIndicator}
              />

              {/* Vista móvil */}
              <ProductCardMobile
                products={paginatedProducts}
                selectedProducts={selectedProducts}
                handleSelectProduct={handleSelectProduct}
                handleEditProduct={handleEditProduct}
                handleDeleteProduct={handleDeleteProduct}
                visibleColumns={visibleColumns}
              />
            </>
          )}
        </div>

        {/* Paginación */}
        {!loading && !error && sortedProducts.length > 0 && (
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            handlePageChange={handlePageChange}
            totalItems={sortedProducts.length}
            loadingMoreProducts={loadingMoreProducts}
            hasNextPage={hasNextPage}
          />
        )}
      </div>
    </div>
  )
}
