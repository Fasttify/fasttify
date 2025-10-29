import { TextField, InlineStack, BlockStack, Button } from '@shopify/polaris';
import { SearchIcon, DeleteIcon } from '@shopify/polaris-icons';
import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from '@/app/store/components/images-selector/hooks/useDebounce';
import { useImageFilters } from '@/app/store/components/images-selector/hooks/useImageFilters';
import FilterCombobox from '@/app/store/components/images-selector/components/FilterCombobox';
import SortPopover from '@/app/store/components/images-selector/components/SortPopover';
import type { S3Image } from '@/app/store/hooks/storage/useS3Images';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: any) => void;
  images: S3Image[];
}

export default function SearchAndFilters({
  searchTerm,
  onSearchChange,
  onFiltersChange,
  images,
}: SearchAndFiltersProps) {
  const [inputValue, setInputValue] = useState(searchTerm);

  const {
    filters,
    filterOptions,
    updateSearchTerm,
    updateFileTypes,
    updateFileSizes,
    updateUsedIn,
    updateProducts,
    updateSortBy,
    clearAllFilters,
    getFilterStats,
  } = useImageFilters(images);

  const debouncedSearchTerm = useDebounce(inputValue, 300); // 300ms debounce

  // Actualizar el término de búsqueda cuando el debounce cambie
  useEffect(() => {
    onSearchChange(debouncedSearchTerm);
    updateSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearchChange, updateSearchTerm]);

  // Sincronizar inputValue con searchTerm cuando viene de fuera
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // Notificar cambios en filtros al componente padre
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleSortChange = useCallback(
    (sortBy: string) => {
      updateSortBy(sortBy);
    },
    [updateSortBy]
  );

  const handleClearAll = useCallback(() => {
    clearAllFilters();
    setInputValue('');
    onSearchChange('');
  }, [clearAllFilters, onSearchChange]);

  const stats = getFilterStats();

  return (
    <BlockStack gap="400">
      {/* Fila superior: Búsqueda, Ordenar y Limpiar */}
      <InlineStack gap="300" align="space-between" wrap>
        <div style={{ flex: '1 1 auto', minWidth: '200px', maxWidth: '400px' }}>
          <TextField
            label="Buscar archivos"
            labelHidden
            placeholder="Buscar archivos"
            value={inputValue}
            onChange={handleInputChange}
            prefix={<SearchIcon />}
            autoComplete="off"
            clearButton
            onClearButtonClick={() => handleInputChange('')}
          />
        </div>

        <InlineStack gap="200" wrap>
          <SortPopover
            options={filterOptions.sortOptions}
            selectedValue={filters.sortBy}
            onSortChange={handleSortChange}
          />

          {stats.hasActiveFilters && (
            <Button variant="tertiary" icon={DeleteIcon} onClick={handleClearAll} size="slim">
              Limpiar filtros ({stats.activeFiltersCount.toString()})
            </Button>
          )}
        </InlineStack>
      </InlineStack>

      {/* Fila inferior: Filtros */}
      <InlineStack gap="200" wrap>
        <div style={{ flex: '1 1 auto', minWidth: '140px' }}>
          <FilterCombobox
            label="Tipo de archivo"
            options={filterOptions.fileTypeOptions}
            onSelectionChange={updateFileTypes}
            type="checkbox"
          />
        </div>
        <div style={{ flex: '1 1 auto', minWidth: '140px' }}>
          <FilterCombobox
            label="Tamaño de archivo"
            options={filterOptions.fileSizeOptions}
            onSelectionChange={updateFileSizes}
            type="checkbox"
          />
        </div>
        <div style={{ flex: '1 1 auto', minWidth: '120px' }}>
          <FilterCombobox
            label="Usado en"
            options={filterOptions.usedInOptions}
            onSelectionChange={updateUsedIn}
            type="checkbox"
          />
        </div>
        <div style={{ flex: '1 1 auto', minWidth: '120px' }}>
          <FilterCombobox
            label="Producto"
            options={filterOptions.productOptions}
            onSelectionChange={updateProducts}
            type="checkbox"
          />
        </div>
      </InlineStack>
    </BlockStack>
  );
}
