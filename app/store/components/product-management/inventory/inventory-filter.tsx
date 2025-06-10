import { Button, ButtonGroup, TextField } from '@shopify/polaris'
import { SearchIcon } from '@shopify/polaris-icons'

interface InventoryFilterProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
}

export default function InventoryFilter({ searchQuery, setSearchQuery }: InventoryFilterProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      <div style={{ flexGrow: 1 }}>
        <TextField
          label="Buscar productos"
          labelHidden
          value={searchQuery}
          onChange={setSearchQuery}
          prefix={<SearchIcon />}
          placeholder="Buscar por nombre o SKU"
          autoComplete="off"
        />
      </div>
      <ButtonGroup>
        <Button pressed>Todo</Button>
        <Button>Filtros</Button>
      </ButtonGroup>
    </div>
  )
}
