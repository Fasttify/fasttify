import { useProducts } from '@/app/store/hooks/useProducts'
import { ProductForm } from '@/app/store/components/product-management/main-components/ProductForm'
import { ProductList } from '@/app/store/components/product-management/main-components/ProductList'
import { ProductsPage } from '@/app/store/components/product-management/main-components/ProductPage'
import { Loader } from '@/components/ui/loader'

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
      <div className="py-20">
        <Loader color="black" size="large" centered text="Cargando nuevos productos..." />
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
