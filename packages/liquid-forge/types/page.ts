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

export interface Page {
  id: string;
  storeId: string;
  title: string;
  content: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  status: string;
  owner: string;
  template?: string;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageContext {
  id: string;
  storeId: string;
  title: string;
  content: string;
  url: string;
  slug: string;
  handle: string;
  template?: string;
  metaTitle?: string;
  metaDescription?: string;
  status: string;
  owner: string;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
  published_at?: string;
  metafields?: Record<string, any>;
}
