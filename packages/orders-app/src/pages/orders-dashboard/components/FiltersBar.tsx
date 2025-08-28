import React, { useState } from 'react';
import { FiltersSection, FiltersRow, FilterGroup } from '../styles/OrdersDashboard.styles';

interface FiltersBarProps {
  onFiltersChange: (filters: { search: string; status: string; dateFrom: string; dateTo: string }) => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({ onFiltersChange }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleFilterChange = () => {
    onFiltersChange({
      search,
      status,
      dateFrom,
      dateTo,
    });
  };

  React.useEffect(() => {
    handleFilterChange();
  }, [search, status, dateFrom, dateTo]);

  return (
    <FiltersSection>
      <FiltersRow>
        <FilterGroup>
          <label>Buscar</label>
          <input
            type="text"
            placeholder="ID de orden, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <label>Estado</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="Procesando">Procesando</option>
            <option value="En tránsito">En tránsito</option>
            <option value="Entregado">Entregado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </FilterGroup>

        <FilterGroup>
          <label>Desde</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </FilterGroup>

        <FilterGroup>
          <label>Hasta</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </FilterGroup>
      </FiltersRow>
    </FiltersSection>
  );
};
