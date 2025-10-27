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

import type { PageContext } from '../../../../types';

export type { PageContext };

export interface PaginationOptions {
  limit?: number;
  nextToken?: string;
}

export interface PagesResponse {
  pages: PageContext[];
  nextToken?: string | null;
}

export interface PageData {
  id: string;
  title: string;
  content: string;
  slug?: string;
  storeId: string;
  isVisible: boolean;
  status: string;
  pageType: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageQueryOptions {
  limit?: number;
  nextToken?: string;
  filter?: {
    isVisible?: { eq: boolean };
    status?: { eq: string };
    pageType?: { eq: string };
    slug?: { eq: string };
  };
}
