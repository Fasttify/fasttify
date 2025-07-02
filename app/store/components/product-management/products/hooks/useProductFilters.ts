import { useState } from 'react';
import type { IProduct } from '@/app/store/hooks/data/useProducts';
import type { SortDirection, SortField } from '@/app/store/components/product-management/products/types/product-types';

export function useProductFilters(products: IProduct[]) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(null);

  // Filtrar productos según la pestaña activa y búsqueda
  const filteredProducts = products
    .filter((product) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'active') return product.status === 'active';
      if (activeTab === 'draft') return product.status === 'draft';
      if (activeTab === 'archived') return product.status === 'inactive';
      return true;
    })
    .filter((product) => {
      // Filtrar por búsqueda
      if (!searchQuery) return true;
      return (
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

  // Sort products based on sort field and direction
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let valueA, valueB;

    switch (sortField) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'status':
        valueA = a.status;
        valueB = b.status;
        break;
      case 'quantity':
        valueA = a.quantity;
        valueB = b.quantity;
        break;
      case 'price':
        valueA = a.price;
        valueB = b.price;
        break;
      case 'category':
        valueA = (a.category || '').toLowerCase();
        valueB = (b.category || '').toLowerCase();
        break;
      default:
        return 0;
    }

    // Handle null/undefined values
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return sortDirection === 'asc' ? -1 : 1;
    if (valueB == null) return sortDirection === 'asc' ? 1 : -1;

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle sort toggle
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 'asc' : 'desc';
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    filteredProducts,
    sortedProducts,
    toggleSort,
    renderSortIndicator,
  };
}
