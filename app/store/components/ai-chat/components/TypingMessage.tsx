import { Text, Icon } from '@shopify/polaris';
import { ChatIcon } from '@shopify/polaris-icons';
import { cn } from '@/lib/utils';

interface TypingMessageProps {
  content: string;
  type: 'user' | 'ai';
  id: string;
}

export function TypingMessage({ content, type, id }: TypingMessageProps) {
  const messageStyles = {
    user: {
      container: 'justify-end',
      background: 'bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a]',
      textColor: 'text-white',
      borderRadius: 'rounded-2xl rounded-br-none',
      width: 'max-w-[95%]',
      icon: null,
    },
    ai: {
      container: 'justify-start',
      background: 'bg-gradient-to-br from-blue-50 to-blue-100',
      textColor: 'text-gray-800',
      borderRadius: 'rounded-2xl rounded-bl-none',
      width: 'max-w-[95%]',
      icon: ChatIcon,
    },
  };

  const currentStyle = messageStyles[type];

  return (
    <div data-message-id={id} className={cn('flex w-full py-2 px-4', currentStyle.container, 'animate-fade-in')}>
      <div
        className={cn(
          'p-4 transition-all duration-300 ease-in-out',
          currentStyle.background,
          currentStyle.borderRadius,
          currentStyle.width,
          'inline-block'
        )}>
        <div className="flex items-start space-x-3">
          {currentStyle.icon && (
            <div className="mt-1">
              <Icon source={currentStyle.icon} tone={type === 'ai' ? 'info' : 'base'} />
            </div>
          )}
          <div
            className={cn(
              'flex-grow break-words whitespace-pre-wrap',
              currentStyle.textColor,
              type === 'ai' && 'text-base'
            )}>
            <Text variant="bodyMd" as="p">
              {content}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
