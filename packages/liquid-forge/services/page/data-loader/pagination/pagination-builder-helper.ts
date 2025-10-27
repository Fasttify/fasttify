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

import type { TemplateAnalysis } from '../../../templates/analysis/template-analyzer';
import type { PaginationInfo } from '../../../../types/template';

interface LoadedData {
  products?: any[];
  collections?: any[];
}

interface PaginationSourceInfo {
  currentPage?: number;
  totalItems?: number;
  nextToken?: string;
}

export function buildPaginationObject(
  analysis: TemplateAnalysis,
  loadedData: LoadedData,
  paginationInfo: PaginationSourceInfo,
  searchParams: Record<string, string>,
  limit: number
): PaginationInfo | undefined {
  if (!analysis.hasPagination) {
    return undefined;
  }

  const hasToken = !!searchParams.token;
  const totalItems = paginationInfo.totalItems || 0;

  const paginate: PaginationInfo = {
    items: loadedData.products || loadedData.collections || [],
    currentPage: paginationInfo.currentPage || 1,
    itemsPerPage: limit,
    totalItems: totalItems,
    pages: Math.ceil(totalItems / limit),
    next: paginationInfo.nextToken ? { url: `?token=${paginationInfo.nextToken}` } : undefined,
    previous: hasToken ? { title: 'Anterior', url: 'javascript:history.back()' } : undefined,
  };

  return paginate;
}
