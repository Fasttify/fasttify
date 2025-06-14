import { MessageListProps } from '@/app/store/components/ai-chat/types/chat-types'
import { MessageLoading } from '@/app/store/components/ai-chat/components/MessageLoading'
import { TypingMessage } from '@/app/store/components/ai-chat/components/TypingMessage'

export function MessageList({ messages, loading, messagesEndRef }: MessageListProps) {
  return (
    <div className="space-y-4 py-2">
      {messages.map(message => (
        <TypingMessage
          key={message.id}
          id={message.id}
          content={message.content}
          type={message.type}
        />
      ))}
      {loading && (
        <div className="flex justify-start">
          <MessageLoading />
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
