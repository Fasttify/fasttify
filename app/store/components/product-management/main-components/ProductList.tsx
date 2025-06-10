import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { routes } from '@/utils/routes'
import { useState } from 'react'
import { Box, Button, ButtonGroup, LegacyCard, Text } from '@shopify/polaris'
import { handleExportProducts } from '@/app/store/components/product-management/utils/product-utils'

// Hooks
import { useProductFilters } from '@/app/store/components/product-management/hooks/useProductFilters'
import { useProductSelection } from '@/app/store/components/product-management/hooks/useProductSelection'

// Components
import { ProductFilters } from '@/app/store/components/product-management/product-table/product-filters'
import { ProductPagination } from '@/app/store/components/product-management/product-table/product-pagination'
import { ProductTableDesktop } from '@/app/store/components/product-management/product-table/product-table-desktop'
import { ProductCardMobile } from '@/app/store/components/product-management/product-table/product-card-mobile'
import { ProductEmptyState } from '@/app/store/components/product-management/product-table/product-empty-state'
import { ProductIcon } from '@shopify/polaris-icons'

// Types
import type { ProductListProps } from '@/app/store/components/product-management/types/product-types'

export function ProductList({
  storeId,
  products,
  loading,
  error,
  hasNextPage,
  hasPreviousPage,
  nextPage,
  previousPage,
  currentPage,
  deleteMultipleProducts,
  refreshProducts,
  deleteProduct,
  itemsPerPage,
  setItemsPerPage,
}: ProductListProps) {
  const router = useRouter()

  // Hooks para manejar diferentes aspectos de la tabla
  const { setSelectedProducts } = useProductSelection()
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    sortedProducts,
    toggleSort,
    renderSortIndicator,
    sortDirection,
    sortField,
  } = useProductFilters(products)

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

  const handleDeleteSelected = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return

    if (confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} productos?`)) {
      const success = await deleteMultipleProducts(selectedIds)
      if (success) {
        toast.success(`${selectedIds.length} productos eliminados correctamente`)
        setSelectedProducts([])
      } else {
        toast.error(`Error al eliminar algunos productos`)
      }
    }
  }

  if (error) {
    return <ProductEmptyState handleAddProduct={handleAddProduct} error={error} />
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
        }}
      >
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
          <Button onClick={() => handleExportProducts(products, [])}>Exportar</Button>
          <Button variant="primary" onClick={handleAddProduct}>
            Añadir producto
          </Button>
        </ButtonGroup>
      </div>
      <LegacyCard>
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
          sortField={sortField}
        />

        {/* Vista móvil */}
        <div className="sm:hidden">
          <ProductCardMobile
            products={sortedProducts}
            selectedProducts={[]}
            handleSelectProduct={() => {}}
            handleEditProduct={handleEditProduct}
            handleDeleteProduct={handleDeleteProduct}
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
      </LegacyCard>
    </div>
  )
}
