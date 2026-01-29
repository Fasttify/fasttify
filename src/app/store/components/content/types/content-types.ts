import type { S3Image } from '@/app/store/components/images-selector/types/s3-types';

export type SortDirection = 'asc' | 'desc' | null;
export type SortField = 'filename' | 'type' | 'size' | 'date' | null;

export interface VisibleColumns {
  file: boolean;
  altText: boolean;
  date: boolean;
  size: boolean;
  references: boolean;
  actions: boolean;
}

export interface ContentListProps {
  storeId: string;
  images: S3Image[];
  loading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  fetchMoreImages: () => void;
  loadingMore?: boolean;
  refreshContents: () => void;
  onViewDetails: (image: S3Image) => void;
  onUploadClick: () => void;
}
