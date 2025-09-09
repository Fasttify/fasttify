import React from 'react';
import { ResultsContainer, NoResults, OrderItem, OrderHeader, OrderDetails } from '../styles/OrderSearch.styles';

// Tipos
export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  date: string;
}

interface OrderSearchResultsProps {
  orders: Order[];
  isSearching: boolean;
  searchTerm: string;
}

export const OrderSearchResults = ({ orders, isSearching, searchTerm }: OrderSearchResultsProps) => {
  if (isSearching) {
    return (
      <ResultsContainer>
        <NoResults>Buscando órdenes...</NoResults>
      </ResultsContainer>
    );
  }

  if (orders.length === 0) {
    return (
      <ResultsContainer>
        <NoResults>
          {searchTerm ? 'No se encontraron órdenes' : 'Ingresa un término de búsqueda para encontrar órdenes'}
        </NoResults>
      </ResultsContainer>
    );
  }

  return (
    <ResultsContainer>
      {orders.map((order) => (
        <OrderItem key={order.id}>
          <OrderHeader>
            {order.orderNumber} - {order.customerName}
          </OrderHeader>
          <OrderDetails>
            Estado: {order.status} | Total: ${order.total} | Fecha: {order.date}
          </OrderDetails>
        </OrderItem>
      ))}
    </ResultsContainer>
  );
};
