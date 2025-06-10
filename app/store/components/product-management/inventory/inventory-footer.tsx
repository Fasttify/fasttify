import { Text, Link } from '@shopify/polaris'

export default function InventoryFooter() {
  return (
    <div style={{ textAlign: 'center', marginTop: '24px' }}>
      <Text variant="bodyMd" as="p" tone="subdued">
        Más información sobre <Link url="#">gestionar el inventario</Link>
      </Text>
    </div>
  )
}
