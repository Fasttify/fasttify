import InventoryHeader from '@/app/store/components/product-management/inventory/inventory-header'
import InventoryFilter from '@/app/store/components/product-management/inventory/inventory-filter'
import InventoryActions from '@/app/store/components/product-management/inventory/inventory-actions'
import InventoryTable from '@/app/store/components/product-management/inventory/inventory-table'
import InventoryFooter from '@/app/store/components/product-management/inventory/inventory-footer'
import { ProductPagination } from '@/app/store/components/product-management/product-table/product-pagination'
import { InventoryRowProps } from '@/app/store/components/product-management/inventory/inventory-table-row'

interface InventoryTrackingProps {
  data: InventoryRowProps[]
  loading: boolean
  error: Error | null
  hasNextPage: boolean
  loadNextPage: () => void
  refreshInventory: () => void
  currentPage: number
  totalPages: number
  itemsPerPage: number
  setItemsPerPage: (value: number) => void
  handlePageChange: (page: number) => void
  loadingMoreProducts: boolean
}

export function InventoryTracking({
  data,
  loading,
  error,
  hasNextPage,
  currentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  handlePageChange,
  loadingMoreProducts,
}: InventoryTrackingProps) {
  return (
    <div className="w-full bg-white rounded-lg shadow-sm border mt-4 sm:mt-8">
      <div className="p-3 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-6">
        {/* Header con título y acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
          <InventoryHeader />
          <InventoryActions />
        </div>
        <InventoryFilter />
        <InventoryTable data={data} />

        {/* Paginación */}
        {!loading && !error && data.length > 0 && (
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            handlePageChange={handlePageChange}
            totalItems={data.length}
            loadingMoreProducts={loadingMoreProducts}
            hasNextPage={hasNextPage}
          />
        )}

        <InventoryFooter />
      </div>
    </div>
  )
}
