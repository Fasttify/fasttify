import { BlockStack, InlineStack, Text, Badge, Card, Icon } from '@shopify/polaris';
import {
  PackageIcon,
  CurrencyConvertIcon,
  OrderFulfilledIcon,
  CreditCardIcon,
  PersonIcon,
} from '@shopify/polaris-icons';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import {
  formatDate,
  getStatusText,
  getStatusTone,
  getPaymentStatusText,
  getPaymentStatusTone,
} from '../../utils/order-utils';

interface OrderHeaderProps {
  order: IOrder;
}

export function OrderHeader({ order }: OrderHeaderProps) {
  const getPaymentMethodText = (method: string | null | undefined) => {
    if (!method) return 'No especificado';

    const methodMap: Record<string, string> = {
      Manual: 'Pago Manual',
      CreditCard: 'Tarjeta de Crédito',
      DebitCard: 'Tarjeta de Débito',
      PayPal: 'PayPal',
      Stripe: 'Stripe',
      MercadoPago: 'MercadoPago',
      Cash: 'Efectivo',
      BankTransfer: 'Transferencia Bancaria',
    };

    return methodMap[method] || method;
  };

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
                Orden #{order.orderNumber}
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                ID: {order.id}
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
              <Badge tone={getStatusTone(order.status || '')} size="small">
                {getStatusText(order.status || '')}
              </Badge>
            </BlockStack>

            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued" as="span">
                Estado del Pago
              </Text>
              <Badge tone={getPaymentStatusTone(order.paymentStatus || '')} size="small">
                {getPaymentStatusText(order.paymentStatus || '')}
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
              {order.customerId}
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
                  {formatDate(order.createdAt)}
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
                  {formatDate(order.updatedAt)}
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
                  {order.currency}
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
                  {getPaymentMethodText(order.paymentMethod)}
                </Text>
              </BlockStack>
            </InlineStack>
          </InlineStack>
        </BlockStack>

        {/* ID de Pago si existe */}
        {order.paymentId && (
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
                {order.paymentId}
              </Text>
            </InlineStack>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
