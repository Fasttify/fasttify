import { IProduct } from '@/app/store/hooks/data/useProducts';
import type { SortOption } from '@/app/store/components/product-management/collections/types/collection-types';

export const filterProducts = (products: IProduct[], searchTerm: string): IProduct[] => {
  return products.filter(
    (product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) && product.status === 'active'
  );
};

export const sortProducts = (products: IProduct[], sortOption: SortOption): IProduct[] => {
  return [...products].sort((a, b) => {
    switch (sortOption) {
      case 'mas-recientes':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'mas-antiguos':
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case 'precio-mayor':
        return (b.price || 0) - (a.price || 0);
      case 'precio-menor':
        return (a.price || 0) - (b.price || 0);
      default:
        return 0;
    }
  });
};

export const getProductImageUrl = (product: IProduct): string | undefined => {
  if (!product.images) return undefined;

  if (typeof product.images === 'string') {
    if (product.images === '[]' || product.images === '') return undefined;
    try {
      const parsed = JSON.parse(product.images);
      return parsed[0]?.url;
    } catch {
      return undefined;
    }
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0]?.url;
  }

  return undefined;
};

export const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '$0';
  return `$${Number(price).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};
