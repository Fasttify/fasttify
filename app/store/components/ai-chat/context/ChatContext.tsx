'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useMobileDetection } from '@/app/store/components/ai-chat/hooks/useMobileDetection';

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [internalIsOpen, setInternalIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('chat-is-open');
      return saved === 'true';
    }
    return false;
  });

  // Usar el hook de detección móvil
  const { preventMobileAction } = useMobileDetection(() => {
    if (internalIsOpen) {
      setInternalIsOpen(false);
    }
  }, true);

  // Persistir el estado en sessionStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('chat-is-open', internalIsOpen.toString());
    }
  }, [internalIsOpen]);

  // Función personalizada para setIsOpen que previene abrir en móvil
  const setIsOpenSafe = (open: boolean) => {
    preventMobileAction(() => {
      setInternalIsOpen(open);
    });
  };

  return (
    <ChatContext.Provider value={{ isOpen: internalIsOpen, setIsOpen: setIsOpenSafe }}>{children}</ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
