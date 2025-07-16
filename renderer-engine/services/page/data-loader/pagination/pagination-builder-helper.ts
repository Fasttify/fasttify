import type { TemplateAnalysis } from '@/renderer-engine/services/templates/analysis/template-analyzer';
import type { PaginationInfo } from '@/renderer-engine/types/template';

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
