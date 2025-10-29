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

/**
 * Entidad de dominio: Template
 * Representa una plantilla de página (index.json, product.json, etc.)
 * Entidad pura sin dependencias externas.
 */
export type TemplateType =
  | 'index'
  | 'product'
  | 'collection'
  | 'page'
  | 'blog'
  | 'article'
  | 'search'
  | 'cart'
  | '404'
  | 'policies'
  | 'checkout_start'
  | 'checkout'
  | 'checkout_confirmation';

export interface TemplateBlock {
  id: string;
  type: string;
  settings: Record<string, unknown>;
}

export interface TemplateSection {
  type: string;
  settings: Record<string, unknown>;
  blocks?: TemplateBlock[];
}

export interface Template {
  type: TemplateType;
  sections: Record<string, TemplateSection>;
  order: string[];
}
