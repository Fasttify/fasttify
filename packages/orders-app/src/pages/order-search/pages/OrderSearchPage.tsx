'use client';
import React, { useState } from 'react';
import { OrderSearchLayout } from '../components/OrderSearchLayout';
import { OrderSearchForm } from '../components/OrderSearchForm';
import { OrderSearchResults } from '../components/OrderSearchResults';

// Tipos
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  date: string;
}

// Página principal
export const OrderSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);

    // Simular búsqueda
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD-001',
          customerName: 'Juan Pérez',
          status: 'completed',
          total: 299.99,
          date: '2024-01-15',
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          customerName: 'María García',
          status: 'pending',
          total: 149.5,
          date: '2024-01-16',
        },
      ];

      setOrders(mockOrders);
      setIsSearching(false);
    }, 1000);
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  return (
    <OrderSearchLayout>
      <OrderSearchForm
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        isSearching={isSearching}
        onSubmit={handleSearch}
      />
      <OrderSearchResults orders={filteredOrders} isSearching={isSearching} searchTerm={searchTerm} />
    </OrderSearchLayout>
  );
};
