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

import type { AssetCollector } from '@/liquid-forge/services/rendering/asset-collector';

export interface TemplateFile {
  path: string;
  content: string;
  contentType: string;
  lastModified?: Date;
  preloaded_sections?: Record<string, string>;
  _assetCollector?: AssetCollector;
}

export interface TemplateCache {
  content: string;
  compiledTemplate?: any;
  lastUpdated: Date;
  ttl: number;
}

export interface RenderContext {
  storeId?: string;
  shop: ShopContext;
  store: ShopContext;
  page: PageContext;
  page_title: string;
  page_description: string;
  products: ProductContext[];
  collections?: CollectionContext[];
  linklists?: Record<string, any>;
  content_for_layout?: string;
  content_for_header?: string;
  product?: ProductContext;
  collection?: CollectionContext;
  cart?: any;
  checkout?: any;
  pagination?: PaginationContext;
  preloaded_sections?: Record<string, string>;
  _assetCollector?: AssetCollector;
  _store_template?: any;
  _currency_config?: {
    currency: string;
    format: string;
    locale: string;
    decimalPlaces: number;
  };
}

export interface ShopContext {
  name: string;
  description: string;
  domain: string;
  url: string;
  currency: string;
  money_format: string;
  currency_format?: string;
  currency_locale?: string;
  currency_decimal_places?: number;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  favicon?: string;
  banner?: string;
  theme: string;
  storeId?: string;
  collections?: CollectionContext[];
}

export interface PageContext {
  id?: string;
  storeId?: string;
  title?: string;
  content?: string;
  handle?: string;
  url?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  owner?: string;
  template?: string;
  isVisible?: boolean;
  metafields?: {
    pagefly?: {
      html_meta?: string;
    };
    [key: string]: any;
  };
}

export interface ProductContext {
  id: string;
  storeId: string;
  name: string;
  title: string;
  slug: string;
  attributes: ProductAttribute[];
  featured_image?: string;
  quantity: number;
  description?: string;
  price: number;
  compare_at_price?: number;
  url: string;
  images: string[];
  variants: ProductVariantContext[];
  status: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface ProductAttribute {
  name: string;
  values: string[];
}

export interface ProductVariantContext {
  id: string;
  title: string;
  price: number;
  available: boolean;
  sku?: string;
  [key: string]: any;
}

export interface CollectionContext {
  id: string;
  storeId: string;
  title: string;
  description?: string;
  slug: string;
  url: string;
  image?: string;
  products: ProductContext[];
  nextToken?: string | null;
  owner: string;
  sortOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products_count?: number;
}

export interface PaginationContext {
  current_page: number;
  items_per_page: number;
  previous?: {
    title: string;
    url: string;
  };
  next?: {
    title: string;
    url: string;
  };
  parts: Array<{
    title: string;
    url: string;
    is_link: boolean;
  }>;
}

export interface RenderResult {
  html: string;
  metadata: {
    title: string;
    description: string;
    canonical?: string;
    openGraph: OpenGraphData;
    schema: SchemaData;
    icons: string;
    keywords?: string[];
    twitterCardData?: TwitterCardData;
  };
  cacheKey: string;
  cacheTTL: number;
}

export interface OpenGraphData {
  title: string;
  description: string;
  url: string;
  type: 'website' | 'product' | 'article';
  image?: string;
  site_name: string;
}

export interface TwitterCardData {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site: string;
  creator?: string;
  title: string;
  description: string;
  image?: string;
  image_alt?: string;
}

export interface SchemaData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface TemplateError {
  type: 'STORE_NOT_FOUND' | 'TEMPLATE_NOT_FOUND' | 'RENDER_ERROR' | 'DATA_ERROR' | 'STORE_NOT_ACTIVE';
  message: string;
  details?: any;
  statusCode: number;
}

// ==================== TIPOS PARA TEMPLATES JSON ====================

export interface SectionSettings {
  [key: string]: any;
}

export interface TemplateSection {
  type: string;
  settings: SectionSettings;
  blocks?: any[];
}

export interface TemplateConfig {
  sections: Record<string, TemplateSection>;
  order: string[];
}

export interface TemplateData {
  layout: string;
  sections: Record<string, TemplateSection>;
  order: string[];
}

export type PageType =
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

export interface PageRenderOptions {
  pageType: PageType;
  handle?: string;
  productId?: string;
  collectionId?: string;
  collectionHandle?: string;
  searchTerm?: string;
  checkoutToken?: string;
}

export interface PaginationInfo {
  next?: {
    url: string;
  };
  previous?: {
    title: string;
    url: string;
  };
  totalItems?: number;
  itemsPerPage?: number;
  currentPage?: number;
  pages?: number;
  nextToken?: string;
  previousToken?: string;
  items?: any[];
}
