/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use client';

import { Popover, ActionList, Text, BlockStack, InlineStack } from '@shopify/polaris';
import { ExitIcon, SettingsIcon, ReplaceIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import type { UserMenuProps } from '../types/store.types';

function getInitialsFromEmail(email: string): string {
  return email.split('@')[0].slice(0, 2).toUpperCase();
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [popoverActive, setPopoverActive] = useState(false);

  if (!user) {
    return null;
  }

  const initials = getInitialsFromEmail(user.email);

  const togglePopoverActive = () => setPopoverActive((prev) => !prev);

  const handleLogout = () => {
    setPopoverActive(false);
    onLogout();
  };

  const actions = [
    {
      content: 'Gestionar cuenta',
      icon: SettingsIcon,
      onAction: () => {
        setPopoverActive(false);
        // TODO: Implementar navegación a configuración de cuenta
      },
    },
    {
      content: 'Cambiar de cuenta',
      icon: ReplaceIcon,
      onAction: () => {
        setPopoverActive(false);
        // TODO: Implementar cambio de cuenta
      },
    },
    {
      content: 'Cerrar sesión',
      icon: ExitIcon,
      destructive: true,
      onAction: handleLogout,
    },
  ];

  return (
    <Popover
      active={popoverActive}
      fluidContent
      activator={
        <button
          onClick={togglePopoverActive}
          style={{
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: '#4ade80',
            color: '#166534',
            minWidth: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
          }}>
          {initials}
        </button>
      }
      onClose={() => setPopoverActive(false)}
      preferredAlignment="right">
      <div style={{ padding: '16px', minWidth: '200px' }}>
        <BlockStack gap="200">
          <InlineStack align="center" gap="200">
            <BlockStack gap="100">
              <Text variant="bodyMd" as="p" truncate>
                {user.email.length > 20 ? `${user.email.slice(0, 20)}...` : user.email}
              </Text>
              <Text variant="bodySm" as="p" tone="subdued">
                {user.email}
              </Text>
            </BlockStack>
          </InlineStack>
          <ActionList items={actions} onActionAnyItem={() => setPopoverActive(false)} />
        </BlockStack>
      </div>
    </Popover>
  );
}
