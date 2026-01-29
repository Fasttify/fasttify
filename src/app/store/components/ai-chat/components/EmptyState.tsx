import { EmptyStateProps } from '@/app/store/components/ai-chat/types/chat-types';
import { SUGGESTIONS } from '@/app/store/components/ai-chat/constants/chat-constants';
import { Text, BlockStack, Icon } from '@shopify/polaris';
import { InfoIcon, StoreIcon, CircleUpIcon } from '@shopify/polaris-icons';
import Orb from '@/app/store/components/ai-chat/components/Orb';

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestionIcons = [InfoIcon, StoreIcon, CircleUpIcon];

  return (
    <div className="bg-transparent">
      <BlockStack gap="400" align="center">
        <div className="relative w-full flex justify-center">
          <Orb rotateOnHover={false} hoverIntensity={0.0} />
        </div>

        <div className="px-4 text-center">
          <Text variant="headingMd" as="h2">
            Asistente de eCommerce
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued">
            ¿En qué puedo ayudarte con tu tienda online?
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
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion.text)}
                className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-3 text-left transition-all duration-200 ease-out border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{suggestion.text}</span>
                  <Icon source={suggestionIcons[index % suggestionIcons.length]} tone="subdued" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </BlockStack>
    </div>
  );
}
