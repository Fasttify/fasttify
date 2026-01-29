'use client';

import { ReactNode } from 'react';

interface ChatLayoutProps {
  children: ReactNode;
  isChatOpen: boolean;
}

export function ChatLayout({ children, isChatOpen }: ChatLayoutProps) {
  return <div className={`transition-all duration-300 ease-in-out ${isChatOpen ? 'mr-96' : 'mr-0'}`}>{children}</div>;
}
