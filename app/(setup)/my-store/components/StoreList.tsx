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

import { BlockStack } from '@shopify/polaris';
import { StoreCard } from './StoreCard';
import { EmptyStoreState } from './EmptyStoreState';
import type { StoreListProps } from '../types/store.types';

export function StoreList({ stores, onStoreSelect, canCreateStore, onCreateStore }: StoreListProps) {
  if (stores.length === 0) {
    return <EmptyStoreState canCreateStore={canCreateStore} onCreateStore={onCreateStore} />;
  }

  return (
    <BlockStack gap="100">
      {stores.map((store) => (
        <StoreCard key={store.storeId} store={store} onClick={onStoreSelect} />
      ))}
    </BlockStack>
  );
}
