/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { CollectionContext } from '@/renderer-engine/types';

export type { CollectionContext };

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  nextToken?: string;
}

export interface CollectionsResponse {
  collections: CollectionContext[];
  nextToken?: string | null;
}

export interface CollectionData {
  id: string;
  storeId: string;
  title: string;
  name?: string;
  description?: string;
  image?: string;
  owner: string;
  sortOrder?: number;
  slug?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionQueryOptions {
  limit?: number;
  nextToken?: string;
  filter?: {
    isActive?: { eq: boolean };
  };
}
