import { Card, Text, LegacyStack, Box, BlockStack } from '@shopify/polaris';
import { PaymentGatewayType } from '@/app/(setup)/first-steps/hooks/useUserStoreData';
import { PaymentGatewayCard } from '@/app/store/components/payments/components/PaymentGatewayCard';

interface PaymentMethodsSectionProps {
  configuredGateways: PaymentGatewayType[];
  onOpenModal: (gateway: PaymentGatewayType) => void;
}

export function PaymentMethodsSection({ configuredGateways, onOpenModal }: PaymentMethodsSectionProps) {
  const isGatewayConfigured = (gateway: PaymentGatewayType) => {
    return configuredGateways.includes(gateway);
  };

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="200">
          <Text variant="headingMd" as="h2">
            Métodos de Pago Admitidos
          </Text>
          <Text as="p" tone="subdued">
            Métodos de pago disponibles en Fasttify a través de nuestras pasarelas integradas.
          </Text>
        </BlockStack>
      </Box>

      <Box padding="400">
        <LegacyStack vertical spacing="loose">
          <PaymentGatewayCard gateway="wompi" isConfigured={isGatewayConfigured('wompi')} onActivate={onOpenModal} />
          <PaymentGatewayCard
            gateway="mercadoPago"
            isConfigured={isGatewayConfigured('mercadoPago')}
            onActivate={onOpenModal}
          />
        </LegacyStack>
      </Box>
    </Card>
  );
}
