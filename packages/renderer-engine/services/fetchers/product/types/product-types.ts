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

import type { ProductContext } from '@/renderer-engine/types';

export type { ProductContext };

export interface PaginationOptions {
  limit?: number;
  nextToken?: string;
}

export interface ProductsResponse {
  products: ProductContext[];
  nextToken?: string | null;
  totalCount?: number;
}

export interface ProductsQueryResponse {
  products: ProductData[];
  nextToken?: string | null;
  totalCount?: number;
}

export interface ProductData {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  status: string;
  category?: string;
  images?: string;
  variants?: string;
  attributes?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
  slug?: string;
}

export interface ProductQueryOptions {
  limit?: number;
  nextToken?: string;
  filter?: {
    status?: { eq: string };
    collectionId?: { eq: string };
  };
}

export interface ProductHandleMap {
  [handle: string]: string;
}
