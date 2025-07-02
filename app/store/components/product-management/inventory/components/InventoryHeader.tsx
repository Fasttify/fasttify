import { Text } from '@shopify/polaris';
import { ProductIcon } from '@shopify/polaris-icons';

export default function InventoryHeader() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <ProductIcon className="w-5 h-5" />
        <Text as="h1" variant="headingLg" fontWeight="regular">
          Inventario
        </Text>
      </div>
      <Text as="p" variant="bodyMd" tone="subdued">
        Administra y controla el stock de tus productos en tiempo real.
      </Text>
    </div>
  );
}
