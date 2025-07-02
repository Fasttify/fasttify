import { Text, InlineStack, Icon } from '@shopify/polaris';
import { MagicIcon } from '@shopify/polaris-icons';

export function ChatHeader() {
  return (
    <InlineStack align="center" blockAlign="center" gap="200" wrap={false}>
      <InlineStack gap="200" blockAlign="center" wrap={false}>
        <Icon accessibilityLabel="FastBot" source={MagicIcon} tone="base" />
        <Text variant="headingMd" as="h2">
          FastBot
        </Text>
      </InlineStack>
    </InlineStack>
  );
}
