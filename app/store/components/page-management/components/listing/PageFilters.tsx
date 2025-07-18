import { ChoiceList, Filters, Tabs } from '@shopify/polaris';
import { useCallback } from 'react';

interface PageFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  visibility: string[] | undefined;
  setVisibility: (visibility: string[] | undefined) => void;
  pageType: string[] | undefined;
  setPageType: (pageType: string[] | undefined) => void;
}

export function PageFilters({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  visibility,
  setVisibility,
  pageType,
  setPageType,
}: PageFiltersProps) {
  const handleVisibilityChange = useCallback((value: string[]) => setVisibility(value), [setVisibility]);
  const handlePageTypeChange = useCallback((value: string[]) => setPageType(value), [setPageType]);
  const handleSearchQueryChange = useCallback((value: string) => setSearchQuery(value), [setSearchQuery]);
  const handleClearAll = useCallback(() => {
    setVisibility(undefined);
    setPageType(undefined);
    setSearchQuery('');
  }, [setSearchQuery, setVisibility, setPageType]);

  const filters = [
    {
      key: 'visibility',
      label: 'Visibilidad',
      filter: (
        <ChoiceList
          title="Visibilidad"
          titleHidden
          choices={[
            { label: 'Visible', value: 'visible' },
            { label: 'Oculta', value: 'hidden' },
          ]}
          selected={visibility || []}
          onChange={handleVisibilityChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'pageType',
      label: 'Tipo de Página',
      filter: (
        <ChoiceList
          title="Tipo de Página"
          titleHidden
          choices={[
            { label: 'Estándar', value: 'standard' },
            { label: 'Política', value: 'policies' },
          ]}
          selected={pageType || []}
          onChange={handlePageTypeChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = [];
  if (visibility && visibility.length > 0) {
    const key = 'visibility';
    appliedFilters.push({
      key,
      label: `Visibilidad: ${visibility.join(', ')}`,
      onRemove: () => setVisibility(undefined),
    });
  }
  if (pageType && pageType.length > 0) {
    const key = 'pageType';
    appliedFilters.push({
      key,
      label: `Tipo: ${pageType.join(', ')}`,
      onRemove: () => setPageType(undefined),
    });
  }

  const TABS = [
    { id: 'all', content: 'Todas' },
    { id: 'published', content: 'Publicadas' },
    { id: 'draft', content: 'Borrador' },
  ];
  const selectedTabIndex = TABS.findIndex((tab) => tab.id === activeTab);

  return (
    <>
      <Tabs tabs={TABS} selected={selectedTabIndex} onSelect={(index: number) => setActiveTab(TABS[index].id)} />
      <div style={{ padding: '16px' }}>
        <Filters
          queryValue={searchQuery}
          onQueryChange={handleSearchQueryChange}
          onQueryClear={() => setSearchQuery('')}
          queryPlaceholder="Buscar páginas..."
          onClearAll={handleClearAll}
          filters={filters}
          appliedFilters={appliedFilters}
        />
      </div>
    </>
  );
}
