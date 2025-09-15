'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  // Inicializar con el valor de sessionStorage si existe
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('chat-is-open');
      return saved === 'true';
    }
    return false;
  });

  // Persistir el estado en sessionStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('chat-is-open', isOpen.toString());
    }
  }, [isOpen]);

  return <ChatContext.Provider value={{ isOpen, setIsOpen }}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
