import { useState } from 'react';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import type { SortDirection, SortField } from '../types/order-types';

export function useOrderFilters(orders: IOrder[]) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(null);

  // Filtrar órdenes según la pestaña activa y búsqueda
  const filteredOrders = orders
    .filter((order) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'pending') return order.status === 'pending';
      if (activeTab === 'processing') return order.status === 'processing';
      if (activeTab === 'shipped') return order.status === 'shipped';
      if (activeTab === 'delivered') return order.status === 'delivered';
      if (activeTab === 'cancelled') return order.status === 'cancelled';
      return true;
    })
    .filter((order) => {
      // Filtrar por búsqueda
      if (!searchQuery) return true;
      return (
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customerInfo && JSON.stringify(order.customerInfo).toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.customerEmail && order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

  // Ordenar órdenes según el campo y dirección
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let valueA, valueB;

    switch (sortField) {
      case 'orderNumber':
        valueA = a.orderNumber.toLowerCase();
        valueB = b.orderNumber.toLowerCase();
        break;
      case 'status':
        valueA = a.status;
        valueB = b.status;
        break;
      case 'paymentStatus':
        valueA = a.paymentStatus;
        valueB = b.paymentStatus;
        break;
      case 'totalAmount':
        valueA = a.totalAmount;
        valueB = b.totalAmount;
        break;
      case 'creationDate':
        valueA = a.createdAt;
        valueB = b.createdAt;
        break;
      case 'customerEmail':
        valueA = a.customerEmail;
        valueB = b.customerEmail;
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
    filteredOrders,
    sortedOrders,
    toggleSort,
    renderSortIndicator,
  };
}
