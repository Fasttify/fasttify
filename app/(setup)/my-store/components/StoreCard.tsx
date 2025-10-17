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

import { Text, BlockStack, InlineStack } from '@shopify/polaris';
import type { StoreCardProps } from '../types/store.types';

function getInitialsFromName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function StoreCard({ store, onClick }: StoreCardProps) {
  const initials = getInitialsFromName(store.storeName);
  const domain = store.defaultDomain || `${store.storeId}.fasttify.com`;

  return (
    <div
      onClick={() => onClick(store.storeId)}
      style={{
        cursor: 'pointer',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px 24px',
        marginBottom: '6px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#d1d5db';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(store.storeId);
        }
      }}
      aria-label={`Seleccionar tienda ${store.storeName}`}>
      <InlineStack align="space-between" blockAlign="center" gap="300">
        <InlineStack align="center" gap="300">
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#4ade80',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#166534',
              fontSize: '14px',
              fontWeight: '600',
            }}>
            {initials}
          </div>
          <BlockStack gap="100">
            <Text variant="headingSm" as="h3">
              {store.storeName}
            </Text>
            <Text variant="bodySm" tone="subdued" as="p">
              {domain}
            </Text>
          </BlockStack>
        </InlineStack>
        <div style={{ color: '#6b7280', fontSize: '16px' }}>›</div>
      </InlineStack>
    </div>
  );
}
