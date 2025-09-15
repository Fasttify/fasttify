'use client';

import { useCallback } from 'react';
import { TopBar, Icon } from '@shopify/polaris';
import { MagicIcon } from '@shopify/polaris-icons';
import { useChatContext } from '@/app/store/components/ai-chat/context/ChatContext';

export function ChatTrigger() {
  const { isOpen, setIsOpen } = useChatContext();

  const handleMenuToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  const handleMenuClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <TopBar.Menu
      activatorContent={<Icon source={MagicIcon} tone="base" />}
      open={isOpen}
      onOpen={handleMenuToggle}
      onClose={handleMenuClose}
      actions={[
        {
          items: [
            {
              onAction: () => setIsOpen(true),
            },
          ],
        },
      ]}
    />
  );
}
