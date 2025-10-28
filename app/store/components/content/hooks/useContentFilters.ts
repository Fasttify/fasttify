'use client';

import { useState, useMemo, useEffect } from 'react';
import type { S3Image } from '@/app/store/components/images-selector/types/s3-types';
import type { SortDirection, SortField } from '@/app/store/components/content/types/content-types';
import { useImageFilters } from '@/app/store/components/images-selector/hooks/useImageFilters';
import { useDebounce } from '@/app/store/components/images-selector/hooks/useDebounce';
import { filterAndSortImages } from '@/app/store/components/images-selector/utils/filterUtils';

export function useContentFilters(images: S3Image[]) {
  const [inputValue, setInputValue] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(null);

  const debouncedSearchTerm = useDebounce(inputValue, 300);
  const { filters, updateSearchTerm, filterOptions, updateFileTypes, updateFileSizes, clearAllFilters } =
    useImageFilters(images);

  useEffect(() => {
    updateSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, updateSearchTerm]);

  const setSearchQuery = (value: string) => {
    setInputValue(value);
  };

  const searchQuery = inputValue;

  const filteredImages = useMemo(() => {
    return filterAndSortImages(images, filters);
  }, [images, filters]);

  // Ordenar imágenes
  const sortedImages = useMemo(() => {
    if (!sortField || !sortDirection) return filteredImages;

    return [...filteredImages].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortField) {
        case 'filename':
          valueA = a.filename.toLowerCase();
          valueB = b.filename.toLowerCase();
          break;
        case 'size':
          valueA = a.size || 0;
          valueB = b.size || 0;
          break;
        case 'date':
          valueA = a.lastModified?.getTime() || 0;
          valueB = b.lastModified?.getTime() || 0;
          break;
        case 'type':
          valueA = a.type?.toLowerCase() || '';
          valueB = b.type?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredImages, sortField, sortDirection]);

  // Manejar cambio de ordenamiento
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    sortedImages,
    toggleSort,
    filters,
    filterOptions,
    updateFileTypes,
    updateFileSizes,
  };
}
