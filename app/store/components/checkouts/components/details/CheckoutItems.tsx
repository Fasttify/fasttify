import { BlockStack, InlineStack, Text, Card, Thumbnail, Grid, Icon } from '@shopify/polaris';
import { PackageIcon, ImageIcon } from '@shopify/polaris-icons';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import { getItemsCount, formatCurrency } from '../../utils/checkout-utils';

interface CheckoutItemsProps {
  checkout: ICheckoutSession;
}

export function CheckoutItems({ checkout }: CheckoutItemsProps) {
  const itemsSnapshot = checkout.itemsSnapshot;

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
              <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 2, xl: 2 }}>
                  <InlineStack gap="200" blockAlign="center">
                    <Thumbnail source={item.image || ImageIcon} alt={item.title || 'Producto'} size="small" />
                  </InlineStack>
                </Grid.Cell>

                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
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
                </Grid.Cell>

                <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 2, xl: 2 }}>
                  <Text variant="bodyMd" fontWeight="medium" alignment="center" as="span">
                    Cantidad: {item.quantity || 1}
                  </Text>
                </Grid.Cell>

                <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 2, xl: 2 }}>
                  <Text variant="bodyMd" fontWeight="semibold" alignment="end" as="span">
                    {formatCurrency(item.price || 0, checkout.currency ?? 'COP')}
                  </Text>
                </Grid.Cell>
              </Grid>
            </Card>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
