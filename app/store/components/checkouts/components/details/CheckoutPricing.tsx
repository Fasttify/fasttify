import { BlockStack, InlineStack, Text, Card, Grid, Icon } from '@shopify/polaris';
import { MoneyIcon, DiscountIcon, DeliveryIcon } from '@shopify/polaris-icons';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import { formatCurrency } from '../../utils/checkout-utils';

interface CheckoutPricingProps {
  checkout: ICheckoutSession;
}

export function CheckoutPricing({ checkout }: CheckoutPricingProps) {
  const { subtotal = 0, shippingCost = 0, taxAmount = 0, totalAmount = 0, currency = 'COP' } = checkout;

  const hasDiscount = (subtotal ?? 0) > (totalAmount ?? 0);
  const discountAmount = (subtotal ?? 0) - (totalAmount ?? 0) + (shippingCost ?? 0) + (taxAmount ?? 0);

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

        <Grid>
          {/* Subtotal */}
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <InlineStack align="space-between">
              <Text variant="bodyMd" as="span">
                Subtotal
              </Text>
              <Text variant="bodyMd" fontWeight="medium" as="span">
                {formatCurrency(subtotal ?? 0, currency ?? 'COP')}
              </Text>
            </InlineStack>
          </Grid.Cell>

          {/* Envío */}
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
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
                {(shippingCost ?? 0) > 0 ? formatCurrency(shippingCost ?? 0, currency ?? 'COP') : 'Gratis'}
              </Text>
            </InlineStack>
          </Grid.Cell>

          {/* Impuestos */}
          {(taxAmount ?? 0) > 0 && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
              <InlineStack align="space-between">
                <Text variant="bodyMd" as="span">
                  Impuestos
                </Text>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                  {formatCurrency(taxAmount ?? 0, currency ?? 'COP')}
                </Text>
              </InlineStack>
            </Grid.Cell>
          )}

          {/* Descuentos */}
          {hasDiscount && discountAmount > 0 && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
              <InlineStack align="space-between">
                <InlineStack gap="200" blockAlign="start">
                  <div style={{ marginTop: '2px' }}>
                    <Icon source={DiscountIcon} />
                  </div>
                  <Text variant="bodyMd" tone="success" as="span">
                    Descuentos
                  </Text>
                </InlineStack>
                <Text variant="bodyMd" fontWeight="medium" tone="success" as="span">
                  -{formatCurrency(discountAmount ?? 0, currency ?? 'COP')}
                </Text>
              </InlineStack>
            </Grid.Cell>
          )}

          {/* Total */}
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <Card background="bg-surface-selected">
              <InlineStack align="space-between">
                <Text variant="headingMd" fontWeight="semibold" as="span">
                  Total
                </Text>
                <Text variant="headingMd" fontWeight="bold" as="span">
                  {formatCurrency(totalAmount ?? 0, currency ?? 'COP')}
                </Text>
              </InlineStack>
            </Card>
          </Grid.Cell>
        </Grid>

        {/* Información adicional */}
        <BlockStack gap="200">
          <Text variant="bodySm" tone="subdued" as="span">
            Moneda: {currency}
          </Text>
          {checkout.cartId && (
            <Text variant="bodySm" tone="subdued" as="span">
              Carrito ID: {checkout.cartId}
            </Text>
          )}
          {checkout.sessionId && (
            <Text variant="bodySm" tone="subdued" as="span">
              Sesión ID: {checkout.sessionId}
            </Text>
          )}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
