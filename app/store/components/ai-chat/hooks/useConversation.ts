/**
 * @fileoverview Hook sencillo para conversaciones AI con Amplify Gen 2.
 */

import { useState, useCallback, useRef } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useConversationContext } from '../context/ConversationContext';

const client = generateClient<Schema>({
  authMode: 'userPool',
});

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

export interface StreamEvent {
  id: string;
  conversationId: string;
  associatedUserMessageId: string;
  contentBlockIndex: number;
  contentBlockDeltaIndex?: number;
  text?: string;
  contentBlockDoneAtIndex?: number;
  stopReason?: string;
  toolUse?: any;
  errors?: Array<{
    message: string;
    code?: string;
  }>;
}

export interface UseConversationReturn {
  // Estado
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversation: any | null;
  streamingText: string;
  isInitializing: boolean;

  // Paginación
  hasMoreMessages: boolean;
  loadingMoreMessages: boolean;
  nextToken: string | null;

  // Acciones
  initializeConversation: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  resetConversation: () => void;
  clearError: () => void;
  listMessages: () => Promise<void>;
  loadMoreMessages: () => Promise<void>;
}

/**
 * Hook sencillo para conversaciones AI con streaming.
 */
export function useConversation(): UseConversationReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<any>(null);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Estados de paginación
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [nextToken, setNextToken] = useState<string | null>(null);

  // Refs para evitar recreaciones innecesarias
  const initializationRef = useRef(false);
  const conversationRef = useRef(conversation);
  const isInitializingRef = useRef(isInitializing);

  // Usar el contexto para persistir el ID de conversación
  const { conversationId, setConversationId, clearConversation: clearConversationContext } = useConversationContext();

  // Actualizar refs cuando cambien los valores
  conversationRef.current = conversation;
  isInitializingRef.current = isInitializing;

  /**
   * Cargar mensajes existentes de una conversación
   */
  const loadExistingMessages = useCallback(async (conversationInstance: any, limit: number = 20) => {
    try {
      const {
        data: messagesData,
        errors,
        nextToken: newNextToken,
      } = await conversationInstance.listMessages({
        limit,
        nextToken: null, // Siempre empezar desde el principio
      });

      if (errors) {
        console.error('Error listing messages:', errors);
        return;
      }

      if (messagesData && messagesData.length > 0) {
        // Convertir los mensajes de Amplify al formato esperado
        const formattedMessages: Message[] = messagesData.map((msg: any) => ({
          id: msg.id,
          content: msg.content?.[0]?.text || '',
          role: msg.role === 'user' ? 'user' : 'assistant',
          createdAt: msg.createdAt,
        }));

        setMessages(formattedMessages);
        setNextToken(newNextToken);
        setHasMoreMessages(!!newNextToken);
      } else {
        setMessages([]);
        setNextToken(null);
        setHasMoreMessages(false);
      }
    } catch (error: any) {
      console.error('Error listing messages:', error);
    }
  }, []);

  /**
   * Inicializar conversación
   */
  const initializeConversation = useCallback(async () => {
    // Evitar múltiples inicializaciones simultáneas
    if (isInitializingRef.current || conversationRef.current || initializationRef.current) {
      return;
    }
    try {
      initializationRef.current = true;
      setIsInitializing(true);
      setError(null);

      // Si ya tenemos un ID de conversación, intentar obtener la conversación existente
      if (conversationId) {
        const { data: existingConversation, errors: getErrors } = await client.conversations.chat.get({
          id: conversationId,
        });

        if (!getErrors && existingConversation) {
          setConversation(existingConversation);

          // Cargar mensajes existentes
          await loadExistingMessages(existingConversation);
          setIsInitializing(false);
          initializationRef.current = false;
          return;
        }
      }

      // Crear nueva conversación
      const { data: newConversation, errors } = await client.conversations.chat.create();

      if (errors) {
        console.error('Error creating conversation:', errors);
        setError(`Error al crear conversación: ${errors.map((e: any) => e.message).join('; ')}`);
        setIsInitializing(false);
        return;
      }

      setConversation(newConversation);
      setConversationId(newConversation?.id || null);
      setIsInitializing(false);
      initializationRef.current = false;
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      setError(`Error al crear conversación: ${error.message || 'Error desconocido'}`);
      setIsInitializing(false);
      initializationRef.current = false;
    }
  }, [conversationId, setConversationId, loadExistingMessages]);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reiniciar conversación
   */
  const resetConversation = useCallback(() => {
    setConversation(null);
    setMessages([]);
    setError(null);
    setStreamingText('');
    setIsLoading(false);
    setIsInitializing(false);
    setHasMoreMessages(false);
    setLoadingMoreMessages(false);
    setNextToken(null);
    initializationRef.current = false;
    // Limpiar también el contexto
    clearConversationContext();
  }, [clearConversationContext]);

  /**
   * Enviar mensaje
   */
  const sendMessage = useCallback(
    async (inputMessage: string) => {
      if (!inputMessage.trim() || !conversation || isLoading) return;

      const userMessage = inputMessage.trim();
      setIsLoading(true);
      setStreamingText('');
      setError(null);

      try {
        // Agregar mensaje del usuario a la UI
        const userMsg: Message = {
          id: `user-${Date.now()}`,
          content: userMessage,
          role: 'user',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);

        // Enviar mensaje a la conversación

        const { data: _message, errors } = await conversation.sendMessage({
          content: [{ text: userMessage }],
        });

        if (errors) {
          console.error('Error sending message:', errors);
          setError(`Error al enviar mensaje: ${errors.map((e: any) => e.message).join('; ')}`);
          setIsLoading(false);
          return;
        }

        // Suscribirse a eventos de streaming
        let accumulatedText = ''; // Variable local para acumular el texto
        const subscription = conversation.onStreamEvent({
          next: (event: StreamEvent) => {
            // Verificar si hay errores en el evento
            if (event.errors && event.errors.length > 0) {
              console.error('Errors in streaming event:', {
                eventId: event.id,
                conversationId: event.conversationId,
                associatedUserMessageId: event.associatedUserMessageId,
                errors: event.errors,
              });

              const errorMessage = event.errors
                .map((err) => `${err.message}${err.code ? ` (${err.code})` : ''}`)
                .join('; ');
              setError(`Error in streaming: ${errorMessage}`);
              setIsLoading(false);
              setStreamingText('');
              subscription.unsubscribe();
              return;
            }

            if (event.text) {
              // Evento de texto streaming
              accumulatedText += event.text; // Acumular en variable local
              setStreamingText((prev) => prev + event.text);
            } else if (event.contentBlockDoneAtIndex !== undefined) {
              // Bloque de contenido completado
            } else if (event.stopReason) {
              // Turno completado

              // Agregar mensaje del asistente a la UI usando el texto acumulado
              setMessages((prev) => {
                const finalText = accumulatedText + (event.text || '');
                const assistantMsg: Message = {
                  id: `assistant-${Date.now()}`,
                  content: finalText,
                  role: 'assistant',
                  createdAt: new Date().toISOString(),
                };
                return [...prev, assistantMsg];
              });

              // Limpiar estado de streaming
              setStreamingText('');
              setIsLoading(false);

              // Desuscribirse
              subscription.unsubscribe();
            }
          },
          error: (error: any) => {
            console.error('Error in streaming:', error);
            setError(`Error en streaming: ${error.message || 'Error desconocido'}`);
            setIsLoading(false);
            setStreamingText('');
          },
        });
      } catch (error: any) {
        console.error('Error sending message:', error);
        setError(`Error al enviar mensaje: ${error.message || 'Error desconocido'}`);
        setIsLoading(false);
      }
    },
    [conversation, isLoading]
  );

  /**
   * Listar mensajes de la conversación
   */
  const listMessages = useCallback(async () => {
    if (!conversation) return;

    try {
      const { data: _conversationMessages } = await conversation.listMessages();
    } catch (error) {
      console.error('Error listing messages:', error);
    }
  }, [conversation]);

  /**
   * Cargar más mensajes (paginación)
   */
  const loadMoreMessages = useCallback(async () => {
    if (!conversation || !nextToken || loadingMoreMessages) return;

    try {
      setLoadingMoreMessages(true);
      setError(null);

      const {
        data: messagesData,
        errors,
        nextToken: newNextToken,
      } = await conversation.listMessages({
        limit: 20,
        nextToken,
      });

      if (errors) {
        console.error('Error loading more messages:', errors);
        setError(`Error al cargar más mensajes: ${errors.map((e: any) => e.message).join('; ')}`);
        setLoadingMoreMessages(false);
        return;
      }

      if (messagesData && messagesData.length > 0) {
        // Convertir los mensajes de Amplify al formato esperado
        const formattedMessages: Message[] = messagesData.map((msg: any) => ({
          id: msg.id,
          content: msg.content?.[0]?.text || '',
          role: msg.role === 'user' ? 'user' : 'assistant',
          createdAt: msg.createdAt,
        }));

        // Agregar mensajes al inicio (los más antiguos van arriba)
        setMessages((prev) => [...formattedMessages, ...prev]);
        setNextToken(newNextToken);
        setHasMoreMessages(!!newNextToken);
      } else {
        setHasMoreMessages(false);
      }

      setLoadingMoreMessages(false);
    } catch (error: any) {
      console.error('Error loading more messages:', error);
      setError(`Error al cargar más mensajes: ${error.message || 'Error desconocido'}`);
      setLoadingMoreMessages(false);
    }
  }, [conversation, nextToken, loadingMoreMessages]);

  return {
    messages,
    isLoading,
    error,
    conversation,
    streamingText,
    isInitializing,
    hasMoreMessages,
    loadingMoreMessages,
    nextToken,
    initializeConversation,
    sendMessage,
    resetConversation,
    clearError,
    listMessages,
    loadMoreMessages,
  };
}
