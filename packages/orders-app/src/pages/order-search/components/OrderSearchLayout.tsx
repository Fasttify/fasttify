import React from 'react';
import { SearchContainer, SearchTitle } from '../styles/OrderSearch.styles';

interface OrderSearchLayoutProps {
  children: React.ReactNode;
}

export const OrderSearchLayout = ({ children }: OrderSearchLayoutProps) => {
  return (
    <SearchContainer>
      <SearchTitle>Búsqueda de Órdenes</SearchTitle>
      {children}
    </SearchContainer>
  );
};
