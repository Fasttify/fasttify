import { useCallback } from 'react'
import { MessageListProps } from '@/app/store/components/ai-chat/types/chat-types'
import { LONG_MESSAGE_THRESHOLD } from '@/app/store/components/ai-chat/constants/chat-constants'
import { MessageLoading } from '@/app/store/components/ai-chat/components/MessageLoading'
import { TypingMessage } from '@/app/store/components/ai-chat/components/TypingMessage'

export function MessageList({
  messages,
  loading,
  expandedMessages,
  onToggleExpansion,
  scrollRef,
  messagesEndRef,
}: MessageListProps) {
  const isMessageExpanded = useCallback(
    (messageId: string) => {
      return !!expandedMessages[messageId]
    },
    [expandedMessages]
  )

  return (
    <div className="space-y-4 py-2">
      {messages.map(message => (
        <TypingMessage
          key={message.id}
          id={message.id}
          content={message.content}
          type={message.type}
          longMessageThreshold={LONG_MESSAGE_THRESHOLD}
          isExpanded={isMessageExpanded(message.id)}
          onExpand={onToggleExpansion}
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
