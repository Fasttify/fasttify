import { BlockStack, Text } from '@shopify/polaris'

export function SetupHeader() {
  return (
    <BlockStack gap="200">
      <Text as="h1" variant="headingLg">
        ¡Pon en marcha tu tienda con Fasttify!
      </Text>
      <Text as="p" tone="subdued">
        Usa esta guía para configurar tu tienda y empezar a vender en minutos. A medida que crezcas,
        te daremos consejos y recomendaciones para mejorar tu negocio.
      </Text>
    </BlockStack>
  )
}
