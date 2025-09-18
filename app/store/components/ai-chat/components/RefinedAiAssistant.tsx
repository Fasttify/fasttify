'use client';

import { AIInputWithSearch } from '@/app/store/components/ai-chat/components/AiInput';
import { ChatHeader } from '@/app/store/components/ai-chat/components/ChatHeader';
import { EmptyState } from '@/app/store/components/ai-chat/components/EmptyState';
import { MessageList } from '@/app/store/components/ai-chat/components/MessageList';
import { useSimpleChat } from '@/app/store/components/ai-chat/hooks/useSimpleChat';
import { RefinedAIAssistantSheetProps } from '@/app/store/components/ai-chat/types/chat-types';
import { Box, Scrollable, Spinner } from '@shopify/polaris';
import { useCallback, useEffect, useRef } from 'react';

export function RefinedAIAssistantSheet({ open, onOpenChange }: RefinedAIAssistantSheetProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Usar el hook de conversación AI
  const {
    messages,
    loading,
    error,
    hasMoreMessages,
    loadingMoreMessages,
    conversationName,
    sendMessage,
    loadConversationById,
    clearMessages,
    clearError,
    loadMoreMessages,
  } = useSimpleChat();

  // Scroll automático cuando cambian los mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(
    async (value: string) => {
      if (!value.trim()) return;

      try {
        await sendMessage(value);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [sendMessage]
  );

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      try {
        await sendMessage(suggestion);
      } catch (error) {
        console.error('Error sending suggestion:', error);
      }
    },
    [sendMessage]
  );

  const handleConversationSelect = useCallback(
    async (conversationId: string) => {
      try {
        await loadConversationById(conversationId);
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    },
    [loadConversationById]
  );

  const handleNewConversation = useCallback(() => {
    // TODO: Implementar lógica para nueva conversación
    clearMessages();
  }, [clearMessages]);

  const _handleClearChat = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  const hasMessages = messages.length > 0;

  const handleContentClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  const handleContentTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed right-0 w-[20vw] border-l rounded-l-lg h-[calc(98vh-2rem)] animate-in slide-in-from-right duration-300 ease-out"
      onClick={handleContentClick}
      onTouchStart={handleContentTouchStart}>
      {/* Loading Overlay */}
      {loading && !hasMessages && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
          <Spinner accessibilityLabel="Cargando chat" size="large" />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div
          style={{
            padding: '16px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
          }}>
          <ChatHeader
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
            onClose={handleClose}
            conversations={[]} // TODO: Implementar carga de conversaciones
            loading={false} // TODO: Implementar estado de carga
            conversationName={conversationName}
          />
        </div>

        {/* Error Display */}
        {error && (
          <Box padding="200" borderBlockEndWidth="025" borderColor="border">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">
                Error: {error.message}
                <button onClick={clearError} className="ml-2 text-red-600 underline hover:text-red-800">
                  Cerrar
                </button>
              </p>
            </div>
          </Box>
        )}

        {/* Message List */}
        <div style={{ flex: '1 1 0', overflowY: 'hidden' }}>
          <Scrollable style={{ height: '100%' }}>
            <div>
              <Box padding="400">
                {hasMessages ? (
                  <MessageList
                    messages={messages.map((msg) => ({
                      id: msg.id,
                      content: msg.content,
                      type: msg.role === 'user' ? 'user' : 'ai',
                      timestamp: new Date(),
                    }))}
                    loading={loading}
                    messagesEndRef={messagesEndRef}
                    hasMoreMessages={hasMoreMessages}
                    loadingMoreMessages={loadingMoreMessages}
                    onLoadMore={loadMoreMessages}
                  />
                ) : (
                  <EmptyState onSuggestionClick={handleSuggestionClick} />
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
            onSubmit={handleSubmit}
            className="py-2"
            loading={loading}
          />
        </Box>
      </div>
    </div>
  );
}
