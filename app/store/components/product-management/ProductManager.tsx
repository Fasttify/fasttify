import { useProducts } from '@/app/store/hooks/useProducts'
import { ProductForm } from './ProductForm'
import { ProductList } from './ProductList'
import { ProductsPage } from './ProductPage'
import { Skeleton } from '@/components/ui/skeleton'

interface ProductManagerProps {
  storeId: string
  productId?: string
}

export function ProductManager({ storeId, productId }: ProductManagerProps) {
  const {
    products,
    loading,
    paginationLoading,
    error,
    hasNextPage,
    loadNextPage,
    deleteMultipleProducts,
    refreshProducts,
    deleteProduct,
  } = useProducts(storeId)

  if (productId) {
    return <ProductForm storeId={storeId} productId={productId} />
  }

  if (loading) {
    return (
      <div className="mt-8">
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-4 mb-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  return products.length === 0 ? (
    <ProductsPage />
  ) : (
    <ProductList
      storeId={storeId}
      products={products}
      loading={paginationLoading}
      error={error}
      hasNextPage={hasNextPage}
      loadNextPage={loadNextPage}
      deleteMultipleProducts={deleteMultipleProducts}
      refreshProducts={refreshProducts}
      deleteProduct={deleteProduct}
    />
  )
}

export default ProductManager
