import { BlockStack, InlineStack, Text, Card, Icon } from '@shopify/polaris';
import { PersonIcon, LocationIcon, EmailIcon, PhoneIcon, GlobeIcon } from '@shopify/polaris-icons';
import { memo } from 'react';
import type { ProcessedCustomerData } from '../../hooks/useOrderDataPreprocessing';

interface OrderCustomerInfoOptimizedProps {
  customerData: ProcessedCustomerData;
  notes?: string;
}

export const OrderCustomerInfoOptimized = memo(function OrderCustomerInfoOptimized({
  customerData,
  notes,
}: OrderCustomerInfoOptimizedProps) {
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
                {customerData.customerName}
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                {customerData.customerEmail}
              </Text>
            </BlockStack>
          </InlineStack>

          {/* Teléfono del cliente */}
          {customerData.customerPhone && (
            <InlineStack gap="300" blockAlign="start">
              <div style={{ marginTop: '2px' }}>
                <Icon source={PhoneIcon} />
              </div>
              <BlockStack gap="100">
                <Text variant="bodyMd" fontWeight="medium" as="span">
                  Teléfono
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  {customerData.customerPhone}
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
                {customerData.customerType}
              </Text>
            </BlockStack>
          </InlineStack>
        </BlockStack>

        {/* Dirección de envío */}
        {customerData.shipping && (
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
                  {customerData.shipping.formattedAddress}
                </Text>
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={GlobeIcon} />
                  <Text variant="bodySm" fontWeight="medium" as="span">
                    {customerData.shipping.countryName}
                  </Text>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        )}

        {/* Dirección de facturación */}
        {customerData.billing && (
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
                  {customerData.billing.formattedAddress}
                </Text>
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={GlobeIcon} />
                  <Text variant="bodySm" fontWeight="medium" as="span">
                    {customerData.billing.countryName}
                  </Text>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        )}

        {/* Notas del cliente */}
        {notes && (
          <BlockStack gap="200">
            <Text variant="bodyMd" fontWeight="medium" as="span">
              Notas del Cliente
            </Text>
            <Card background="bg-surface-secondary">
              <Text variant="bodySm" as="span">
                {notes}
              </Text>
            </Card>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
});
