import { BlockStack, InlineStack, Text, Badge, Card, Icon } from '@shopify/polaris';
import { CreditCardIcon, CalendarIcon, ClockIcon } from '@shopify/polaris-icons';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import { getStatusText, getStatusTone, formatDate, formatExpiryDate } from '../../utils/checkout-utils';

interface CheckoutHeaderProps {
  checkout: ICheckoutSession;
}

export function CheckoutHeader({ checkout }: CheckoutHeaderProps) {
  return (
    <Card>
      <BlockStack gap="400">
        {/* Título y estado */}
        <InlineStack align="start" blockAlign="start">
          <InlineStack gap="300" blockAlign="start">
            <div style={{ marginTop: '2px' }}>
              <Icon source={CreditCardIcon} />
            </div>
            <BlockStack gap="100">
              <Text as="h2" variant="headingLg" fontWeight="semibold">
                Checkout #{checkout.token.substring(0, 12)}...
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                ID: {checkout.id}
              </Text>
            </BlockStack>
          </InlineStack>
        </InlineStack>

        {/* Badge de estado separado */}
        <InlineStack align="start">
          <Badge tone={getStatusTone(checkout.status ?? '')} size="small">
            {getStatusText(checkout.status ?? '')}
          </Badge>
        </InlineStack>

        {/* Información de fechas */}
        <InlineStack gap="400" wrap>
          <InlineStack gap="200" blockAlign="center">
            <Icon source={CalendarIcon} />
            <BlockStack gap="050">
              <Text variant="bodySm" tone="subdued" as="span">
                Creado
              </Text>
              <Text variant="bodyMd" fontWeight="medium" as="span">
                {formatDate(checkout.createdAt)}
              </Text>
            </BlockStack>
          </InlineStack>

          <InlineStack gap="200" blockAlign="center">
            <Icon source={ClockIcon} />
            <BlockStack gap="050">
              <Text variant="bodySm" tone="subdued" as="span">
                Expira
              </Text>
              <Text variant="bodyMd" fontWeight="medium" as="span">
                {formatExpiryDate(checkout.expiresAt)}
              </Text>
            </BlockStack>
          </InlineStack>

          {checkout.updatedAt && (
            <InlineStack gap="200" blockAlign="center">
              <Icon source={CalendarIcon} />
              <BlockStack gap="050">
                <Text variant="bodySm" tone="subdued" as="span">
                  Actualizado
                </Text>
                <Text variant="bodyMd" fontWeight="medium" as="span">
                  {formatDate(checkout.updatedAt)}
                </Text>
              </BlockStack>
            </InlineStack>
          )}
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
