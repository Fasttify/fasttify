'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Sheet, Scrollable, Box, Button } from '@shopify/polaris'
import { XIcon } from '@shopify/polaris-icons'

import { useAutoScroll } from '@/app/store/components/ai-chat/hooks/useAutoScroll'
import { AIInputWithSearch } from '@/app/store/components/ai-chat/components/AiInput'
import { useMediaQuery } from '@/hooks/ui/use-media-query'
import { ChatHeader } from '@/app/store/components/ai-chat/components/ChatHeader'
import { EmptyState } from '@/app/store/components/ai-chat/components/EmptyState'
import { MessageList } from '@/app/store/components/ai-chat/components/MessageList'
import { RefinedAIAssistantSheetProps } from '@/app/store/components/ai-chat/types/chat-types'

export function RefinedAIAssistantSheet({
  open,
  onOpenChange,
  messages,
  loading,
  onSubmit,
  onSuggestionClick,
}: RefinedAIAssistantSheetProps) {
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery('(max-width: 640px)')

  const { scrollableRef, contentRef, scrollToBottom } = useAutoScroll(messages.length)

  // Efecto para hacer scroll al fondo cuando se abre el Sheet
  useEffect(() => {
    if (open && messages.length > 0) {
      scrollToBottom()
    }
  }, [open, messages.length, scrollToBottom])

  const handleToggleMessageExpansion = useCallback(
    (messageId: string) => {
      setExpandedMessages(prev => ({ ...prev, [messageId]: !prev[messageId] }))
      // Scroll to expanded message
      requestAnimationFrame(() => {
        if (contentRef.current) {
          const messageElement = contentRef.current.querySelector(
            `[data-message-id="${messageId}"]`
          )
          messageElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      })
    },
    [contentRef]
  )

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const hasMessages = messages.length > 0

  return (
    <Sheet open={open} onClose={handleClose} accessibilityLabel="AI Assistant Chat">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box padding="400" borderBlockEndWidth="025" borderColor="border">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ChatHeader isMobile={isMobile} onClose={handleClose} />
            <Button
              accessibilityLabel="Close chat"
              icon={XIcon}
              onClick={handleClose}
              variant="plain"
            />
          </div>
        </Box>

        {/* Message List */}
        <div style={{ flex: '1 1 0', overflowY: 'hidden' }}>
          <Scrollable style={{ height: '100%' }} ref={scrollableRef}>
            <div ref={contentRef}>
              <Box padding="400">
                {!hasMessages ? (
                  <EmptyState onSuggestionClick={onSuggestionClick} />
                ) : (
                  <MessageList
                    messages={messages}
                    loading={loading}
                    expandedMessages={expandedMessages}
                    onToggleExpansion={handleToggleMessageExpansion}
                    messagesEndRef={messagesEndRef}
                  />
                )}
              </Box>
            </div>
          </Scrollable>
        </div>

        {/* Input Area */}
        <Box padding="400" borderBlockStartWidth="025" borderColor="border">
          <AIInputWithSearch
            placeholder="Pregúntame cualquier cosa..."
            minHeight={48}
            maxHeight={96}
            onSubmit={onSubmit}
            className="py-2"
          />
        </Box>
      </div>
    </Sheet>
  )
}
