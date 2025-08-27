import React from 'react';
import { SearchContainer, SearchTitle } from '../styles/OrderSearch.styles';

interface OrderSearchLayoutProps {
  children: React.ReactNode;
}

export const OrderSearchLayout: React.FC<OrderSearchLayoutProps> = ({ children }) => {
  return (
    <SearchContainer>
      <SearchTitle>Búsqueda de Órdenes</SearchTitle>
      {children}
    </SearchContainer>
  );
};
