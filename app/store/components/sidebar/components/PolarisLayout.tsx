'use client';

import { NavigationPolaris } from '@/app/store/components/sidebar/components/NavigationPolaris';
import { TopBarPolaris } from '@/app/store/components/sidebar/components/TopBarPolaris';
import { PageTransition } from '@/components/ui/page-transition';
import { AppProvider, Frame } from '@shopify/polaris';
import { routes } from '@/utils/client/routes';
import translations from '@shopify/polaris/locales/es.json';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useMemo, memo } from 'react';
import { ChatLayout } from '@/app/store/components/ai-chat/components/ChatLayout';
import { useChatContext } from '@/app/store/components/ai-chat/context/ChatContext';
import { ConversationProvider } from '@/app/store/components/ai-chat/context/ConversationContext';
import { ConversationHistoryProvider } from '@/app/store/components/ai-chat/context/ConversationHistoryContext';
import { RefinedAIAssistantSheet } from '@/app/store/components/ai-chat/components/RefinedAiAssistant';
import { useChat } from '@/app/store/components/ai-chat/hooks/useChat';

interface PolarisLayoutProps {
  children: React.ReactNode;
  storeId: string;
  prefersReducedMotion?: boolean;
}

const PolarisLinkComponent = memo(({ children, url = '', external = false, ...rest }: any) => {
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!external && url) {
        e.preventDefault();
        router.push(url);
      }
    },
    [external, url, router]
  );

  if (external) {
    return (
      <a href={url} {...rest} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={url} {...rest} onClick={handleClick}>
      {children}
    </Link>
  );
});

PolarisLinkComponent.displayName = 'PolarisLinkComponent';

const ChatComponent = memo(() => {
  const { isOpen, setIsOpen } = useChatContext();
  const { messages: chatMessages, loading, chat } = useChat();

  const transformedMessages = useMemo(
    () =>
      chatMessages.map((msg: { content: string; role: 'user' | 'assistant' }, index: number) => ({
        id: index.toString(),
        content: msg.content,
        type: msg.role === 'user' ? ('user' as const) : ('ai' as const),
        timestamp: new Date(),
      })),
    [chatMessages]
  );

  const handleSubmit = useCallback(
    async (value: string) => {
      if (!value.trim()) return;
      await chat(value);
    },
    [chat]
  );

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      await chat(suggestion);
    },
    [chat]
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
    },
    [setIsOpen]
  );

  return (
    <RefinedAIAssistantSheet
      open={isOpen}
      onOpenChange={handleOpenChange}
      messages={transformedMessages}
      loading={loading}
      onSubmit={handleSubmit}
      onSuggestionClick={handleSuggestionClick}
    />
  );
});

ChatComponent.displayName = 'ChatComponent';

export const PolarisLayout = memo(({ children, storeId, prefersReducedMotion = false }: PolarisLayoutProps) => {
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);
  const { isOpen: isChatOpen } = useChatContext();

  const logo = useMemo(
    () => ({
      topBarSource: 'https://cdn.fasttify.com/assets/b/fasttify-white.webp',
      width: 40,
      url: routes.store.dashboard.main(storeId),
      accessibilityLabel: 'Fasttify',
    }),
    [storeId]
  );

  const handleNavigationToggle = useCallback(() => {
    setMobileNavigationActive((prev) => !prev);
  }, []);

  const handleNavigationDismiss = useCallback(() => {
    setMobileNavigationActive(false);
  }, []);

  const topBarComponent = useMemo(
    () => <TopBarPolaris storeId={storeId} onNavigationToggle={handleNavigationToggle} />,
    [storeId, handleNavigationToggle]
  );

  const navigationComponent = useMemo(() => <NavigationPolaris storeId={storeId} />, [storeId]);

  return (
    <AppProvider i18n={translations} theme="light" linkComponent={PolarisLinkComponent} features={{ topBar: true }}>
      <ConversationProvider>
        <ConversationHistoryProvider>
          <div style={{ height: '250px' }}>
            <Frame
              topBar={topBarComponent}
              navigation={navigationComponent}
              showMobileNavigation={mobileNavigationActive}
              onNavigationDismiss={handleNavigationDismiss}
              logo={logo}>
              <main className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-[#f3f4f6]">
                <ChatLayout isChatOpen={isChatOpen}>
                  <PageTransition enabled={!prefersReducedMotion}>{children}</PageTransition>
                </ChatLayout>
                <ChatComponent />
              </main>
            </Frame>
          </div>
        </ConversationHistoryProvider>
      </ConversationProvider>
    </AppProvider>
  );
});

PolarisLayout.displayName = 'PolarisLayout';
