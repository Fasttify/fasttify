import type { CreatePageInput, Page, PageSummary } from '@/app/store/hooks/data/usePage/usePage';

export type PageFormValues = CreatePageInput & { pageType?: string };

export type { Page, PageSummary };

export type SortDirection = 'asc' | 'desc' | null;
export type SortField = 'title' | 'status' | 'slug' | 'createdAt' | 'updatedAt' | 'pageType';

export interface VisibleColumns {
  page: boolean;
  status: boolean;
  slug: boolean;
  visibility: boolean;
  actions: boolean;
}

export interface PageListProps {
  storeId: string;
  pages: PageSummary[];
  isLoading: boolean;
  error: Error | null;
  deleteMultiplePages: (ids: string[]) => void;
  deletePage: (id: string) => void;
}
