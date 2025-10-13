// Componente principal
export { default as ImageSelectorModal } from '@/app/store/components/images-selector/components/ImageSelectorModal';

// Hooks personalizados
export { useImageSelection } from '@/app/store/components/images-selector/hooks/useImageSelection';
export { useImageUpload } from '@/app/store/components/images-selector/hooks/useImageUpload';
export { useDebounce } from '@/app/store/components/images-selector/hooks/useDebounce';
export { useImageFilters } from '@/app/store/components/images-selector/hooks/useImageFilters';

// Componentes modulares
export { default as ImageGallery } from '@/app/store/components/images-selector/components/ImageGallery';
export { default as SearchAndFilters } from '@/app/store/components/images-selector/components/SearchAndFilters';
export { default as UploadDropZone } from '@/app/store/components/images-selector/components/UploadDropZone';
export { default as FilterPopover } from '@/app/store/components/images-selector/components/FilterPopover';
export { default as FilterCombobox } from '@/app/store/components/images-selector/components/FilterCombobox';
export { default as SortPopover } from '@/app/store/components/images-selector/components/SortPopover';

// Re-exportar tipos del hook principal
export type { S3Image } from '@/app/store/hooks/storage/useS3Images';

// Utils
export { filterAndSortImages, getFilterStats } from '@/app/store/components/images-selector/utils/filterUtils';

// Nuevos tipos para operaciones por lotes
export type { BatchUploadResult } from '@/app/store/components/images-selector/hooks/useImageUpload';
export type { FilterState } from '@/app/store/components/images-selector/hooks/useImageFilters';
