import { useProducts } from '@/app/store/hooks/data/useProducts'
import { InventoryTracking } from '@/app/store/components/product-management/inventory/pages/InventoryTracking'
import { InventoryPage } from '@/app/store/components/product-management/inventory/pages/InventoryPage'
import { Loading } from '@shopify/polaris'
interface InventoryManagerProps {
  storeId: string
}

export function InventoryManager({ storeId }: InventoryManagerProps) {
  const {
    products,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    currentPage,
    refreshProducts,
  } = useProducts(storeId)

  // Transformar los productos al formato de inventario
  const inventoryData = products.map(product => {
    let images: { url: string; alt?: string }[] | undefined

    if (typeof product.images === 'string') {
      try {
        const parsedImages = JSON.parse(product.images)
        if (Array.isArray(parsedImages)) {
          images = parsedImages
        }
      } catch (e) {
        images = undefined
      }
    } else if (Array.isArray(product.images)) {
      images = product.images.map(img => (typeof img === 'string' ? { url: img } : img))
    }

    return {
      id: product.id,
      name: product.name,
      sku: product.sku || 'Sin SKU',
      images: images,
      unavailable: 0,
      committed: 0,
      available: product.quantity || 0,
      inStock: product.quantity || 0,
    }
  })

  if (loading) {
    return <Loading />
  }

  return inventoryData.length === 0 ? (
    <InventoryPage />
  ) : (
    <InventoryTracking
      data={inventoryData}
      loading={loading}
      error={error}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      nextPage={nextPage}
      previousPage={previousPage}
      refreshInventory={refreshProducts}
      currentPage={currentPage}
    />
  )
}

export default InventoryManager
