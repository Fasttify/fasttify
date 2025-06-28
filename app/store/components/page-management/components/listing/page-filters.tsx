import { Filters, ChoiceList, Tabs } from '@shopify/polaris'
import { useState, useCallback } from 'react'
import React from 'react'

interface PageFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function PageFilters({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
}: PageFiltersProps) {
  const [visibility, setVisibility] = useState<string[]>()

  const handleVisibilityChange = useCallback(
    (value: string[]) => setVisibility(value),
    []
  )
  const handleSearchQueryChange = useCallback(
    (value: string) => setSearchQuery(value),
    [setSearchQuery]
  )
  const handleClearAll = useCallback(() => {
    setVisibility(undefined)
    setSearchQuery('')
  }, [setSearchQuery])

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
  ]

  const appliedFilters = []
  if (visibility && visibility.length > 0) {
    const key = 'visibility'
    appliedFilters.push({
      key,
      label: `Visibilidad: ${visibility.join(', ')}`,
      onRemove: () => setVisibility(undefined),
    })
  }

  const TABS = [
    { id: 'all', content: 'Todas' },
    { id: 'published', content: 'Publicadas' },
    { id: 'draft', content: 'Borrador' },
  ]
  const selectedTabIndex = TABS.findIndex(tab => tab.id === activeTab)

  return (
    <React.Fragment>
      <Tabs
        tabs={TABS}
        selected={selectedTabIndex}
        onSelect={(index: number) => setActiveTab(TABS[index].id)}
      />
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
    </React.Fragment>
  )
}
