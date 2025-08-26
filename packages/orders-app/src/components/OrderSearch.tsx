import React, { useState } from 'react';
import styled from 'styled-components';

// Styled Components
const SearchContainer = styled.div`
  padding: 2rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
`;

const SearchTitle = styled.h1`
  color: #1a1a1a;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SearchButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
`;

const ResultsContainer = styled.div`
  min-height: 200px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 1rem;
  background: #f8f9fa;
`;

const NoResults = styled.div`
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 2rem;
`;

// Tipos
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  date: string;
}

// Componente principal
export const OrderSearch: React.FC = () => {
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
    <SearchContainer>
      <SearchTitle>Búsqueda de Órdenes</SearchTitle>

      <SearchForm onSubmit={handleSearch}>
        <SearchInput
          type="text"
          placeholder="Buscar por número de orden, cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchButton type="submit" disabled={isSearching}>
          {isSearching ? 'Buscando...' : 'Buscar'}
        </SearchButton>
      </SearchForm>

      <FilterSection>
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="completed">Completado</option>
          <option value="cancelled">Cancelado</option>
        </FilterSelect>
      </FilterSection>

      <ResultsContainer>
        {isSearching ? (
          <NoResults>Buscando órdenes...</NoResults>
        ) : orders.length === 0 ? (
          <NoResults>Ingresa un término de búsqueda para encontrar órdenes</NoResults>
        ) : (
          <div>
            {filteredOrders.map((order) => (
              <div key={order.id} style={{ padding: '1rem', borderBottom: '1px solid #e1e5e9' }}>
                <strong>{order.orderNumber}</strong> - {order.customerName}
                <br />
                Estado: {order.status} | Total: ${order.total} | Fecha: {order.date}
              </div>
            ))}
          </div>
        )}
      </ResultsContainer>
    </SearchContainer>
  );
};
