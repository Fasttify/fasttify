// Componente principal
export { default as ImageSelectorModal } from '@/app/store/components/images-selector/components/image-selector-modal'

// Hooks personalizados
export { useImageSelection } from '@/app/store/components/images-selector/hooks/useImageSelection'
export { useImageUpload } from '@/app/store/components/images-selector/hooks/useImageUpload'

// Componentes modulares
export { default as SearchAndFilters } from '@/app/store/components/images-selector/components/SearchAndFilters'
export { default as UploadDropZone } from '@/app/store/components/images-selector/components/UploadDropZone'
export { default as UploadPreview } from '@/app/store/components/images-selector/components/UploadPreview'
export { default as ModalFooter } from '@/app/store/components/images-selector/components/ModalFooter'
export { default as ImageGallery } from '@/app/store/components/images-selector/components/ImageGallery'

// Re-exportar tipos del hook principal
export type { S3Image } from '@/app/store/hooks/useS3Images'
