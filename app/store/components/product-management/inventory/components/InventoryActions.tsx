import { Button, ButtonGroup } from '@shopify/polaris';
import { ExportIcon, ImportIcon } from '@shopify/polaris-icons';

export default function InventoryActions() {
  return (
    <ButtonGroup>
      <Button icon={ExportIcon}>Exportar</Button>
      <Button icon={ImportIcon}>Importar</Button>
    </ButtonGroup>
  );
}
