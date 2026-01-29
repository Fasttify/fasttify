import { Button, ButtonGroup, TextField, BlockStack } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';

interface InventoryFilterProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export default function InventoryFilter({ searchQuery, setSearchQuery }: InventoryFilterProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Layout para desktop */}
      <div className="hidden md:block">
        <div style={{ display: 'flex', gap: '8px' }}>
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
      </div>

      {/* Layout para móvil */}
      <div className="block md:hidden">
        <BlockStack gap="300">
          <TextField
            label="Buscar productos"
            labelHidden
            value={searchQuery}
            onChange={setSearchQuery}
            prefix={<SearchIcon />}
            placeholder="Buscar por nombre o SKU"
            autoComplete="off"
          />
          <ButtonGroup>
            <Button pressed>Todo</Button>
            <Button>Filtros</Button>
          </ButtonGroup>
        </BlockStack>
      </div>
    </div>
  );
}
