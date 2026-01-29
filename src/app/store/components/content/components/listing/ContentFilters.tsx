import { BlockStack, ChoiceList, Filters } from '@shopify/polaris';
import { useCallback } from 'react';
import type { FilterOptions } from '@/app/store/components/images-selector/hooks/useImageFilters';

interface ContentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterOptions: FilterOptions;
  updateFileTypes: (types: string[]) => void;
  updateFileSizes: (sizes: string[]) => void;
  filters: any;
}

export function ContentFilters({
  searchQuery,
  setSearchQuery,
  filterOptions,
  updateFileTypes,
  updateFileSizes,
  filters,
}: ContentFiltersProps) {
  const handleSearchQueryChange = useCallback((value: string) => setSearchQuery(value), [setSearchQuery]);
  const handleClearAll = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  const filterComponents = [
    {
      key: 'fileTypes',
      label: 'Tipo de archivo',
      filter: (
        <ChoiceList
          title="Tipo de archivo"
          titleHidden
          choices={filterOptions.fileTypeOptions}
          selected={filters.fileTypes || []}
          onChange={updateFileTypes}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'fileSizes',
      label: 'Tamaño de archivo',
      filter: (
        <ChoiceList
          title="Tamaño de archivo"
          titleHidden
          choices={filterOptions.fileSizeOptions}
          selected={filters.fileSizes || []}
          onChange={updateFileSizes}
          allowMultiple
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = [];
  if (filters.fileTypes && filters.fileTypes.length > 0) {
    appliedFilters.push({
      key: 'fileTypes',
      label: `Tipo: ${filters.fileTypes.join(', ')}`,
      onRemove: () => updateFileTypes([]),
    });
  }
  if (filters.fileSizes && filters.fileSizes.length > 0) {
    appliedFilters.push({
      key: 'fileSizes',
      label: `Tamaño: ${filters.fileSizes.join(', ')}`,
      onRemove: () => updateFileSizes([]),
    });
  }

  return (
    <div style={{ padding: '16px' }}>
      <BlockStack>
        <Filters
          queryValue={searchQuery}
          onQueryChange={handleSearchQueryChange}
          onQueryClear={() => setSearchQuery('')}
          queryPlaceholder="Buscar archivos..."
          onClearAll={handleClearAll}
          filters={filterComponents}
          appliedFilters={appliedFilters}
        />
      </BlockStack>
    </div>
  );
}
