import { BlockStack, InlineStack, Text, Card, Icon } from '@shopify/polaris';
import { MoneyIcon, DeliveryIcon, DiscountIcon, TaxIcon } from '@shopify/polaris-icons';
import { memo, useMemo } from 'react';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import { formatCurrency } from '../../utils/order-utils';

interface OrderPricingProps {
  order: IOrder;
}

export const OrderPricing = memo(function OrderPricing({ order }: OrderPricingProps) {
  // Memoizar los cálculos de precios para evitar recalcular en cada render
  const pricingData = useMemo(() => {
    const {
      subtotal = 0,
      shippingCost = 0,
      taxAmount = 0,
      totalAmount = 0,
      currency = 'COP',
      compareAtPrice = 0,
    } = order;

    // Calcular descuentos basados en compareAtPrice vs subtotal
    const hasDiscount = (compareAtPrice ?? 0) > 0 && (compareAtPrice ?? 0) > (subtotal ?? 0);
    const discountAmount = hasDiscount ? (compareAtPrice ?? 0) - (subtotal ?? 0) : 0;

    // Calcular el ahorro total
    const savingsAmount = hasDiscount ? discountAmount : 0;
    const savingsPercentage =
      hasDiscount && (compareAtPrice ?? 0) > 0 ? Math.round((savingsAmount / (compareAtPrice ?? 1)) * 100) : 0;

    return {
      subtotal,
      shippingCost,
      taxAmount,
      totalAmount,
      currency,
      compareAtPrice,
      hasDiscount,
      discountAmount,
      savingsAmount,
      savingsPercentage,
    };
  }, [order]);

  const {
    subtotal,
    shippingCost,
    taxAmount,
    totalAmount,
    currency,
    compareAtPrice,
    hasDiscount,
    discountAmount: _discountAmount,
    savingsAmount,
    savingsPercentage,
  } = pricingData;

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
          {hasDiscount && (
            <InlineStack align="space-between">
              <Text variant="bodyMd" tone="subdued" as="span">
                Precio Original
              </Text>
              <div style={{ textDecoration: 'line-through' }}>
                <Text variant="bodyMd" tone="subdued" as="span">
                  {formatCurrency(Number(compareAtPrice) || 0, currency ?? 'COP')}
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
              {formatCurrency(Number(subtotal) || 0, currency ?? 'COP')}
            </Text>
          </InlineStack>

          {/* Descuentos */}
          {hasDiscount && (
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
                  -{formatCurrency(Number(savingsAmount) || 0, currency ?? 'COP')}
                </Text>
                <Text variant="bodySm" tone="success" as="span">
                  ({Number(savingsPercentage) || 0}% de ahorro)
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
              {(Number(shippingCost) || 0) > 0
                ? formatCurrency(Number(shippingCost) || 0, currency ?? 'COP')
                : 'Gratis'}
            </Text>
          </InlineStack>

          {/* Impuestos */}
          {(Number(taxAmount) || 0) > 0 && (
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
                {formatCurrency(Number(taxAmount) || 0, currency ?? 'COP')}
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
                {formatCurrency(Number(totalAmount) || 0, currency ?? 'COP')}
              </Text>
            </InlineStack>
          </Card>
        </BlockStack>

        {/* Información adicional */}
        <BlockStack gap="200">
          <Text variant="bodySm" tone="subdued" as="span">
            Moneda: {currency}
          </Text>

          {/* Resumen de cantidades */}
          <InlineStack gap="400" wrap>
            {hasDiscount && (
              <Text variant="bodySm" tone="subdued" as="span">
                Precio Original: {formatCurrency(Number(compareAtPrice) || 0, currency ?? 'COP')}
              </Text>
            )}
            <Text variant="bodySm" tone="subdued" as="span">
              Subtotal: {formatCurrency(Number(subtotal) || 0, currency ?? 'COP')}
            </Text>
            {hasDiscount && (
              <Text variant="bodySm" tone="success" as="span">
                - Descuentos: {formatCurrency(Number(savingsAmount) || 0, currency ?? 'COP')} (
                {Number(savingsPercentage) || 0}%)
              </Text>
            )}
            {(Number(shippingCost) || 0) > 0 && (
              <Text variant="bodySm" tone="subdued" as="span">
                + Envío: {formatCurrency(Number(shippingCost) || 0, currency ?? 'COP')}
              </Text>
            )}
            {(Number(taxAmount) || 0) > 0 && (
              <Text variant="bodySm" tone="subdued" as="span">
                + Impuestos: {formatCurrency(Number(taxAmount) || 0, currency ?? 'COP')}
              </Text>
            )}
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
});
