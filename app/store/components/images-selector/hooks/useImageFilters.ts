import { useState, useMemo, useCallback } from 'react';
import type { S3Image } from '@/app/store/hooks/storage/useS3Images';

export interface FilterState {
  searchTerm: string;
  fileTypes: string[];
  fileSizes: string[];
  usedIn: string[];
  products: string[];
  sortBy: string;
}

export interface FilterOptions {
  fileTypeOptions: Array<{ label: string; value: string }>;
  fileSizeOptions: Array<{ label: string; value: string }>;
  usedInOptions: Array<{ label: string; value: string }>;
  productOptions: Array<{ label: string; value: string }>;
  sortOptions: Array<{ label: string; value: string }>;
}

const DEFAULT_FILTER_STATE: FilterState = {
  searchTerm: '',
  fileTypes: [],
  fileSizes: [],
  usedIn: [],
  products: [],
  sortBy: 'date-asc',
};

/**
 * Hook para manejar filtros de imágenes de manera optimizada
 */
export function useImageFilters(images: S3Image[]) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  // Opciones de filtros estáticas
  const filterOptions: FilterOptions = useMemo(
    () => ({
      fileTypeOptions: [
        { label: 'Imágenes', value: 'images' },
        { label: 'Videos', value: 'videos' },
        { label: 'Videos externos', value: 'external-videos' },
        { label: 'Modelos 3D', value: '3d' },
      ],
      fileSizeOptions: [
        { label: 'Pequeño (< 1MB)', value: 'small' },
        { label: 'Mediano (1-5MB)', value: 'medium' },
        { label: 'Grande (> 5MB)', value: 'large' },
      ],
      usedInOptions: [
        { label: 'Productos', value: 'products' },
        { label: 'Páginas', value: 'pages' },
        { label: 'Blog', value: 'blog' },
      ],
      productOptions: [{ label: 'Producto específico', value: 'specific' }],
      sortOptions: [
        { label: 'Fecha de adición (más recientes primero)', value: 'date-desc' },
        { label: 'Fecha de adición (más antiguos primero)', value: 'date-asc' },
        { label: 'Nombre de archivo (A-Z)', value: 'name-asc' },
        { label: 'Nombre de archivo (Z-A)', value: 'name-desc' },
        { label: 'Tamaño de archivo (menor primero)', value: 'size-asc' },
        { label: 'Tamaño de archivo (mayor primero)', value: 'size-desc' },
      ],
    }),
    []
  );

  // Funciones para actualizar filtros específicos
  const updateFilter = useCallback((filterKey: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
  }, []);

  const updateSearchTerm = useCallback(
    (searchTerm: string) => {
      updateFilter('searchTerm', searchTerm);
    },
    [updateFilter]
  );

  const updateFileTypes = useCallback(
    (fileTypes: string[]) => {
      updateFilter('fileTypes', fileTypes);
    },
    [updateFilter]
  );

  const updateFileSizes = useCallback(
    (fileSizes: string[]) => {
      updateFilter('fileSizes', fileSizes);
    },
    [updateFilter]
  );

  const updateUsedIn = useCallback(
    (usedIn: string[]) => {
      updateFilter('usedIn', usedIn);
    },
    [updateFilter]
  );

  const updateProducts = useCallback(
    (products: string[]) => {
      updateFilter('products', products);
    },
    [updateFilter]
  );

  const updateSortBy = useCallback(
    (sortBy: string) => {
      updateFilter('sortBy', sortBy);
    },
    [updateFilter]
  );

  // Función para limpiar todos los filtros
  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
  }, []);

  // Función para obtener estadísticas de filtros
  const getFilterStats = useCallback(() => {
    const activeFiltersCount =
      (filters.fileTypes.length > 0 ? 1 : 0) +
      (filters.fileSizes.length > 0 ? 1 : 0) +
      (filters.usedIn.length > 0 ? 1 : 0) +
      (filters.products.length > 0 ? 1 : 0) +
      (filters.searchTerm.length > 0 ? 1 : 0);

    return {
      activeFiltersCount,
      hasActiveFilters: activeFiltersCount > 0,
      totalImages: images.length,
    };
  }, [filters, images.length]);

  return {
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
  };
}
