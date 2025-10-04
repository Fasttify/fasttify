import { BlockStack, InlineStack, Text, Card, Thumbnail, Icon } from '@shopify/polaris';
import { PackageIcon, ImageIcon } from '@shopify/polaris-icons';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import { getItemsCount } from '@/app/store/components/checkouts/utils/checkout-utils';
import { useCheckoutFormatting } from '@/app/store/components/checkouts/hooks/useCheckoutFormatting';

interface CheckoutItemsProps {
  checkout: ICheckoutSession;
}

export function CheckoutItems({ checkout }: CheckoutItemsProps) {
  const itemsSnapshot = checkout.itemsSnapshot;
  const { formatCheckoutItemAmounts } = useCheckoutFormatting(checkout.currency ?? undefined);

  const parseItems = () => {
    if (!itemsSnapshot) return [];

    try {
      if (typeof itemsSnapshot === 'string') {
        const parsed = JSON.parse(itemsSnapshot);
        return parsed.items || [];
      }
      if (typeof itemsSnapshot === 'object' && itemsSnapshot !== null && 'items' in itemsSnapshot) {
        return (itemsSnapshot as any).items || [];
      }
      return [];
    } catch {
      return [];
    }
  };

  const items = parseItems();
  const totalItems = getItemsCount(itemsSnapshot);

  if (items.length === 0) {
    return (
      <Card>
        <BlockStack gap="400">
          <InlineStack gap="300" blockAlign="start">
            <div style={{ marginTop: '2px' }}>
              <Icon source={PackageIcon} />
            </div>
            <Text as="h3" variant="headingMd" fontWeight="semibold">
              Productos
            </Text>
          </InlineStack>
          <Text variant="bodySm" tone="subdued" as="span">
            No hay productos disponibles en este checkout.
          </Text>
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack gap="300" blockAlign="start">
          <div style={{ marginTop: '2px' }}>
            <Icon source={PackageIcon} />
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            Productos ({totalItems})
          </Text>
        </InlineStack>

        <BlockStack gap="300">
          {items.map((item: any, index: number) => (
            <Card key={index} background="bg-surface-secondary">
              {/* Desktop layout */}
              <div className="hidden sm:block">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 0' }}>
                  {/* Imagen del producto */}
                  <div style={{ flex: '0 0 60px' }}>
                    <Thumbnail source={item.image || ImageIcon} alt={item.title || 'Producto'} size="small" />
                  </div>

                  {/* Información del producto */}
                  <div style={{ flex: '1', minWidth: 0 }}>
                    <BlockStack gap="100">
                      <Text variant="bodyMd" fontWeight="medium" as="span">
                        {item.title || 'Producto sin título'}
                      </Text>
                      {item.variant_title && (
                        <Text variant="bodySm" tone="subdued" as="span">
                          Variante: {item.variant_title}
                        </Text>
                      )}
                      {item.sku && (
                        <Text variant="bodySm" tone="subdued" as="span">
                          SKU: {item.sku}
                        </Text>
                      )}
                    </BlockStack>
                  </div>

                  {/* Cantidad */}
                  <div style={{ flex: '0 0 100px', textAlign: 'center' }}>
                    <BlockStack gap="050">
                      <Text variant="bodySm" tone="subdued" as="span">
                        Cantidad
                      </Text>
                      <Text variant="bodyMd" fontWeight="medium" as="span">
                        {item.quantity || 1}
                      </Text>
                    </BlockStack>
                  </div>

                  {/* Precio */}
                  <div style={{ flex: '0 0 120px', textAlign: 'right' }}>
                    <BlockStack gap="050">
                      <Text variant="bodySm" tone="subdued" as="span">
                        Precio
                      </Text>
                      <Text variant="bodyMd" fontWeight="semibold" as="span">
                        {
                          formatCheckoutItemAmounts({
                            unitPrice: item.price || 0,
                            quantity: item.quantity || 1,
                          }).formattedUnitPrice
                        }
                      </Text>
                    </BlockStack>
                  </div>
                </div>
              </div>

              {/* Mobile layout */}
              <div className="block sm:hidden">
                <BlockStack gap="300">
                  <InlineStack gap="200" blockAlign="start">
                    <Thumbnail source={item.image || ImageIcon} alt={item.title || 'Producto'} size="small" />
                    <BlockStack gap="100">
                      <Text variant="bodyMd" fontWeight="medium" as="span">
                        {item.title || 'Producto sin título'}
                      </Text>
                      {item.variant_title && (
                        <Text variant="bodySm" tone="subdued" as="span">
                          Variante: {item.variant_title}
                        </Text>
                      )}
                      {item.sku && (
                        <Text variant="bodySm" tone="subdued" as="span">
                          SKU: {item.sku}
                        </Text>
                      )}
                    </BlockStack>
                  </InlineStack>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      alignItems: 'start',
                    }}>
                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued" as="span">
                        Cantidad
                      </Text>
                      <Text variant="bodyMd" fontWeight="medium" as="span">
                        {item.quantity || 1}
                      </Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued" as="span">
                        Precio
                      </Text>
                      <Text variant="bodyMd" fontWeight="semibold" as="span">
                        {
                          formatCheckoutItemAmounts({
                            unitPrice: item.price || 0,
                            quantity: item.quantity || 1,
                          }).formattedUnitPrice
                        }
                      </Text>
                    </BlockStack>
                  </div>
                </BlockStack>
              </div>
            </Card>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
