import { BlockStack, InlineStack, Text, Card, Icon, SkeletonBodyText } from '@shopify/polaris';
import { MoneyIcon, DeliveryIcon, DiscountIcon, TaxIcon } from '@shopify/polaris-icons';
import { memo } from 'react';
import type { ProcessedPricingData } from '../../types/util-type';

interface OrderPricingOptimizedProps {
  pricingData: ProcessedPricingData;
  loading?: boolean;
  error?: string | null;
}

export const OrderPricingOptimized = memo(function OrderPricingOptimized({
  pricingData,
  loading: _loading,
  error: _error,
}: OrderPricingOptimizedProps) {
  if (_loading) {
    return (
      <Card>
        <BlockStack gap="400">
          <InlineStack gap="300" blockAlign="start">
            <div style={{ marginTop: '2px' }}>
              <Icon source={MoneyIcon} />
            </div>
            <Text as="h3" variant="headingMd" fontWeight="semibold">
              Resumen de Precios
            </Text>
          </InlineStack>

          <BlockStack gap="300">
            <InlineStack align="space-between">
              <SkeletonBodyText lines={1} />
              <SkeletonBodyText lines={1} />
            </InlineStack>
            <InlineStack align="space-between">
              <SkeletonBodyText lines={1} />
              <SkeletonBodyText lines={1} />
            </InlineStack>
            <InlineStack align="space-between">
              <SkeletonBodyText lines={1} />
              <SkeletonBodyText lines={1} />
            </InlineStack>
            <Card background="bg-surface-selected">
              <InlineStack align="space-between">
                <SkeletonBodyText lines={1} />
                <SkeletonBodyText lines={1} />
              </InlineStack>
            </Card>
          </BlockStack>
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack gap="300" blockAlign="start">
          <div style={{ marginTop: '2px' }}>
            <Icon source={MoneyIcon} />
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            Resumen de Precios
          </Text>
        </InlineStack>

        <BlockStack gap="300">
          {/* Precio original (compareAtPrice) si hay descuento */}
          {pricingData.hasDiscount && (
            <InlineStack align="space-between">
              <Text variant="bodyMd" tone="subdued" as="span">
                Precio Original
              </Text>
              <div style={{ textDecoration: 'line-through' }}>
                <Text variant="bodyMd" tone="subdued" as="span">
                  {pricingData.formattedCompareAtPrice}
                </Text>
              </div>
            </InlineStack>
          )}

          {/* Subtotal */}
          <InlineStack align="space-between">
            <Text variant="bodyMd" as="span">
              Subtotal
            </Text>
            <Text variant="bodyMd" fontWeight="medium" as="span">
              {pricingData.formattedSubtotal}
            </Text>
          </InlineStack>

          {/* Descuentos */}
          {pricingData.hasDiscount && (
            <InlineStack align="space-between">
              <InlineStack gap="200" blockAlign="start">
                <div style={{ marginTop: '2px' }}>
                  <Icon source={DiscountIcon} />
                </div>
                <Text variant="bodyMd" as="span">
                  Descuentos
                </Text>
              </InlineStack>
              <BlockStack gap="050" align="end">
                <Text variant="bodyMd" tone="success" fontWeight="medium" as="span">
                  -{pricingData.formattedSavingsAmount}
                </Text>
                <Text variant="bodySm" tone="success" as="span">
                  ({pricingData.savingsPercentage}% de ahorro)
                </Text>
              </BlockStack>
            </InlineStack>
          )}

          {/* Envío */}
          <InlineStack align="space-between">
            <InlineStack gap="200" blockAlign="start">
              <div style={{ marginTop: '2px' }}>
                <Icon source={DeliveryIcon} />
              </div>
              <Text variant="bodyMd" as="span">
                Envío
              </Text>
            </InlineStack>
            <Text variant="bodyMd" fontWeight="medium" as="span">
              {pricingData.shippingCost > 0 ? pricingData.formattedShippingCost : 'Gratis'}
            </Text>
          </InlineStack>

          {/* Impuestos */}
          {pricingData.taxAmount > 0 && (
            <InlineStack align="space-between">
              <InlineStack gap="200" blockAlign="start">
                <div style={{ marginTop: '2px' }}>
                  <Icon source={TaxIcon} />
                </div>
                <Text variant="bodyMd" as="span">
                  Impuestos
                </Text>
              </InlineStack>
              <Text variant="bodyMd" fontWeight="medium" as="span">
                {pricingData.formattedTaxAmount}
              </Text>
            </InlineStack>
          )}

          {/* Total */}
          <Card background="bg-surface-selected">
            <InlineStack align="space-between">
              <Text variant="headingMd" fontWeight="semibold" as="span">
                Total
              </Text>
              <Text variant="headingMd" fontWeight="bold" as="span">
                {pricingData.formattedTotalAmount}
              </Text>
            </InlineStack>
          </Card>
        </BlockStack>

        {/* Información adicional */}
        <BlockStack gap="200">
          <Text variant="bodySm" tone="subdued" as="span">
            Moneda: {pricingData.currency}
          </Text>

          {/* Resumen de cantidades */}
          <InlineStack gap="400" wrap>
            {pricingData.hasDiscount && (
              <Text variant="bodySm" tone="subdued" as="span">
                Precio Original: {pricingData.formattedCompareAtPrice}
              </Text>
            )}
            <Text variant="bodySm" tone="subdued" as="span">
              Subtotal: {pricingData.formattedSubtotal}
            </Text>
            {pricingData.hasDiscount && (
              <Text variant="bodySm" tone="success" as="span">
                - Descuentos: {pricingData.formattedSavingsAmount} ({pricingData.savingsPercentage}%)
              </Text>
            )}
            {pricingData.shippingCost > 0 && (
              <Text variant="bodySm" tone="subdued" as="span">
                + Envío: {pricingData.formattedShippingCost}
              </Text>
            )}
            {pricingData.taxAmount > 0 && (
              <Text variant="bodySm" tone="subdued" as="span">
                + Impuestos: {pricingData.formattedTaxAmount}
              </Text>
            )}
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
});
