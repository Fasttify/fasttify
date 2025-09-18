'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ConversationContextType {
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  clearConversation: () => void;
  loadExistingConversation: (id: string) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  // Inicializar con el valor de sessionStorage si existe
  const [conversationId, setConversationId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('ai-conversation-id');
      return saved || null;
    }
    return null;
  });

  // Persistir el ID de conversación en sessionStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (conversationId) {
        sessionStorage.setItem('ai-conversation-id', conversationId);
      } else {
        sessionStorage.removeItem('ai-conversation-id');
      }
    }
  }, [conversationId]);

  const clearConversation = () => {
    setConversationId(null);
  };

  const loadExistingConversation = (id: string) => {
    setConversationId(id);
  };

  return (
    <ConversationContext.Provider
      value={{ conversationId, setConversationId, clearConversation, loadExistingConversation }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationContext() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversationContext must be used within a ConversationProvider');
  }
  return context;
}
