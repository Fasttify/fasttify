import { MessageListProps } from '@/app/store/components/ai-chat/types/chat-types';
import { MessageLoading } from '@/app/store/components/ai-chat/components/MessageLoading';
import { TypingMessage } from '@/app/store/components/ai-chat/components/TypingMessage';
import { Button } from '@shopify/polaris';

export function MessageList({
  messages,
  loading,
  messagesEndRef,
  hasMoreMessages = false,
  loadingMoreMessages = false,
  onLoadMore,
}: MessageListProps) {
  return (
    <div className="space-y-4 py-2">
      {/* Botón de cargar más mensajes al inicio */}
      {hasMoreMessages && onLoadMore && (
        <div className="flex justify-center py-4">
          <Button
            onClick={onLoadMore}
            disabled={loadingMoreMessages}
            variant="plain"
            size="slim"
            loading={loadingMoreMessages}>
            Cargar más mensajes
          </Button>
        </div>
      )}

      {messages.map((message) => (
        <TypingMessage key={message.id} id={message.id} content={message.content} type={message.type} />
      ))}
      {loading && (
        <div className="flex justify-start">
          <MessageLoading />
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
