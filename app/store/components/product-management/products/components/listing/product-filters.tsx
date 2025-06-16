import { Filters, ChoiceList, RangeSlider, LegacyStack, Tabs } from '@shopify/polaris'
import { useState, useCallback } from 'react'
import { isEmpty } from '@/app/store/components/product-management/utils/common-utils'
import React from 'react'

interface ProductFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function ProductFilters({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
}: ProductFiltersProps) {
  const [availability, setAvailability] = useState<string[]>()
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])

  const handleAvailabilityChange = useCallback((value: string[]) => setAvailability(value), [])
  const handlePriceRangeChange = useCallback((value: [number, number]) => setPriceRange(value), [])
  const handleSearchQueryChange = useCallback(
    (value: string) => setSearchQuery(value),
    [setSearchQuery]
  )
  const handleClearAll = useCallback(() => {
    setAvailability(undefined)
    setPriceRange([0, 500])
    setSearchQuery('')
  }, [setSearchQuery])

  const filters = [
    {
      key: 'availability',
      label: 'Disponibilidad',
      filter: (
        <ChoiceList
          title="Disponibilidad"
          titleHidden
          choices={[
            { label: 'En stock', value: 'in_stock' },
            { label: 'Agotado', value: 'out_of_stock' },
          ]}
          selected={availability || []}
          onChange={handleAvailabilityChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'price',
      label: 'Precio',
      filter: (
        <RangeSlider
          label="Rango de precios"
          labelHidden
          value={priceRange}
          onChange={handlePriceRangeChange}
          prefix="$"
          output
          min={0}
          max={1000}
          step={10}
        />
      ),
    },
  ]

  const appliedFilters = []
  if (availability && !isEmpty(availability)) {
    const key = 'availability'
    appliedFilters.push({
      key,
      label: `Disponibilidad: ${availability.join(', ')}`,
      onRemove: () => setAvailability(undefined),
    })
  }
  if (priceRange[0] !== 0 || priceRange[1] !== 500) {
    const key = 'price'
    appliedFilters.push({
      key,
      label: `Precio: entre $${priceRange[0]} y $${priceRange[1]}`,
      onRemove: () => setPriceRange([0, 500]),
    })
  }

  const TABS = [
    { id: 'all', content: 'Todos' },
    { id: 'active', content: 'Activo' },
    { id: 'draft', content: 'Borrador' },
    { id: 'archived', content: 'Archivado' },
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
        <LegacyStack vertical>
          <Filters
            queryValue={searchQuery}
            onQueryChange={handleSearchQueryChange}
            onQueryClear={() => setSearchQuery('')}
            queryPlaceholder="Buscar productos..."
            onClearAll={handleClearAll}
            filters={filters}
            appliedFilters={appliedFilters}
          />
        </LegacyStack>
      </div>
    </React.Fragment>
  )
}
