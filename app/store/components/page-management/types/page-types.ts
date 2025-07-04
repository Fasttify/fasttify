import type { CreatePageInput, PageSummary, Page } from '@/app/store/hooks/data/usePage';

export type { CreatePageInput as PageFormValues, PageSummary, Page };

export type SortDirection = 'asc' | 'desc' | null;
export type SortField = 'title' | 'status' | 'slug' | 'createdAt' | 'updatedAt';

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
