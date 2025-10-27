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

import { getPageCacheKey } from '../core/cache/cache-keys';
import { cacheManager } from '../core/cache';
import type { PageRenderOptions } from '../../types/template';

export interface CachedPageRender {
  html: string;
  metadata: any;
}

export function buildPageRouteId(options: PageRenderOptions, searchParams: Record<string, string>): string {
  return buildUnifiedRouteId(options, searchParams, undefined);
}

export function buildPageRouteIdFromContext(
  options: PageRenderOptions,
  searchParams: Record<string, string>,
  context: any
): string {
  return buildUnifiedRouteId(options, searchParams, context);
}

function appendCommon(parts: string[], searchParams: Record<string, string>) {
  if (searchParams?.token) parts.push(`t:${searchParams.token}`);
  if (searchParams?.page) parts.push(`p:${searchParams.page}`);
}

function read(ctx: any, path: string[]): any {
  return path.reduce((acc, k) => (acc ? acc[k] : undefined), ctx);
}

function resolveEntity(
  type: 'product' | 'collection',
  options: PageRenderOptions,
  context?: any
): { handle?: string; id?: string } {
  if (!context) {
    return type === 'product'
      ? { handle: options.handle, id: options.productId }
      : { handle: options.collectionHandle, id: options.collectionId };
  }

  const base = type === 'product' ? 'product' : 'collection';
  const listName = type === 'product' ? 'products' : 'collections';
  const handleOpt = type === 'product' ? options.handle : options.collectionHandle;
  const idOpt = type === 'product' ? options.productId : options.collectionId;

  const handle =
    read(context, [base, 'slug']) ||
    read(context, [base, 'handle']) ||
    read(context, ['environments', base, 'slug']) ||
    read(context, ['environments', base, 'handle']) ||
    handleOpt;

  let id = read(context, [base, 'id']) || read(context, ['environments', base, 'id']) || idOpt;
  if (!id && handle) {
    const list =
      (Array.isArray(context?.[listName]) && context[listName]) ||
      (Array.isArray(context?.environments?.[listName]) && context.environments[listName]) ||
      (Array.isArray(context?._allCollections) && context._allCollections) ||
      undefined;
    if (Array.isArray(list)) {
      const found = list.find((e: any) => e?.slug === handle || e?.handle === handle || e?.title === handle);
      if (found?.id) id = found.id;
    }
  }
  return { handle, id };
}

function buildUnifiedRouteId(options: PageRenderOptions, searchParams: Record<string, string>, context?: any): string {
  const parts: string[] = [options.pageType];
  if (options.pageType === 'product') {
    const { handle, id } = resolveEntity('product', options, context);
    if (handle) parts.push(`ph:${handle}`);
    if (id) parts.push(`pid:${id}`);
  } else if (options.pageType === 'collection') {
    const { handle, id } = resolveEntity('collection', options, context);
    if (handle) parts.push(`ch:${handle}`);
    if (id) parts.push(`cid:${id}`);
  } else if (options.pageType === 'search') {
    const term =
      options.searchTerm ||
      searchParams?.q ||
      read(context, ['request', 'searchParams'])?.get?.('q') ||
      read(context, ['environments', 'request', 'searchParams'])?.get?.('q');
    if (term) parts.push(`q:${term}`);
  }
  appendCommon(parts, searchParams);
  const id = parts.join('|');
  return id;
}

export function makePageCacheKey(
  storeId: string,
  options: PageRenderOptions,
  searchParams: Record<string, string>,
  context?: any
): string {
  const routeId = buildUnifiedRouteId(options, searchParams, context);
  // Requisito: para product/collection debemos tener pid/cid para cachear de forma segura
  if (options.pageType === 'product' && !routeId.includes('pid:')) {
    return '';
  }
  if (options.pageType === 'collection' && !routeId.includes('cid:')) {
    return '';
  }
  const key = getPageCacheKey(storeId, routeId);
  return key;
}

export function getCachedPageRender(
  storeId: string,
  options: PageRenderOptions,
  searchParams: Record<string, string>,
  context?: any
): { cacheKey: string; cached: CachedPageRender | null } {
  const cacheKey = makePageCacheKey(storeId, options, searchParams, context);
  if (!cacheKey) {
    return { cacheKey: '', cached: null };
  }
  const cached = cacheManager.getCached(cacheKey) as CachedPageRender | null;
  return { cacheKey, cached };
}

export function setCachedPageRender(
  cacheKey: string,
  render: CachedPageRender,
  pageType: PageRenderOptions['pageType']
): void {
  if (!cacheKey) {
    return;
  }
  const ttl = cacheManager.getPageTTL(pageType);
  cacheManager.setCached(cacheKey, render, ttl);
}
