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

import { Button } from '@shopify/polaris';
import { PlusIcon } from '@shopify/polaris-icons';
import type { StoreListHeaderProps } from '../types/store.types';

export function StoreListHeader({ canCreateStore, onCreateStore }: StoreListHeaderProps) {
  const primaryAction = canCreateStore
    ? {
        content: 'Crear tienda',
        onAction: onCreateStore,
        icon: PlusIcon,
      }
    : undefined;

  return (
    <div style={{ marginBottom: '32px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '24px',
        }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: '#1a1a1a', flex: 1 }}>
          Bienvenido de nuevo
        </h1>
        {primaryAction && (
          <Button onClick={primaryAction.onAction} variant="primary" icon={PlusIcon}>
            {primaryAction.content}
          </Button>
        )}
      </div>
    </div>
  );
}
