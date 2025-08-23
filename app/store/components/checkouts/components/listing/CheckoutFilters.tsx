import { BlockStack, ChoiceList, Filters, Tabs } from '@shopify/polaris';
import { useCallback, useState } from 'react';

interface CheckoutFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function CheckoutFilters({ searchQuery, setSearchQuery, activeTab, setActiveTab }: CheckoutFiltersProps) {
  const [statusFilter, setStatusFilter] = useState<string[]>();

  const handleStatusChange = useCallback((value: string[]) => setStatusFilter(value), []);
  const handleSearchQueryChange = useCallback((value: string) => setSearchQuery(value), [setSearchQuery]);
  const handleClearAll = useCallback(() => {
    setStatusFilter(undefined);
    setSearchQuery('');
  }, [setSearchQuery]);

  const filters = [
    {
      key: 'status',
      label: 'Estado',
      filter: (
        <ChoiceList
          title="Estado"
          titleHidden
          choices={[
            { label: 'Abierto', value: 'open' },
            { label: 'Completado', value: 'completed' },
            { label: 'Expirado', value: 'expired' },
            { label: 'Cancelado', value: 'cancelled' },
          ]}
          selected={statusFilter || []}
          onChange={handleStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = [];
  if (statusFilter && statusFilter.length > 0) {
    appliedFilters.push({
      key: 'status',
      label: `Estado: ${statusFilter.join(', ')}`,
      onRemove: () => setStatusFilter(undefined),
    });
  }

  const TABS = [
    { id: 'all', content: 'Todos' },
    { id: 'open', content: 'Abiertos' },
    { id: 'completed', content: 'Completados' },
    { id: 'expired', content: 'Expirados' },
    { id: 'cancelled', content: 'Cancelados' },
  ];
  const selectedTabIndex = TABS.findIndex((tab) => tab.id === activeTab);

  return (
    <>
      <Tabs tabs={TABS} selected={selectedTabIndex} onSelect={(index: number) => setActiveTab(TABS[index].id)} />
      <div style={{ padding: '16px' }}>
        <BlockStack>
          <Filters
            queryValue={searchQuery}
            onQueryChange={handleSearchQueryChange}
            onQueryClear={() => setSearchQuery('')}
            queryPlaceholder="Buscar checkouts..."
            onClearAll={handleClearAll}
            filters={filters}
            appliedFilters={appliedFilters}
          />
        </BlockStack>
      </div>
    </>
  );
}
