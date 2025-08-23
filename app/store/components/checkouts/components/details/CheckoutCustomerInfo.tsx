import { BlockStack, InlineStack, Text, Card, Icon } from '@shopify/polaris';
import { PersonIcon, EmailIcon, LocationIcon } from '@shopify/polaris-icons';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import { getCustomerName, getCustomerEmail } from '../../utils/checkout-utils';

interface CheckoutCustomerInfoProps {
  checkout: ICheckoutSession;
}

export function CheckoutCustomerInfo({ checkout }: CheckoutCustomerInfoProps) {
  const customerInfo = checkout.customerInfo;
  const shippingAddress = checkout.shippingAddress;
  const billingAddress = checkout.billingAddress;

  const parseAddress = (addressData: any) => {
    if (!addressData) return null;

    try {
      if (typeof addressData === 'string') {
        return JSON.parse(addressData);
      }
      return addressData;
    } catch {
      return null;
    }
  };

  const shipping = parseAddress(shippingAddress);
  const billing = parseAddress(billingAddress);

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd" fontWeight="semibold">
          Información del Cliente
        </Text>

        {/* Información básica del cliente */}
        <InlineStack gap="300" blockAlign="start">
          <div style={{ marginTop: '2px' }}>
            <Icon source={PersonIcon} />
          </div>
          <BlockStack gap="100">
            <Text variant="bodyMd" fontWeight="medium" as="span">
              {getCustomerName(customerInfo)}
            </Text>
            <Text variant="bodySm" tone="subdued" as="span">
              {getCustomerEmail(customerInfo)}
            </Text>
          </BlockStack>
        </InlineStack>

        {/* Dirección de envío */}
        {shipping && (
          <BlockStack gap="200">
            <InlineStack gap="200" blockAlign="start">
              <div style={{ marginTop: '2px' }}>
                <Icon source={LocationIcon} />
              </div>
              <Text variant="bodyMd" fontWeight="medium" as="span">
                Dirección de Envío
              </Text>
            </InlineStack>
            <div style={{ marginLeft: '24px' }}>
              <Text variant="bodySm" as="span">
                {shipping.address1}
                {shipping.address2 && `, ${shipping.address2}`}
              </Text>
              <Text variant="bodySm" as="span">
                {shipping.city}, {shipping.province} {shipping.zip}
              </Text>
              <Text variant="bodySm" as="span">
                {shipping.country}
              </Text>
            </div>
          </BlockStack>
        )}

        {/* Dirección de facturación */}
        {billing && (
          <BlockStack gap="200">
            <InlineStack gap="200" blockAlign="center">
              <div style={{ marginTop: '2px' }}>
                <Icon source={EmailIcon} />
              </div>
              <Text variant="bodyMd" fontWeight="medium" as="span">
                Dirección de Facturación
              </Text>
            </InlineStack>
            <div style={{ marginLeft: '24px' }}>
              <Text variant="bodySm" as="span">
                {billing.address1}
                {billing.address2 && `, ${billing.address2}`}
              </Text>
              <Text variant="bodySm" as="span">
                {billing.city}, {billing.province} {billing.zip}
              </Text>
              <Text variant="bodySm" as="span">
                {billing.country}
              </Text>
            </div>
          </BlockStack>
        )}

        {/* Notas del cliente */}
        {checkout.notes && (
          <BlockStack gap="200">
            <Text variant="bodyMd" fontWeight="medium" as="span">
              Notas del Cliente
            </Text>
            <Card background="bg-surface-secondary">
              <Text variant="bodySm" as="span">
                {checkout.notes}
              </Text>
            </Card>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
