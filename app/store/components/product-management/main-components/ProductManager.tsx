import { useProducts } from '@/app/store/hooks/useProducts'
import { ProductForm } from '@/app/store/components/product-management/main-components/ProductForm'
import { ProductList } from '@/app/store/components/product-management/main-components/ProductList'
import { ProductsPage } from '@/app/store/components/product-management/main-components/ProductPage'
import { useState } from 'react'
import { ProductPageSkeleton } from '@/app/store/components/product-management/main-components/ProductPageSkeleton'

interface ProductManagerProps {
  storeId: string
  productId?: string
}

export function ProductManager({ storeId, productId }: ProductManagerProps) {
  const [itemsPerPage, setItemsPerPage] = useState(50)

  const {
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
  } = useProducts(storeId, { limit: itemsPerPage })

  if (productId) {
    return <ProductForm storeId={storeId} productId={productId} />
  }

  if (loading) {
    return <ProductPageSkeleton />
  }

  return products.length === 0 && !loading ? (
    <ProductsPage />
  ) : (
    <ProductList
      hasPreviousPage={hasPreviousPage}
      storeId={storeId}
      products={products}
      loading={loading}
      error={error}
      hasNextPage={hasNextPage}
      nextPage={nextPage}
      previousPage={previousPage}
      currentPage={currentPage}
      deleteMultipleProducts={deleteMultipleProducts}
      refreshProducts={refreshProducts}
      deleteProduct={deleteProduct}
      itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
    />
  )
}

export default ProductManager
