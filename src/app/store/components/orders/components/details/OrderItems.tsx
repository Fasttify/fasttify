import { BlockStack, InlineStack, Text, Card, Thumbnail, Icon, Badge, Link } from '@shopify/polaris';
import { PackageIcon, ImageIcon, ExternalIcon } from '@shopify/polaris-icons';
import { memo, useMemo } from 'react';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import {
  getOrderItems,
  getProductTitle,
  getProductImage,
  getItemQuantity,
  getItemUnitPrice,
  getItemTotalPrice,
  getProductSnapshot,
  formatCurrency,
} from '@/app/store/components/orders/utils/order-utils';

interface OrderItemsProps {
  order: IOrder;
}

export const OrderItems = memo(function OrderItems({ order }: OrderItemsProps) {
  // Memoizar el procesamiento de items para evitar recalcular en cada render
  const items = useMemo(() => getOrderItems(order.items), [order.items]);

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
          {items.map((item) => {
            const productTitle = getProductTitle(item);
            const productImage = getProductImage(item);
            const quantity = getItemQuantity(item);
            const unitPrice = getItemUnitPrice(item);
            const totalPrice = getItemTotalPrice(item);
            const productSnapshot = getProductSnapshot(item);
            const productUrl = `/store/${order.storeId}/products/${item.productId}`;

            return (
              <Card key={item.id} background="bg-surface-secondary">
                <BlockStack gap="300">
                  {/* Información principal del producto */}
                  <InlineStack gap="300" blockAlign="start">
                    <Thumbnail source={productImage || ''} alt={productTitle} size="small" />

                    <BlockStack gap="200">
                      <InlineStack gap="200" blockAlign="center">
                        <Text variant="bodyMd" fontWeight="medium" as="span">
                          {productTitle}
                        </Text>
                        <Link url={productUrl} target="_blank" monochrome>
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
                        {productSnapshot?.selectedAttributes &&
                        Object.keys(productSnapshot.selectedAttributes).length > 0 ? (
                          <InlineStack gap="200" wrap>
                            {Object.entries(productSnapshot.selectedAttributes).map(([key, value]) => (
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
                      {productSnapshot?.variantTitle && (
                        <Text variant="bodySm" tone="subdued" as="span">
                          Variante: {productSnapshot.variantTitle}
                        </Text>
                      )}

                      {/* Handle del producto */}
                      {productSnapshot?.handle && (
                        <Text variant="bodySm" tone="subdued" as="span">
                          URL: {String(productSnapshot.handle)}
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
                        {quantity}
                      </Text>
                    </BlockStack>

                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued" as="span">
                        Precio unitario
                      </Text>
                      <Text variant="bodyMd" as="span">
                        {formatCurrency(unitPrice ?? 0, order?.currency ?? 'COP')}
                      </Text>
                    </BlockStack>

                    {/* Mostrar precio original si hay descuento */}
                    {productSnapshot?.compareAtPrice && productSnapshot.compareAtPrice > (unitPrice ?? 0) && (
                      <BlockStack gap="100">
                        <Text variant="bodySm" tone="subdued" as="span">
                          Precio original
                        </Text>
                        <div style={{ textDecoration: 'line-through' }}>
                          <Text variant="bodySm" tone="subdued" as="span">
                            {formatCurrency(productSnapshot.compareAtPrice, order?.currency ?? 'COP')}
                          </Text>
                        </div>
                      </BlockStack>
                    )}

                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued" as="span">
                        Total
                      </Text>
                      <Text variant="bodyMd" fontWeight="semibold" as="span">
                        {formatCurrency(totalPrice ?? 0, order?.currency ?? 'COP')}
                      </Text>
                    </BlockStack>

                    {/* Mostrar ahorro si hay descuento */}
                    {productSnapshot?.compareAtPrice && productSnapshot.compareAtPrice > (unitPrice ?? 0) && (
                      <BlockStack gap="100">
                        <Text variant="bodySm" tone="success" as="span">
                          Ahorro
                        </Text>
                        <Text variant="bodySm" tone="success" fontWeight="medium" as="span">
                          -
                          {formatCurrency(
                            (productSnapshot.compareAtPrice - (unitPrice ?? 0)) * quantity,
                            order?.currency ?? 'COP'
                          )}
                        </Text>
                      </BlockStack>
                    )}
                  </InlineStack>

                  {/* Información adicional del snapshot */}
                  {productSnapshot && (
                    <Card background="bg-surface-tertiary">
                      <BlockStack gap="200">
                        <Text variant="bodySm" fontWeight="medium" as="span">
                          Información del Producto
                        </Text>
                        <InlineStack gap="400" wrap>
                          <Text variant="bodySm" tone="subdued" as="span">
                            ID: {productSnapshot.id}
                          </Text>
                          {productSnapshot.snapshotAt && (
                            <Text variant="bodySm" tone="subdued" as="span">
                              Snapshot: {new Date(productSnapshot.snapshotAt).toLocaleDateString()}
                            </Text>
                          )}
                          {productSnapshot.compareAtPrice && productSnapshot.compareAtPrice > (unitPrice ?? 0) && (
                            <Text variant="bodySm" tone="subdued" as="span">
                              Precio original:{' '}
                              {formatCurrency(productSnapshot.compareAtPrice, order?.currency ?? 'COP')}
                            </Text>
                          )}
                          {productSnapshot.price && (
                            <Text variant="bodySm" tone="subdued" as="span">
                              Precio actual: {formatCurrency(productSnapshot.price, order?.currency ?? 'COP')}
                            </Text>
                          )}
                        </InlineStack>
                      </BlockStack>
                    </Card>
                  )}
                </BlockStack>
              </Card>
            );
          })}
        </BlockStack>
      </BlockStack>
    </Card>
  );
});
