import { BlockStack, InlineStack, Text, Card, Thumbnail, Icon, Badge, Link } from '@shopify/polaris';
import { PackageIcon, ImageIcon, ExternalIcon } from '@shopify/polaris-icons';
import { memo } from 'react';
import type { ProcessedOrderItem } from '../../types/util-type';

interface OrderItemsOptimizedProps {
  items: ProcessedOrderItem[];
}

export const OrderItemsOptimized = memo(function OrderItemsOptimized({ items }: OrderItemsOptimizedProps) {
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
            No hay productos disponibles en esta orden.
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
            Productos ({items.length})
          </Text>
        </InlineStack>

        <BlockStack gap="300">
          {items.map((item) => (
            <Card key={item.id} background="bg-surface-secondary">
              <BlockStack gap="300">
                {/* Información principal del producto */}
                <InlineStack gap="300" blockAlign="start">
                  <Thumbnail source={item.productImage || ImageIcon} alt={item.productTitle} size="small" />

                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Text variant="bodyMd" fontWeight="medium" as="span">
                        {item.productTitle}
                      </Text>
                      <Link url={item.productUrl} target="_blank" monochrome>
                        <InlineStack gap="100" blockAlign="center">
                          <Icon source={ExternalIcon} />
                          <Text variant="bodySm" tone="subdued" as="span">
                            Ver Producto
                          </Text>
                        </InlineStack>
                      </Link>
                    </InlineStack>

                    {/* SKU y variante si existe */}
                    {item.sku && (
                      <Text variant="bodySm" tone="subdued" as="span">
                        SKU: {item.sku}
                      </Text>
                    )}

                    {/* Atributos seleccionados */}
                    <BlockStack gap="100">
                      <InlineStack gap="200" blockAlign="center">
                        <Icon source={ImageIcon} />
                        <Text variant="bodySm" fontWeight="medium" as="span">
                          Atributos Seleccionados:
                        </Text>
                      </InlineStack>
                      {Object.keys(item.selectedAttributes).length > 0 ? (
                        <InlineStack gap="200" wrap>
                          {Object.entries(item.selectedAttributes).map(([key, value]) => (
                            <Badge key={key} tone="info" size="small">
                              {`${key}: ${String(value)}`}
                            </Badge>
                          ))}
                        </InlineStack>
                      ) : (
                        <Text variant="bodySm" tone="subdued" as="span">
                          Ninguno seleccionado
                        </Text>
                      )}
                    </BlockStack>

                    {/* Variante si existe */}
                    {item.variantTitle && (
                      <Text variant="bodySm" tone="subdued" as="span">
                        Variante: {item.variantTitle}
                      </Text>
                    )}

                    {/* Handle del producto */}
                    {item.handle && (
                      <Text variant="bodySm" tone="subdued" as="span">
                        URL: {String(item.handle)}
                      </Text>
                    )}
                  </BlockStack>
                </InlineStack>

                {/* Información de precios y cantidad */}
                <InlineStack gap="400" wrap={false} blockAlign="start">
                  <BlockStack gap="100">
                    <Text variant="bodySm" tone="subdued" as="span">
                      Cantidad
                    </Text>
                    <Text variant="bodyMd" fontWeight="medium" as="span">
                      {item.quantity}
                    </Text>
                  </BlockStack>

                  <BlockStack gap="100">
                    <Text variant="bodySm" tone="subdued" as="span">
                      Precio unitario
                    </Text>
                    <Text variant="bodyMd" as="span">
                      {item.formattedUnitPrice}
                    </Text>
                  </BlockStack>

                  {/* Mostrar precio original si hay descuento */}
                  {item.hasDiscount && item.productSnapshot?.compareAtPrice && (
                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued" as="span">
                        Precio original
                      </Text>
                      <div style={{ textDecoration: 'line-through' }}>
                        <Text variant="bodySm" tone="subdued" as="span">
                          {formatCurrency(item.productSnapshot.compareAtPrice, item.productSnapshot.currency || 'COP')}
                        </Text>
                      </div>
                    </BlockStack>
                  )}

                  <BlockStack gap="100">
                    <Text variant="bodySm" tone="subdued" as="span">
                      Total
                    </Text>
                    <Text variant="bodyMd" fontWeight="semibold" as="span">
                      {item.formattedTotalPrice}
                    </Text>
                  </BlockStack>

                  {/* Mostrar ahorro si hay descuento */}
                  {item.hasDiscount && item.formattedSavings && (
                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="success" as="span">
                        Ahorro
                      </Text>
                      <Text variant="bodySm" tone="success" fontWeight="medium" as="span">
                        -{item.formattedSavings}
                      </Text>
                    </BlockStack>
                  )}
                </InlineStack>

                {/* Información adicional del snapshot */}
                {item.productSnapshot && (
                  <Card background="bg-surface-tertiary">
                    <BlockStack gap="200">
                      <Text variant="bodySm" fontWeight="medium" as="span">
                        Información del Producto
                      </Text>
                      <InlineStack gap="400" wrap>
                        <Text variant="bodySm" tone="subdued" as="span">
                          ID: {item.productSnapshot.id}
                        </Text>
                        {item.productSnapshot.snapshotAt && (
                          <Text variant="bodySm" tone="subdued" as="span">
                            Snapshot: {new Date(item.productSnapshot.snapshotAt).toLocaleDateString()}
                          </Text>
                        )}
                        {item.productSnapshot.compareAtPrice && item.hasDiscount && (
                          <Text variant="bodySm" tone="subdued" as="span">
                            Precio original:{' '}
                            {formatCurrency(
                              item.productSnapshot.compareAtPrice,
                              item.productSnapshot.currency || 'COP'
                            )}
                          </Text>
                        )}
                        {item.productSnapshot.price && (
                          <Text variant="bodySm" tone="subdued" as="span">
                            Precio actual:{' '}
                            {formatCurrency(item.productSnapshot.price, item.productSnapshot.currency || 'COP')}
                          </Text>
                        )}
                      </InlineStack>
                    </BlockStack>
                  </Card>
                )}
              </BlockStack>
            </Card>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
});

// Helper function para formatear moneda (importada desde utils)
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
