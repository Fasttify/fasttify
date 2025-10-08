'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrdersDashboardLayout } from '@fasttify/orders-app/src/pages/orders-dashboard';
import { OrdersTable } from '@fasttify/orders-app/src/pages/orders-dashboard/components/OrdersTable';
import { SummaryCards } from '@fasttify/orders-app/src/pages/orders-dashboard/components/SummaryCards';
import { FiltersBar } from '@fasttify/orders-app/src/pages/orders-dashboard/components/FiltersBar';
import { useAuth } from '@fasttify/orders-app/src/hooks/useAuth';

// Datos mock para desarrollo
const mockOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'Entregado',
    total: 89.99,
    items: 3,
    customerEmail: 'juan@example.com',
  },
  {
    id: 'ORD-002',
    date: '2024-01-14',
    status: 'En tránsito',
    total: 156.5,
    items: 2,
    customerEmail: 'maria@example.com',
  },
  {
    id: 'ORD-003',
    date: '2024-01-13',
    status: 'Procesando',
    total: 45.25,
    items: 1,
    customerEmail: 'carlos@example.com',
  },
  {
    id: 'ORD-004',
    date: '2024-01-12',
    status: 'Entregado',
    total: 230.0,
    items: 5,
    customerEmail: 'ana@example.com',
  },
  {
    id: 'ORD-005',
    date: '2024-01-11',
    status: 'Cancelado',
    total: 67.8,
    items: 2,
    customerEmail: 'pedro@example.com',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'search' | 'help'>('orders');
  const [filteredOrders, _setFilteredOrders] = useState(mockOrders);

  // Verificar autenticación
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleTabChange = (tab: 'orders' | 'search' | 'help') => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    logout();
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#f8f9fa',
        }}>
        <div>Verificando autenticación...</div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleFiltersChange = (filters: any) => {
    // Lógica de filtros (implementar después)
    console.log('Filters changed:', filters);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <>
            <SummaryCards orders={mockOrders} />
            <FiltersBar onFiltersChange={handleFiltersChange} />
            <OrdersTable orders={filteredOrders} />
          </>
        );
      case 'search':
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Búsqueda Avanzada</h2>
            <p>Funcionalidad de búsqueda próximamente...</p>
          </div>
        );
      case 'help':
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Ayuda y Soporte</h2>
            <p>Centro de ayuda próximamente...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <OrdersDashboardLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      userEmail={user.email}>
      {renderContent()}
    </OrdersDashboardLayout>
  );
}
