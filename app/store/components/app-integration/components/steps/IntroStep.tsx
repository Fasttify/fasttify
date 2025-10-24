import { OptimizedImage as Image } from '@/components/ui/optimized-image';
import { BlockStack, InlineStack, Text, List, Icon, Box } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import { BENEFITS } from '@/app/store/components/app-integration/constants/connectModal';

export function IntroStep() {
  return (
    <BlockStack gap="400">
      <InlineStack gap="400" align="center" blockAlign="center">
        <div style={{ position: 'relative', height: '4rem', width: '4rem' }}>
          <Image src="/svgs/mastershop-svg.svg" alt="Master Shop Logo" fill style={{ objectFit: 'contain' }} />
        </div>
        <BlockStack gap="050">
          <Text variant="headingMd" as="h3">
            Master Shop
          </Text>
          <Text as="p" tone="subdued">
            Plataforma líder para gestión de productos e inventario
          </Text>
        </BlockStack>
      </InlineStack>

      <Box borderWidth="025" borderColor="border" borderRadius="200" padding="400" background="bg-surface-secondary">
        <BlockStack gap="200">
          <Text variant="headingSm" as="h4">
            Beneficios de la integración:
          </Text>
          <List>
            {BENEFITS.map((benefit, index) => (
              <List.Item key={index}>
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={CheckCircleIcon} tone="success" />
                  <Text as="span">{benefit}</Text>
                </InlineStack>
              </List.Item>
            ))}
          </List>
        </BlockStack>
      </Box>
    </BlockStack>
  );
}
