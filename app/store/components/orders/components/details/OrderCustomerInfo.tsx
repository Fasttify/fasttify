import { BlockStack, InlineStack, Text, Card, Icon } from '@shopify/polaris';
import { PersonIcon, LocationIcon, EmailIcon, PhoneIcon, GlobeIcon } from '@shopify/polaris-icons';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import { getCustomerName, getCustomerEmail, getCustomerPhone } from '../../utils/order-utils';

interface OrderCustomerInfoProps {
  order: IOrder;
}

export function OrderCustomerInfo({ order }: OrderCustomerInfoProps) {
  const customerName = getCustomerName(order.customerInfo);
  const customerEmail = getCustomerEmail(order.customerInfo);
  const customerPhone = getCustomerPhone(order.customerInfo);

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

  const parseCustomerInfo = (customerData: any) => {
    if (!customerData) return null;

    try {
      if (typeof customerData === 'string') {
        return JSON.parse(customerData);
      }
      return customerData;
    } catch {
      return null;
    }
  };

  const shipping = parseAddress(order.shippingAddress);
  const billing = parseAddress(order.billingAddress);
  const customer = parseCustomerInfo(order.customerInfo);

  const getCountryName = (countryCode: string) => {
    const countries: Record<string, string> = {
      CO: 'Colombia',
      US: 'Estados Unidos',
      MX: 'México',
      ES: 'España',
      AR: 'Argentina',
      BR: 'Brasil',
      CL: 'Chile',
      PE: 'Perú',
      VE: 'Venezuela',
      EC: 'Ecuador',
      BO: 'Bolivia',
      PY: 'Paraguay',
      UY: 'Uruguay',
      GY: 'Guyana',
      SR: 'Surinam',
      GF: 'Guayana Francesa',
    };
    return countries[countryCode] || countryCode;
  };

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd" fontWeight="semibold">
          Información del Cliente
        </Text>

        {/* Información básica del cliente */}
        <BlockStack gap="300">
          <InlineStack gap="300" blockAlign="start">
            <div style={{ marginTop: '2px' }}>
              <Icon source={PersonIcon} />
            </div>
            <BlockStack gap="100">
              <Text variant="bodyMd" fontWeight="medium" as="span">
                {customerName}
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                {customerEmail}
              </Text>
            </BlockStack>
          </InlineStack>

          {/* Teléfono del cliente */}
          {customerPhone && (
            <InlineStack gap="300" blockAlign="start">
              <div style={{ marginTop: '2px' }}>
                <Icon source={PhoneIcon} />
              </div>
              <BlockStack gap="100">
                <Text variant="bodyMd" fontWeight="medium" as="span">
                  Teléfono
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  {customerPhone}
                </Text>
              </BlockStack>
            </InlineStack>
          )}

          {/* Tipo de cliente */}
          <InlineStack gap="300" blockAlign="start">
            <div style={{ marginTop: '2px' }}>
              <Icon source={PersonIcon} />
            </div>
            <BlockStack gap="100">
              <Text variant="bodyMd" fontWeight="medium" as="span">
                Tipo de Cliente
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                {order.customerType === 'guest' ? 'Cliente Invitado' : 'Cliente Registrado'}
              </Text>
            </BlockStack>
          </InlineStack>
        </BlockStack>

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
            <Card background="bg-surface-secondary">
              <BlockStack gap="200">
                <Text variant="bodySm" as="span">
                  {shipping.address1}
                  {shipping.address2 && `, ${shipping.address2}`}
                </Text>
                <InlineStack gap="200" blockAlign="center">
                  <Text variant="bodySm" as="span">
                    {shipping.city}, {shipping.province} {shipping.zip}
                  </Text>
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={GlobeIcon} />
                    <Text variant="bodySm" fontWeight="medium" as="span">
                      {getCountryName(shipping.country)}
                    </Text>
                  </InlineStack>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        )}

        {/* Dirección de facturación */}
        {billing && (
          <BlockStack gap="200">
            <InlineStack gap="200" blockAlign="start">
              <div style={{ marginTop: '2px' }}>
                <Icon source={EmailIcon} />
              </div>
              <Text variant="bodyMd" fontWeight="medium" as="span">
                Dirección de Facturación
              </Text>
            </InlineStack>
            <Card background="bg-surface-secondary">
              <BlockStack gap="200">
                <Text variant="bodySm" as="span">
                  {billing.address1}
                  {billing.address2 && `, ${billing.address2}`}
                </Text>
                <InlineStack gap="200" blockAlign="center">
                  <Text variant="bodySm" as="span">
                    {billing.city}, {billing.province} {billing.zip}
                  </Text>
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={GlobeIcon} />
                    <Text variant="bodySm" fontWeight="medium" as="span">
                      {getCountryName(billing.country)}
                    </Text>
                  </InlineStack>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        )}

        {/* Notas del cliente */}
        {order.notes && (
          <BlockStack gap="200">
            <Text variant="bodyMd" fontWeight="medium" as="span">
              Notas del Cliente
            </Text>
            <Card background="bg-surface-secondary">
              <Text variant="bodySm" as="span">
                {order.notes}
              </Text>
            </Card>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
