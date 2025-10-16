'use client';

import { useCallback } from 'react';
import { TopBar, Icon } from '@shopify/polaris';
import { MagicIcon } from '@shopify/polaris-icons';
import { useChatContext } from '@/app/store/components/ai-chat/context/ChatContext';
import { useChatMobileDetection } from '@/app/store/components/ai-chat/hooks/useMobileDetection';

export function ChatTrigger() {
  const { isOpen, setIsOpen } = useChatContext();
  const { renderOnDesktopOnly, preventMobileAction } = useChatMobileDetection(setIsOpen);

  const handleMenuToggle = useCallback(() => {
    preventMobileAction(() => {
      setIsOpen(!isOpen);
    });
  }, [isOpen, setIsOpen, preventMobileAction]);

  const handleMenuClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return renderOnDesktopOnly(
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
