import { useState } from 'react';
import type { IProduct } from '@/app/store/hooks/data/useProducts';

export function useProductSelection() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleSelectAll = (products: IProduct[]) => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product) => product.id));
    }
  };

  const handleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((productId) => productId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  return {
    selectedProducts,
    setSelectedProducts,
    handleSelectAll,
    handleSelectProduct,
  };
}
