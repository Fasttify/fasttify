import { BlockStack, InlineStack, Text, Badge, Card, Icon } from '@shopify/polaris';
import {
  PackageIcon,
  CurrencyConvertIcon,
  OrderFulfilledIcon,
  CreditCardIcon,
  PersonIcon,
} from '@shopify/polaris-icons';
import { memo } from 'react';
import type { ProcessedOrderData } from '../../hooks/useOrderDataPreprocessing';

interface OrderHeaderOptimizedProps {
  orderData: ProcessedOrderData;
}

export const OrderHeaderOptimized = memo(function OrderHeaderOptimized({ orderData }: OrderHeaderOptimizedProps) {
  return (
    <Card>
      <BlockStack gap="400">
        {/* Título principal y ID */}
        <BlockStack gap="200">
          <InlineStack gap="300" blockAlign="start">
            <div style={{ marginTop: '2px' }}>
              <Icon source={PackageIcon} />
            </div>
            <BlockStack gap="100">
              <Text as="h2" variant="headingLg" fontWeight="semibold">
                Orden #{orderData.orderNumber}
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                ID: {orderData.id}
              </Text>
            </BlockStack>
          </InlineStack>
        </BlockStack>

        {/* Estados de la orden */}
        <BlockStack gap="200">
          <Text variant="bodyMd" fontWeight="medium" as="span">
            Estados
          </Text>
          <InlineStack gap="400" align="start">
            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued" as="span">
                Estado de la Orden
              </Text>
              <Badge tone={orderData.statusTone as any} size="small">
                {orderData.statusText}
              </Badge>
            </BlockStack>

            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued" as="span">
                Estado del Pago
              </Text>
              <Badge tone={orderData.paymentStatusTone as any} size="small">
                {orderData.paymentStatusText}
              </Badge>
            </BlockStack>
          </InlineStack>
        </BlockStack>

        {/* Información del cliente */}
        <BlockStack gap="200">
          <InlineStack gap="300" blockAlign="start">
            <div style={{ marginTop: '2px' }}>
              <Icon source={PersonIcon} />
            </div>
            <Text variant="bodyMd" fontWeight="medium" as="span">
              Cliente
            </Text>
          </InlineStack>
          <InlineStack gap="200" blockAlign="center">
            <Text variant="bodySm" tone="subdued" as="span">
              ID:
            </Text>
            <Text variant="bodySm" fontWeight="medium" as="span">
              {orderData.customerId}
            </Text>
          </InlineStack>
        </BlockStack>

        {/* Información de fechas y método de pago */}
        <BlockStack gap="200">
          <Text variant="bodyMd" fontWeight="medium" as="span">
            Detalles de la Orden
          </Text>
          <InlineStack gap="400" wrap>
            <InlineStack gap="200" blockAlign="center">
              <Icon source={OrderFulfilledIcon} />
              <BlockStack gap="050">
                <Text variant="bodySm" tone="subdued" as="span">
                  Creado
                </Text>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                  {orderData.formattedCreatedAt}
                </Text>
              </BlockStack>
            </InlineStack>

            <InlineStack gap="200" blockAlign="center">
              <Icon source={PackageIcon} />
              <BlockStack gap="050">
                <Text variant="bodySm" tone="subdued" as="span">
                  Actualizado
                </Text>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                  {orderData.formattedUpdatedAt}
                </Text>
              </BlockStack>
            </InlineStack>

            <InlineStack gap="200" blockAlign="center">
              <Icon source={CurrencyConvertIcon} />
              <BlockStack gap="050">
                <Text variant="bodySm" tone="subdued" as="span">
                  Moneda
                </Text>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                  {orderData.currency}
                </Text>
              </BlockStack>
            </InlineStack>

            <InlineStack gap="200" blockAlign="center">
              <Icon source={CreditCardIcon} />
              <BlockStack gap="050">
                <Text variant="bodySm" tone="subdued" as="span">
                  Método de Pago
                </Text>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                  {orderData.paymentMethodText}
                </Text>
              </BlockStack>
            </InlineStack>
          </InlineStack>
        </BlockStack>

        {/* ID de Pago si existe */}
        {orderData.paymentId && (
          <BlockStack gap="200">
            <Text variant="bodyMd" fontWeight="medium" as="span">
              Información de Pago
            </Text>
            <InlineStack gap="200" blockAlign="center">
              <Icon source={CreditCardIcon} />
              <Text variant="bodySm" tone="subdued" as="span">
                ID de Pago:
              </Text>
              <Text variant="bodySm" fontWeight="medium" as="span">
                {orderData.paymentId}
              </Text>
            </InlineStack>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
});
