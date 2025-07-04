import type { PageSummary, SortDirection, SortField } from '@/app/store/components/page-management/types/page-types';
import { useMemo, useState } from 'react';

export function usePageFilters(pages: PageSummary[]) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(null);

  const filteredPages = useMemo(() => {
    return pages
      .filter((page) => {
        if (activeTab === 'all') return true;
        return page.status === activeTab;
      })
      .filter((page) => {
        if (!searchQuery) return true;
        return (
          page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
  }, [pages, activeTab, searchQuery]);

  const sortedPages = useMemo(() => {
    return [...filteredPages].sort((a, b) => {
      if (!sortField || !sortDirection) return 0;

      let valueA, valueB;

      switch (sortField) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'slug':
          valueA = a.slug.toLowerCase();
          valueB = b.slug.toLowerCase();
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt || 0).getTime();
          valueB = new Date(b.createdAt || 0).getTime();
          break;
        default:
          return 0;
      }

      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return sortDirection === 'asc' ? -1 : 1;
      if (valueB == null) return sortDirection === 'asc' ? 1 : -1;

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredPages, sortField, sortDirection]);

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

  // Renderizar indicador de ordenamiento
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 'asc' : 'desc';
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    filteredPages,
    sortedPages,
    toggleSort,
    renderSortIndicator,
  };
}
