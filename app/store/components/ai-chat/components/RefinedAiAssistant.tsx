'use client';

import { AIInputWithSearch } from '@/app/store/components/ai-chat/components/AiInput';
import { ChatHeader } from '@/app/store/components/ai-chat/components/ChatHeader';
import { EmptyState } from '@/app/store/components/ai-chat/components/EmptyState';
import { MessageList } from '@/app/store/components/ai-chat/components/MessageList';
import { useAutoScroll } from '@/app/store/components/ai-chat/hooks/useAutoScroll';
import { RefinedAIAssistantSheetProps } from '@/app/store/components/ai-chat/types/chat-types';
import { Box, Button, Scrollable, Sheet } from '@shopify/polaris';
import { XIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useRef } from 'react';

export function RefinedAIAssistantSheet({
  open,
  onOpenChange,
  messages,
  loading,
  onSubmit,
  onSuggestionClick,
}: RefinedAIAssistantSheetProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { scrollableRef, contentRef, scrollToBottom } = useAutoScroll(messages.length);

  // Efecto para hacer scroll al fondo cuando se abre el Sheet
  useEffect(() => {
    if (open && messages.length > 0) {
      scrollToBottom();
    }
  }, [open, messages.length, scrollToBottom]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const hasMessages = messages.length > 0;

  const handleContentClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  const handleContentTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Sheet open={open} onClose={handleClose} accessibilityLabel="AI Assistant Chat">
      <div
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        onClick={handleContentClick}
        onTouchStart={handleContentTouchStart}>
        {/* Header */}
        <Box padding="400" borderBlockEndWidth="025" borderColor="border">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ChatHeader />
            <Button accessibilityLabel="Close chat" icon={XIcon} onClick={handleClose} variant="plain" />
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
                  <MessageList messages={messages} loading={loading} messagesEndRef={messagesEndRef} />
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
  );
}
