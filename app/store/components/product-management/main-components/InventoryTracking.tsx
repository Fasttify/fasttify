import { LegacyCard, EmptyState, Spinner, Page, Layout, Button } from '@shopify/polaris'
import InventoryHeader from '@/app/store/components/product-management/inventory/inventory-header'
import InventoryFilter from '@/app/store/components/product-management/inventory/inventory-filter'
import InventoryActions from '@/app/store/components/product-management/inventory/inventory-actions'
import InventoryTable from '@/app/store/components/product-management/inventory/inventory-table'
import InventoryFooter from '@/app/store/components/product-management/inventory/inventory-footer'
import { ProductPagination } from '@/app/store/components/product-management/product-table/product-pagination'
import { InventoryRowProps } from '@/app/store/components/product-management/inventory/inventory-table'
import { routes } from '@/utils/routes'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'

interface InventoryTrackingProps {
  data: InventoryRowProps[]
  loading: boolean
  error: Error | null
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: () => void
  previousPage: () => void
  refreshInventory: () => void
  currentPage: number
}

export function InventoryTracking({
  data,
  loading,
  error,
  hasNextPage,
  hasPreviousPage,
  nextPage,
  previousPage,
  currentPage,
}: InventoryTrackingProps) {
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()
  const storeId = getStoreId(params, pathname)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    return data.filter(
      item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [data, searchQuery])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spinner accessibilityLabel="Cargando inventario" size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <LegacyCard>
        <EmptyState
          heading="Error al cargar el inventario"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          fullWidth
        >
          <p>Ha ocurrido un error al cargar los datos del inventario.</p>
        </EmptyState>
      </LegacyCard>
    )
  }

  if (data.length === 0) {
    return (
      <>
        <div className="flex items-center justify-between ">
          <div className="flex items-center justify-between mb-6">
            <InventoryHeader />
          </div>
        </div>
        <LegacyCard>
          <EmptyState
            heading="Sin productos en inventario"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            fullWidth
          >
            <p>No hay productos disponibles en el inventario.</p>
            <Button
              variant="primary"
              onClick={() => router.push(routes.store.products.main(storeId))}
            >
              Ir a productos
            </Button>
          </EmptyState>
        </LegacyCard>
      </>
    )
  }

  return (
    <div className="w-full mt-8">
      {/* Custom Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <InventoryHeader />
        </div>
        <InventoryActions />
      </div>

      <LegacyCard>
        <LegacyCard.Section>
          <InventoryFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </LegacyCard.Section>

        <InventoryTable data={filteredData} />

        {!loading && !error && filteredData.length > 0 && (
          <LegacyCard.Section>
            <ProductPagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              onNext={nextPage}
              onPrevious={previousPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              currentItemsCount={filteredData.length}
            />
          </LegacyCard.Section>
        )}

        <LegacyCard.Section>
          <InventoryFooter />
        </LegacyCard.Section>
      </LegacyCard>
    </div>
  )
}
