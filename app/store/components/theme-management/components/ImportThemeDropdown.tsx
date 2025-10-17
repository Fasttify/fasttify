'use client';

import { ActionList, Button, Popover } from '@shopify/polaris';
import { CaretDownIcon, UploadIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import type { ImportThemeDropdownProps } from '@/app/store/components/theme-management/types/theme-types';

export function ImportThemeDropdown({ onUploadTheme }: ImportThemeDropdownProps) {
  const [activePopover, setActivePopover] = useState(false);

  const handleAction = (action: string): void => {
    if (action === 'upload') {
      onUploadTheme();
    }
    setActivePopover(false);
  };

  const dropdownActions = [
    {
      content: 'Subir archivo zip',
      icon: UploadIcon,
      onAction: () => handleAction('upload'),
    },
  ];

  return (
    <Popover
      active={activePopover}
      activator={
        <Button icon={CaretDownIcon} onClick={() => setActivePopover(!activePopover)}>
          Importar tema
        </Button>
      }
      onClose={() => setActivePopover(false)}
      preferredPosition="below"
      preferredAlignment="right">
      <ActionList actionRole="menuitem" items={dropdownActions} />
    </Popover>
  );
}
