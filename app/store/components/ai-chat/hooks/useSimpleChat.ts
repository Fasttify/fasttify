/**
 * @fileoverview Hook simplificado para chat AI.
 * Wrapper del hook useConversation con funcionalidades simplificadas.
 */

import { useCallback, useEffect } from 'react';
import { useConversation } from './useConversation';

export interface UseSimpleChatReturn {
  // Estado simplificado
  messages: Array<{ content: string; role: 'user' | 'assistant'; id: string }>;
  loading: boolean;
  error: Error | null;

  // Paginación
  hasMoreMessages: boolean;
  loadingMoreMessages: boolean;

  // Acciones simplificadas
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  loadMoreMessages: () => Promise<void>;

  // Utilidades
  isLoading: boolean;
  hasError: boolean;
}

/**
 * Hook simplificado para chat AI con funcionalidades básicas.
 * Ideal para casos de uso simples.
 */
export function useSimpleChat(): UseSimpleChatReturn {
  const {
    messages,
    isLoading,
    error,
    conversation,
    streamingText,
    isInitializing,
    hasMoreMessages,
    loadingMoreMessages,
    initializeConversation,
    sendMessage: sendMessageInternal,
    resetConversation,
    clearError: clearErrorInternal,
    loadMoreMessages: loadMoreMessagesInternal,
  } = useConversation();

  /**
   * Inicializar conversación automáticamente solo una vez
   */
  useEffect(() => {
    if (!conversation && !isLoading && !isInitializing) {
      initializeConversation();
    }
  }, [conversation, isLoading, isInitializing, initializeConversation]);

  /**
   * Envía un mensaje simple
   */
  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      try {
        await sendMessageInternal(message);
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    [sendMessageInternal]
  );

  /**
   * Limpia todos los mensajes reiniciando la conversación
   */
  const clearMessages = useCallback((): void => {
    resetConversation();
  }, [resetConversation]);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback((): void => {
    clearErrorInternal();
  }, [clearErrorInternal]);

  /**
   * Cargar más mensajes
   */
  const loadMoreMessages = useCallback(async (): Promise<void> => {
    try {
      await loadMoreMessagesInternal();
    } catch (error) {
      console.error('Error loading more messages:', error);
      throw error;
    }
  }, [loadMoreMessagesInternal]);

  // Convertir mensajes al formato esperado
  const formattedMessages = messages.map((msg) => ({
    content: msg.content,
    role: msg.role,
    id: msg.id,
  }));

  // Agregar mensaje de streaming si está activo
  const allMessages = streamingText
    ? [
        ...formattedMessages,
        {
          id: 'streaming',
          content: streamingText,
          role: 'assistant' as const,
        },
      ]
    : formattedMessages;

  return {
    messages: allMessages,
    loading: isLoading || isInitializing,
    error: error ? new Error(error) : null,
    hasMoreMessages,
    loadingMoreMessages,
    sendMessage,
    clearMessages,
    clearError,
    loadMoreMessages,
    isLoading,
    hasError: !!error,
  };
}
