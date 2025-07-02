import { EmptyStateProps } from '@/app/store/components/ai-chat/types/chat-types';
import { SUGGESTIONS } from '@/app/store/components/ai-chat/constants/chat-constants';
import { Text, BlockStack, Card, Icon } from '@shopify/polaris';
import { InfoIcon, StoreIcon, CircleUpIcon } from '@shopify/polaris-icons';
import Orb from '@/app/store/components/ai-chat/components/Orb';

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestionIcons = [InfoIcon, StoreIcon, CircleUpIcon];

  return (
    <Card>
      <BlockStack gap="400" align="center">
        <div className="relative w-full flex justify-center">
          <Orb rotateOnHover={false} hoverIntensity={0.0} />
        </div>

        <div className="px-4 text-center">
          <Text variant="headingMd" as="h2">
            Asistente de eCommerce
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued">
            ¿Qué te gustaría saber sobre ecommerce o dropshipping?
          </Text>
        </div>

        <div className="w-full px-4">
          <div className="text-center mb-4">
            <Text variant="bodyMd" as="p" tone="subdued">
              Elige una sugerencia para comenzar:
            </Text>
          </div>
          <div className="space-y-3">
            {SUGGESTIONS.map((suggestion, index) => (
              <div
                onClick={() => onSuggestionClick(suggestion.text)}
                className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 p-3 flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <Icon source={suggestionIcons[index % suggestionIcons.length]} tone="base" />
                  <span className="text-left ml-3 text-blue-500">{suggestion.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BlockStack>
    </Card>
  );
}
