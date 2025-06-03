'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAutoScroll } from '@/app/store/components/ai-chat/hooks/useAutoScroll'
import { AIInputWithSearch } from '@/app/store/components/ai-chat/components/AiInput'
import { useChat } from '@/app/store/components/ai-chat/hooks/useChat'
import { useMediaQuery } from '@/hooks/ui/use-media-query'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ChatHeader } from '@/app/store/components/ai-chat/components/ChatHeader'
import { EmptyState } from '@/app/store/components/ai-chat/components/EmptyState'
import { MessageList } from '@/app/store/components/ai-chat/components/MessageList'
import { RefinedAIAssistantSheetProps } from '@/app/store/components/ai-chat/types/chat-types'

export function RefinedAIAssistantSheet({ open, onOpenChange }: RefinedAIAssistantSheetProps) {
  const { messages: chatMessages, loading, chat } = useChat()
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery('(max-width: 640px)')

  const { scrollRef, scrollToBottom } = useAutoScroll({
    smooth: true,
    content: chatMessages.length,
  })

  const transformedMessages = useMemo(
    () =>
      chatMessages.map((msg, index) => ({
        id: index.toString(),
        content: msg.content,
        type: msg.role === 'user' ? ('user' as const) : ('ai' as const),
        timestamp: new Date(),
      })),
    [chatMessages]
  )

  const handleToggleMessageExpansion = useCallback(
    (messageId: string) => {
      setExpandedMessages(prev => ({
        ...prev,
        [messageId]: !prev[messageId],
      }))

      requestAnimationFrame(() => {
        if (scrollRef.current) {
          const messageElement = scrollRef.current.querySelector(`[data-message-id="${messageId}"]`)
          messageElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      })
    },
    [scrollRef]
  )

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      await chat(suggestion)
      requestAnimationFrame(() => scrollToBottom())
    },
    [chat, scrollToBottom]
  )

  const handleSubmit = useCallback(
    async (value: string, withSearch?: boolean) => {
      if (!value.trim()) return
      await chat(value)
      requestAnimationFrame(() => scrollToBottom())
    },
    [chat, scrollToBottom]
  )

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  useEffect(() => {
    if (!open) return

    const shouldScroll = (!loading && chatMessages.length > 0) || chatMessages.length > 0
    if (shouldScroll) {
      const timeout = setTimeout(scrollToBottom, loading ? 200 : 100)
      return () => clearTimeout(timeout)
    }
  }, [loading, chatMessages.length, scrollToBottom, open])

  const hasMessages = chatMessages.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="p-0 sm:max-w-md w-full flex flex-col h-full rounded-t-2xl"
      >
        <ChatHeader isMobile={isMobile} onClose={handleClose} />

        <ScrollArea className="flex-1 overflow-y-auto">
          <div ref={scrollRef} className="px-4">
            {!hasMessages ? (
              <EmptyState onSuggestionClick={handleSuggestionClick} />
            ) : (
              <MessageList
                messages={transformedMessages}
                loading={loading}
                expandedMessages={expandedMessages}
                onToggleExpansion={handleToggleMessageExpansion}
                scrollRef={scrollRef}
                messagesEndRef={messagesEndRef}
              />
            )}
          </div>
        </ScrollArea>

        <div className="border-gray-200 shrink-0 bg-white">
          <AIInputWithSearch
            placeholder="Pregúntame cualquier cosa..."
            minHeight={48}
            maxHeight={96}
            onSubmit={handleSubmit}
            className="py-2"
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
