import { Card } from '@shopify/polaris'
import { useRef, useState } from 'react'
import { useProducts } from '@/app/store/hooks/useProducts'
import { ProductSectionProps } from '@/app/store/components/product-management/collections/types/collection-types'
import { useProductSelection } from '@/app/store/components/product-management/collections/hooks/useProductSelection'
import { ProductControls } from '@/app/store/components/product-management/collections/components/form/ProductControls'
import { SelectedProductsList } from '@/app/store/components/product-management/collections/components/form/SelectedProductsList'
import { ProductSelectionDialog } from '@/app/store/components/product-management/collections/components/form/ProductSelectionDialog'
import useStoreDataStore from '@/context/core/storeDataStore'

export function ProductSection({
  selectedProducts = [],
  onAddProduct,
  onRemoveProduct,
}: ProductSectionProps) {
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const { storeId } = useStoreDataStore()
  const fetchTriggered = useRef(false)

  const {
    products,
    loading,
    refreshProducts,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    currentPage,
  } = useProducts(storeId ?? undefined, {
    limit: itemsPerPage,
    sortDirection: 'DESC',
    sortField: 'createdAt',
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
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        nextPage={nextPage}
        previousPage={previousPage}
      />
    </>
  )
}
