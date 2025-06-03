import { useState, useCallback, useMemo } from 'react'
import { Loader } from '@/components/ui/loader'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useS3Images, type S3Image } from '@/app/store/hooks/useS3Images'
import ImageGallery from '@/app/store/components/images-selector/components/ImageGallery'

// Hooks
import { useImageSelection } from '@/app/store/components/images-selector/hooks/useImageSelection'
import { useImageUpload } from '@/app/store/components/images-selector/hooks/useImageUpload'

// Componentes modulares
import SearchAndFilters from '@/app/store/components/images-selector/components/SearchAndFilters'
import UploadDropZone from '@/app/store/components/images-selector/components/UploadDropZone'
import UploadPreview from '@/app/store/components/images-selector/components/UploadPreview'
import ModalFooter from '@/app/store/components/images-selector/components/ModalFooter'

interface ImageSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (images: S3Image | S3Image[] | null) => void
  initialSelectedImage?: string | null
  allowMultipleSelection?: boolean
}

export default function ImageSelectorModal({
  open,
  onOpenChange,
  onSelect,
  initialSelectedImage = null,
  allowMultipleSelection = false,
}: ImageSelectorModalProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')

  // Memoizar las opciones para evitar re-renders del hook
  const s3Options = useMemo(() => ({ limit: 18 }), [])

  // Hook principal de S3
  const {
    images,
    loading,
    error,
    uploadImage,
    deleteImage,
    fetchMoreImages,
    loadingMore,
    nextContinuationToken,
  } = useS3Images(s3Options)

  // Hook para manejo de selección
  const {
    selectedImage,
    handleImageSelect,
    getSelectedImages,
    removeFromSelection,
    addToSelection,
  } = useImageSelection({
    initialSelectedImage,
    allowMultipleSelection,
    images,
  })

  // Hook para manejo de upload
  const {
    isUploading,
    uploadPreview,
    fileInputRef,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    triggerFileSelect,
  } = useImageUpload({
    uploadImage,
    allowMultipleSelection,
    onImagesUploaded: uploadedImages => {
      const keys = uploadedImages.map(img => img.key)
      addToSelection(keys)
    },
  })

  // Filtrado de imágenes
  const filteredImages = useMemo(
    () => images.filter(img => img.filename.toLowerCase().includes(searchTerm.toLowerCase())),
    [images, searchTerm]
  )

  // Manejo de confirmación
  const handleConfirm = useCallback(() => {
    const selectedImages = getSelectedImages()

    if (allowMultipleSelection) {
      onSelect?.(selectedImages.length > 0 ? selectedImages : null)
    } else {
      onSelect?.(selectedImages[0] || null)
    }

    onOpenChange(false)
  }, [allowMultipleSelection, getSelectedImages, onSelect, onOpenChange])

  // Manejo de eliminación de imágenes
  const handleDeleteImage = useCallback(
    async (key: string) => {
      try {
        const success = await deleteImage(key)
        if (success) {
          removeFromSelection(key)
        }
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    },
    [deleteImage, removeFromSelection]
  )

  // Manejo del scroll infinito
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement
      const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100

      if (isAtBottom && nextContinuationToken && !loadingMore && !loading) {
        fetchMoreImages()
      }
    },
    [nextContinuationToken, loadingMore, loading, fetchMoreImages]
  )

  // Verificar si hay selección
  const hasSelection = useMemo(() => {
    if (allowMultipleSelection) {
      return Array.isArray(selectedImage) && selectedImage.length > 0
    }
    return selectedImage !== null
  }, [selectedImage, allowMultipleSelection])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Seleccionar imagen</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0" onScroll={handleScroll}>
          {/* Search and filters */}
          <SearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Upload drop zone */}
          <UploadDropZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onFileUpload={handleFileUpload}
            triggerFileSelect={triggerFileSelect}
            fileInputRef={fileInputRef}
            allowMultipleSelection={allowMultipleSelection}
          />

          {/* Upload preview */}
          <UploadPreview uploadPreview={uploadPreview || ''} isUploading={isUploading} />

          {/* Image gallery */}
          <ImageGallery
            images={filteredImages}
            viewMode={viewMode}
            selectedImage={selectedImage}
            allowMultipleSelection={allowMultipleSelection}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            onImageSelect={handleImageSelect}
            onDeleteImage={handleDeleteImage}
          />

          {/* Loading indicator for more images */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader color="white" />
              <span className="text-sm ml-2">Cargando más imágenes...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <ModalFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={handleConfirm}
          hasSelection={hasSelection}
        />
      </DialogContent>
    </Dialog>
  )
}
