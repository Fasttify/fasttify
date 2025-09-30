'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect, useRef } from 'react';
import { client } from '@/lib/amplify-client';

export interface Conversation {
  id: string;
  name?: string;
  metadata?: Record<string, any>;
  updatedAt: string;
  createdAt: string;
}

export interface ConversationOption {
  label: string;
  value: string;
  timestamp?: string;
  category?: 'today' | 'yesterday' | 'this-week' | 'older';
}

interface ConversationHistoryContextType {
  conversations: ConversationOption[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextToken: string | null;
  loadConversations: () => Promise<void>;
  loadMoreConversations: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  createConversation: (name?: string, metadata?: Record<string, any>) => Promise<string | null>;
  deleteConversation: (id: string) => Promise<boolean>;
}

const ConversationHistoryContext = createContext<ConversationHistoryContextType | undefined>(undefined);

export function ConversationHistoryProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<ConversationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Ref para evitar múltiples cargas
  const hasLoadedRef = useRef(false);

  // Función para categorizar conversaciones por fecha - estable
  const categorizeConversation = useCallback((conversation: Conversation): ConversationOption => {
    const now = Date.now(); // Usar timestamp fijo para evitar recreaciones
    const updatedAt = new Date(conversation.updatedAt).getTime();
    const diffInHours = (now - updatedAt) / (1000 * 60 * 60);

    let category: 'today' | 'yesterday' | 'this-week' | 'older';
    if (diffInHours < 24) {
      category = 'today';
    } else if (diffInHours < 48) {
      category = 'yesterday';
    } else if (diffInHours < 168) {
      // 7 días
      category = 'this-week';
    } else {
      category = 'older';
    }

    return {
      label: conversation.name || `Conversación ${conversation.id.slice(0, 8)}`,
      value: conversation.id,
      timestamp: conversation.updatedAt,
      category,
    };
  }, []); // Sin dependencias para mantenerla estable

  // Cargar conversaciones iniciales
  const loadConversations = useCallback(async () => {
    if (hasLoadedRef.current) {
      return; // Ya se cargó, evitar múltiples requests
    }

    try {
      setLoading(true);
      setError(null);

      const { data: conversationsData, nextToken: newNextToken } = await client.conversations.chat.list({
        limit: 20,
      });

      const formattedConversations = conversationsData.map(categorizeConversation);

      setConversations(formattedConversations);
      setNextToken(newNextToken || null);
      setHasMore(!!newNextToken);
      hasLoadedRef.current = true; // Marcar como cargado
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar conversaciones');
    } finally {
      setLoading(false);
    }
  }, [categorizeConversation]);

  // Cargar más conversaciones (paginación)
  const loadMoreConversations = useCallback(async () => {
    if (!nextToken || loading) return;

    try {
      setLoading(true);
      setError(null);

      const { data: conversationsData, nextToken: newNextToken } = await client.conversations.chat.list({
        limit: 20,
        nextToken,
      });

      const formattedConversations = conversationsData.map(categorizeConversation);

      setConversations((prev) => [...prev, ...formattedConversations]);
      setNextToken(newNextToken || null);
      setHasMore(!!newNextToken);
    } catch (err) {
      console.error('Error loading more conversations:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar más conversaciones');
    } finally {
      setLoading(false);
    }
  }, [nextToken, loading, categorizeConversation]);

  // Refrescar conversaciones
  const refreshConversations = useCallback(async () => {
    setNextToken(null);
    setHasMore(true);
    hasLoadedRef.current = false; // Resetear para permitir nueva carga
    await loadConversations();
  }, [loadConversations]);

  // Crear nueva conversación
  const createConversation = useCallback(
    async (name?: string, metadata?: Record<string, any>): Promise<string | null> => {
      try {
        const { data: newConversation } = await client.conversations.chat.create({
          name: name || `Nueva conversación ${new Date().toLocaleString('es-ES')}`,
          metadata: metadata || {},
        });

        // Refrescar la lista de conversaciones
        await refreshConversations();

        return newConversation?.id || null;
      } catch (err) {
        console.error('Error creating conversation:', err);
        setError(err instanceof Error ? err.message : 'Error al crear conversación');
        return null;
      }
    },
    [refreshConversations]
  );

  // Eliminar conversación
  const deleteConversation = useCallback(async (id: string): Promise<boolean> => {
    try {
      await client.conversations.chat.delete({ id });

      // Actualizar la lista local
      setConversations((prev) => prev.filter((conv) => conv.value !== id));

      return true;
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar conversación');
      return false;
    }
  }, []);

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const value: ConversationHistoryContextType = {
    conversations,
    loading,
    error,
    hasMore,
    nextToken,
    loadConversations,
    loadMoreConversations,
    refreshConversations,
    createConversation,
    deleteConversation,
  };

  return <ConversationHistoryContext.Provider value={value}>{children}</ConversationHistoryContext.Provider>;
}

export function useConversationHistoryContext() {
  const context = useContext(ConversationHistoryContext);
  if (context === undefined) {
    throw new Error('useConversationHistoryContext must be used within a ConversationHistoryProvider');
  }
  return context;
}
