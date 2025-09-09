import React from 'react';
import { SearchForm, SearchInput, SearchButton, FilterSection, FilterSelect } from '../styles/OrderSearch.styles';

interface OrderSearchFormProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  isSearching: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const OrderSearchForm = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  isSearching,
  onSubmit,
}: OrderSearchFormProps) => {
  return (
    <>
      <SearchForm onSubmit={onSubmit}>
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
    </>
  );
};
