import { Card } from '@shopify/polaris'
import { useRef } from 'react'
import { useProducts } from '@/app/store/hooks/useProducts'
import useStoreDataStore from '@/context/core/storeDataStore'
import { ProductSectionProps } from '@/app/store/components/product-management/collection-form/types/productTypes'
import { useProductSelection } from '@/app/store/components/product-management/collection-form/hooks/useProductSelection'
import { ProductControls } from '@/app/store/components/product-management/collection-form/components/ProductControls'
import { SelectedProductsList } from '@/app/store/components/product-management/collection-form/components/SelectedProductsList'
import { ProductSelectionDialog } from '@/app/store/components/product-management/collection-form/components/ProductSelectionDialog'

export function ProductSection({
  selectedProducts = [],
  onAddProduct,
  onRemoveProduct,
}: ProductSectionProps) {
  const { storeId } = useStoreDataStore()
  const fetchTriggered = useRef(false)

  const { products, loading, refreshProducts } = useProducts(storeId ?? undefined, {
    limit: 100,
    sortDirection: 'DESC',
    sortField: 'createdAt',
    enabled: false,
  })

  const {
    isDialogOpen,
    searchTerm,
    sortOption,
    dialogSelectedProducts,
    filteredAndSortedProducts,
    setSearchTerm,
    setSortOption,
    handleProductSelect,
    handleConfirmSelection,
    openDialog,
    closeDialog,
  } = useProductSelection({
    products,
    selectedProducts,
    onAddProduct,
    onRemoveProduct,
  })

  const handleOpenDialog = () => {
    if (!fetchTriggered.current) {
      refreshProducts()
      fetchTriggered.current = true
    }
    openDialog()
  }

  return (
    <>
      <Card>
        <ProductControls
          searchTerm={searchTerm}
          sortOption={sortOption}
          onSearchChange={setSearchTerm}
          onSortChange={setSortOption}
          onOpenDialog={handleOpenDialog}
        />

        <SelectedProductsList
          selectedProducts={selectedProducts}
          onRemoveProduct={onRemoveProduct}
          onOpenDialog={handleOpenDialog}
        />
      </Card>

      <ProductSelectionDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        products={filteredAndSortedProducts}
        selectedProductIds={dialogSelectedProducts}
        onProductSelect={handleProductSelect}
        onConfirm={handleConfirmSelection}
        loading={loading}
      />
    </>
  )
}
