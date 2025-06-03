import { useProducts } from '@/app/store/hooks/useProducts'
import useStoreDataStore from '@/context/core/storeDataStore'
import { ProductSectionProps } from './types/productTypes'
import { useProductSelection } from './hooks/useProductSelection'
import { ProductControls } from './components/ProductControls'
import { SelectedProductsList } from './components/SelectedProductsList'
import { ProductSelectionDialog } from './components/ProductSelectionDialog'

export function ProductSection({
  selectedProducts = [],
  onAddProduct,
  onRemoveProduct,
}: ProductSectionProps) {
  const { storeId } = useStoreDataStore()

  const { products, loading } = useProducts(storeId ?? undefined, {
    limit: 100,
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

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-medium mb-4">Productos</h2>

        <ProductControls
          searchTerm={searchTerm}
          sortOption={sortOption}
          onSearchChange={setSearchTerm}
          onSortChange={setSortOption}
          onOpenDialog={openDialog}
        />

        <SelectedProductsList
          selectedProducts={selectedProducts}
          onRemoveProduct={onRemoveProduct}
          onOpenDialog={openDialog}
        />
      </div>

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
