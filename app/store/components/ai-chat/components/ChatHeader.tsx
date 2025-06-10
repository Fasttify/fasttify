import { ArrowLeftIcon } from '@shopify/polaris-icons'
import { Box, Text, Button, InlineStack } from '@shopify/polaris'
import { GradientSparkles } from '@/app/store/components/ai-chat/components/GradientSparkles'
import { ChatHeaderProps } from '@/app/store/components/ai-chat/types/chat-types'

export function ChatHeader({ isMobile, onClose }: ChatHeaderProps) {
  return (
    <InlineStack align="center" blockAlign="center" gap="200" wrap={false}>
      {isMobile && (
        <Button
          onClick={onClose}
          accessibilityLabel="Regresar"
          icon={ArrowLeftIcon}
          variant="plain"
        />
      )}
      <InlineStack gap="200" blockAlign="center" wrap={false}>
        <GradientSparkles />
        <Text variant="headingMd" as="h2">
          FastBot
        </Text>
      </InlineStack>
    </InlineStack>
  )
}
