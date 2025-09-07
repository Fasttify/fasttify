'use client';

import { useState, useCallback, useMemo } from 'react';
import { TopBar, Icon } from '@shopify/polaris';
import { RefinedAIAssistantSheet } from '@/app/store/components/ai-chat/components/RefinedAiAssistant';
import { useChat } from '@/app/store/components/ai-chat/hooks/useChat';
import { MagicIcon } from '@shopify/polaris-icons';

export function ChatTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages: chatMessages, loading, chat } = useChat();

  const transformedMessages = useMemo(
    () =>
      chatMessages.map((msg: { content: string; role: 'user' | 'assistant' }, index: number) => ({
        id: index.toString(),
        content: msg.content,
        type: msg.role === 'user' ? ('user' as const) : ('ai' as const),
        timestamp: new Date(),
      })),
    [chatMessages]
  );

  const handleSubmit = useCallback(
    async (value: string) => {
      if (!value.trim()) return;
      await chat(value);
    },
    [chat]
  );

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      await chat(suggestion);
    },
    [chat]
  );

  const handleMenuToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <TopBar.Menu
        activatorContent={<Icon source={MagicIcon} tone="base" />}
        open={isOpen}
        onOpen={handleMenuToggle}
        onClose={handleMenuClose}
        actions={[
          {
            items: [
              {
                content: 'Abrir Asistente de IA',
                onAction: () => setIsOpen(true),
              },
            ],
          },
        ]}
      />

      <RefinedAIAssistantSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        messages={transformedMessages}
        loading={loading}
        onSubmit={handleSubmit}
        onSuggestionClick={handleSuggestionClick}
      />
    </>
  );
}
