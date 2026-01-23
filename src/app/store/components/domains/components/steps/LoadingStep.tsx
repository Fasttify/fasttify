import { BlockStack, Spinner, Text } from '@shopify/polaris';

interface LoadingStepProps {
  title: string;
  description: string;
}

export function LoadingStep({ title, description }: LoadingStepProps) {
  return (
    <BlockStack gap="400" align="center">
      <Spinner size="large" />
      <Text variant="headingMd" as="h3">
        {title}
      </Text>
      <Text as="p" tone="subdued" alignment="center">
        {description}
      </Text>
    </BlockStack>
  );
}
