import { ProductForm } from '@/app/store/components/product-management/products/components/form/ProductForm';
import { ProductList } from '@/app/store/components/product-management/products/components/listing/ProductList';
import { ProductsPage } from '@/app/store/components/product-management/products/pages/ProductPage';
import { useProducts } from '@/app/store/hooks/data/useProducts';
import { Loading } from '@shopify/polaris';
import { useState } from 'react';

interface ProductManagerProps {
  storeId: string;
  productId?: string;
}

export function ProductManager({ storeId, productId }: ProductManagerProps) {
  const [itemsPerPage, setItemsPerPage] = useState(50);

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
    duplicateProduct,
  } = useProducts(storeId, { limit: itemsPerPage });

  if (productId) {
    return <ProductForm storeId={storeId} productId={productId} />;
  }

  if (loading) {
    return <Loading />;
  }

  return products.length === 0 && !loading && !hasPreviousPage ? (
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
      duplicateProduct={duplicateProduct}
      itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
    />
  );
}

export default ProductManager;
