import { TextField, InlineStack } from '@shopify/polaris'
import { SearchIcon } from '@shopify/polaris-icons'

interface SearchAndFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export default function SearchAndFilters({ searchTerm, onSearchChange }: SearchAndFiltersProps) {
  return (
    <InlineStack gap="400" align="center">
      <div style={{ flex: '1 1 auto' }}>
        <TextField
          label="Buscar imágenes"
          labelHidden
          placeholder="Buscar imágenes por nombre"
          value={searchTerm}
          onChange={onSearchChange}
          prefix={<SearchIcon />}
          autoComplete="off"
        />
      </div>
    </InlineStack>
  )
}
