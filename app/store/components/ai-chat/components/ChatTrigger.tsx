'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { RefinedAIAssistantSheet } from '@/app/store/components/ai-chat/components/RefinedAiAssistant'
import { GradientSparkles } from '@/app/store/components/ai-chat/components/GradientSparkles'
import { useChat } from '@/app/store/components/ai-chat/hooks/useChat'

export function ChatTrigger() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages: chatMessages, loading, chat } = useChat()

  const transformedMessages = useMemo(
    () =>
      chatMessages.map((msg: { content: string; role: 'user' | 'assistant' }, index: number) => ({
        id: index.toString(),
        content: msg.content,
        type: msg.role === 'user' ? ('user' as const) : ('ai' as const),
        timestamp: new Date(),
      })),
    [chatMessages]
  )

  const handleSubmit = useCallback(
    async (value: string) => {
      if (!value.trim()) return
      await chat(value)
    },
    [chat]
  )

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      await chat(suggestion)
    },
    [chat]
  )

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative text-gray-700 hover:bg-gray-100"
      >
        <GradientSparkles className="w-30 h-30" />
      </Button>

      <RefinedAIAssistantSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        messages={transformedMessages}
        loading={loading}
        onSubmit={handleSubmit}
        onSuggestionClick={handleSuggestionClick}
      />
    </>
  )
}
