import styled from 'styled-components';

// Layout principal
export const SearchContainer = styled.div`
  padding: 2rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
`;

export const SearchTitle = styled.h1`
  color: #1a1a1a;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
`;

// Formulario de búsqueda
export const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const SearchInput = styled.input`
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

export const SearchButton = styled.button`
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

// Filtros
export const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

export const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
`;

// Resultados
export const ResultsContainer = styled.div`
  min-height: 200px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 1rem;
  background: #f8f9fa;
`;

export const NoResults = styled.div`
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 2rem;
`;

export const OrderItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e1e5e9;

  &:last-child {
    border-bottom: none;
  }
`;

export const OrderHeader = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

export const OrderDetails = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
`;
