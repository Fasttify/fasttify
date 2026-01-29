import { BlockStack, InlineStack, Text, Card, Icon } from '@shopify/polaris';
import { MoneyIcon, DiscountIcon, DeliveryIcon } from '@shopify/polaris-icons';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import { useCheckoutFormatting } from '@/app/store/components/checkouts/hooks/useCheckoutFormatting';

interface CheckoutPricingProps {
  checkout: ICheckoutSession;
}

export function CheckoutPricing({ checkout }: CheckoutPricingProps) {
  const { subtotal = 0, shippingCost = 0, taxAmount = 0, totalAmount = 0, currency = 'COP' } = checkout;

  const hasDiscount = (subtotal ?? 0) > (totalAmount ?? 0);
  const discountAmount = (subtotal ?? 0) - (totalAmount ?? 0) + (shippingCost ?? 0) + (taxAmount ?? 0);

  const { formatCheckoutAmounts } = useCheckoutFormatting(currency ?? undefined);

  const formattedAmounts = formatCheckoutAmounts({
    subtotal: subtotal ?? 0,
    shippingCost: shippingCost ?? 0,
    taxAmount: taxAmount ?? 0,
    totalAmount: totalAmount ?? 0,
    discountAmount: discountAmount ?? 0,
  });

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

        {/* Desktop layout */}
        <div className="hidden sm:block">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Subtotal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="bodyMd" as="span">
                Subtotal
              </Text>
              <Text variant="bodyMd" fontWeight="medium" as="span">
                {formattedAmounts.formattedSubtotal}
              </Text>
            </div>

            {/* Envío */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <InlineStack gap="200" blockAlign="center">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon source={DeliveryIcon} />
                </div>
                <Text variant="bodyMd" as="span">
                  Envío
                </Text>
              </InlineStack>
              <Text variant="bodyMd" fontWeight="medium" as="span">
                {formattedAmounts.formattedShippingCost}
              </Text>
            </div>

            {/* Impuestos */}
            {(taxAmount ?? 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="bodyMd" as="span">
                  Impuestos
                </Text>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                  {formattedAmounts.formattedTaxAmount}
                </Text>
              </div>
            )}

            {/* Descuentos */}
            {hasDiscount && discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <InlineStack gap="200" blockAlign="center">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon source={DiscountIcon} />
                  </div>
                  <Text variant="bodyMd" tone="success" as="span">
                    Descuentos
                  </Text>
                </InlineStack>
                <Text variant="bodyMd" fontWeight="medium" tone="success" as="span">
                  -{formattedAmounts.formattedDiscountAmount}
                </Text>
              </div>
            )}

            {/* Total */}
            <div style={{ marginTop: '8px' }}>
              <Card background="bg-surface-selected">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="headingMd" fontWeight="semibold" as="span">
                    Total
                  </Text>
                  <Text variant="headingMd" fontWeight="bold" as="span">
                    {formattedAmounts.formattedTotalAmount}
                  </Text>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="block sm:hidden">
          <BlockStack gap="300">
            {/* Subtotal */}
            <InlineStack align="space-between">
              <Text variant="bodyMd" as="span">
                Subtotal
              </Text>
              <Text variant="bodyMd" fontWeight="medium" as="span">
                {formattedAmounts.formattedSubtotal}
              </Text>
            </InlineStack>

            {/* Envío */}
            <InlineStack align="space-between">
              <InlineStack gap="200" blockAlign="center">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon source={DeliveryIcon} />
                </div>
                <Text variant="bodyMd" as="span">
                  Envío
                </Text>
              </InlineStack>
              <Text variant="bodyMd" fontWeight="medium" as="span">
                {formattedAmounts.formattedShippingCost}
              </Text>
            </InlineStack>

            {/* Impuestos */}
            {(taxAmount ?? 0) > 0 && (
              <InlineStack align="space-between">
                <Text variant="bodyMd" as="span">
                  Impuestos
                </Text>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                  {formattedAmounts.formattedTaxAmount}
                </Text>
              </InlineStack>
            )}

            {/* Descuentos */}
            {hasDiscount && discountAmount > 0 && (
              <InlineStack align="space-between">
                <InlineStack gap="200" blockAlign="center">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon source={DiscountIcon} />
                  </div>
                  <Text variant="bodyMd" tone="success" as="span">
                    Descuentos
                  </Text>
                </InlineStack>
                <Text variant="bodyMd" fontWeight="medium" tone="success" as="span">
                  -{formattedAmounts.formattedDiscountAmount}
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
                  {formattedAmounts.formattedTotalAmount}
                </Text>
              </InlineStack>
            </Card>
          </BlockStack>
        </div>

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
