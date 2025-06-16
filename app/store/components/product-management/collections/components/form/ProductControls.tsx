import { Button, TextField, Select, InlineStack } from '@shopify/polaris'
import { SearchIcon } from '@shopify/polaris-icons'
import type { SortOption } from '@/app/store/components/product-management/collections/types/collection-types'
import { useCallback } from 'react'

interface ProductControlsProps {
  searchTerm: string
  sortOption: SortOption
  onSearchChange: (value: string) => void
  onSortChange: (value: SortOption) => void
  onOpenDialog: () => void
}

export function ProductControls({
  searchTerm,
  sortOption,
  onSearchChange,
  onSortChange,
  onOpenDialog,
}: ProductControlsProps) {
  const handleSortChange = useCallback(
    (value: string) => onSortChange(value as SortOption),
    [onSortChange]
  )

  const sortOptions = [
    { label: 'Más recientes', value: 'mas-recientes' },
    { label: 'Más antiguos', value: 'mas-antiguos' },
    { label: 'Mayor precio', value: 'precio-mayor' },
    { label: 'Menor precio', value: 'precio-menor' },
  ]

  return (
    <div style={{ padding: '12px' }}>
      <InlineStack gap="300" align="center" blockAlign="center" wrap={false}>
        <div style={{ flex: '1 1 auto' }}>
          <TextField
            label="Buscar productos"
            labelHidden
            placeholder="Buscar productos"
            value={searchTerm}
            onChange={onSearchChange}
            prefix={<SearchIcon />}
            autoComplete="off"
          />
        </div>
        <Select
          label="Ordenar por"
          labelInline
          options={sortOptions}
          value={sortOption}
          onChange={handleSortChange}
        />
        <Button onClick={onOpenDialog}>Explorar</Button>
      </InlineStack>
    </div>
  )
}
