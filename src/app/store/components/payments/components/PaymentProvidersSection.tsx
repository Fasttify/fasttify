import { Card, Text, LegacyStack, Link, Box, BlockStack } from '@shopify/polaris';
import { WompiGuide } from '@/app/store/components/payments/components/WompiGuide';
import { MercadoPagoGuide } from '@/app/store/components/payments/components/MercadoPagoGuide';

export function PaymentProvidersSection() {
  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="200">
          <Text variant="headingMd" as="h2">
            Pasarelas de Pago
          </Text>
          <Text as="p" tone="subdued">
            Configura las pasarelas de pago para aceptar transacciones en tu tienda. Se pueden aplicar tarifas según el
            proveedor seleccionado. <Link url="#">Selecciona un plan</Link>.
          </Text>
        </BlockStack>
      </Box>
      <Box padding="400" borderBlockStartWidth="025" borderColor="border">
        <LegacyStack spacing="tight">
          <MercadoPagoGuide />
          <WompiGuide />
        </LegacyStack>
      </Box>
    </Card>
  );
}
