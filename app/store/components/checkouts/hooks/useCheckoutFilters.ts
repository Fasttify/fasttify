import { useState } from 'react';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import type { SortDirection, SortField } from '../types/checkout-types';

export function useCheckoutFilters(checkouts: ICheckoutSession[]) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(null);

  // Filtrar checkouts según la pestaña activa y búsqueda
  const filteredCheckouts = checkouts
    .filter((checkout) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'open') return checkout.status === 'open';
      if (activeTab === 'completed') return checkout.status === 'completed';
      if (activeTab === 'expired') return checkout.status === 'expired';
      if (activeTab === 'cancelled') return checkout.status === 'cancelled';
      return true;
    })
    .filter((checkout) => {
      // Filtrar por búsqueda
      if (!searchQuery) return true;
      return (
        checkout.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (checkout.customerInfo &&
          JSON.stringify(checkout.customerInfo).toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

  // Ordenar checkouts según el campo y dirección
  const sortedCheckouts = [...filteredCheckouts].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let valueA, valueB;

    switch (sortField) {
      case 'token':
        valueA = a.token.toLowerCase();
        valueB = b.token.toLowerCase();
        break;
      case 'status':
        valueA = a.status;
        valueB = b.status;
        break;
      case 'totalAmount':
        valueA = a.totalAmount;
        valueB = b.totalAmount;
        break;
      case 'creationDate':
        valueA = a.createdAt;
        valueB = b.createdAt;
        break;
      case 'expiresAt':
        valueA = a.expiresAt;
        valueB = b.expiresAt;
        break;
      default:
        return 0;
    }

    // Manejar valores null/undefined
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return sortDirection === 'asc' ? -1 : 1;
    if (valueB == null) return sortDirection === 'asc' ? 1 : -1;

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Manejar cambio de ordenamiento
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

  // Renderizar indicador de ordenamiento
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
    filteredCheckouts,
    sortedCheckouts,
    toggleSort,
    renderSortIndicator,
  };
}
