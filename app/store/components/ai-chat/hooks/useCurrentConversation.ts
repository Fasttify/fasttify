'use client';

import { useState, useCallback, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

interface UseCurrentConversationProps {
  conversationId?: string;
}

export interface UseCurrentConversationReturn {
  currentConversationId: string | null;
  conversationName: string | null;
  isLoading: boolean;
  error: string | null;
  resumeConversation: (id: string) => Promise<boolean>;
  createNewConversation: () => Promise<string | null>;
  updateConversationName: (id: string, name: string) => Promise<boolean>;
}

const client = generateClient<Schema>({
  authMode: 'userPool',
});

export function useCurrentConversation({
  conversationId,
}: UseCurrentConversationProps = {}): UseCurrentConversationReturn {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const [conversationName, setConversationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar información de la conversación actual
  const loadConversationInfo = useCallback(
    async (id: string) => {
      // Solo actualizar el nombre si no lo tenemos
      if (!conversationName) {
        setConversationName(`Conversación ${id.slice(0, 8)}`);
      }
    },
    [conversationName]
  );

  // Reanudar conversación existente
  const resumeConversation = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar que la conversación existe
      const { data: conversation } = await client.conversations.chat.get({ id });

      if (!conversation) {
        setError('Conversación no encontrada');
        return false;
      }

      setCurrentConversationId(id);
      setConversationName(conversation.name || `Conversación ${id.slice(0, 8)}`);

      return true;
    } catch (err) {
      console.error('Error resuming conversation:', err);
      setError(err instanceof Error ? err.message : 'Error al reanudar conversación');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crear nueva conversación
  const createNewConversation = useCallback(async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: newConversation } = await client.conversations.chat.create({
        name: `Nueva conversación ${new Date().toLocaleString('es-ES')}`,
        metadata: {},
      });

      if (newConversation) {
        setCurrentConversationId(newConversation.id);
        setConversationName(newConversation.name || `Conversación ${newConversation.id.slice(0, 8)}`);
        return newConversation.id;
      }

      return null;
    } catch (err) {
      console.error('Error creating new conversation:', err);
      setError(err instanceof Error ? err.message : 'Error al crear nueva conversación');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar nombre de conversación
  const updateConversationName = useCallback(async (id: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await client.conversations.chat.update({
        id,
        name,
      });

      setConversationName(name);
      return true;
    } catch (err) {
      console.error('Error updating conversation name:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar nombre de conversación');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar información de la conversación cuando cambie el ID
  useEffect(() => {
    if (currentConversationId) {
      loadConversationInfo(currentConversationId);
    }
  }, [currentConversationId, loadConversationInfo]);

  // Actualizar el ID de conversación cuando cambie la prop
  useEffect(() => {
    if (conversationId && conversationId !== currentConversationId) {
      setCurrentConversationId(conversationId);
    }
  }, [conversationId, currentConversationId]);

  return {
    currentConversationId,
    conversationName,
    isLoading,
    error,
    resumeConversation,
    createNewConversation,
    updateConversationName,
  };
}
