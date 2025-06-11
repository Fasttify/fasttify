import { useState, useCallback, useMemo } from 'react'
import { Modal, BlockStack, Spinner, Box } from '@shopify/polaris'
import { useS3Images, type S3Image } from '@/app/store/hooks/useS3Images'
import ImageGallery from '@/app/store/components/images-selector/components/ImageGallery'

// Hooks
import { useImageSelection } from '@/app/store/components/images-selector/hooks/useImageSelection'
import { useImageUpload } from '@/app/store/components/images-selector/hooks/useImageUpload'

// Componentes modulares
import SearchAndFilters from '@/app/store/components/images-selector/components/SearchAndFilters'
import UploadDropZone from '@/app/store/components/images-selector/components/UploadDropZone'

interface ImageSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (images: S3Image | S3Image[] | null) => void
  initialSelectedImage?: string | string[] | null
  allowMultipleSelection?: boolean
}

export default function ImageSelectorModal({
  open,
  onOpenChange,
  onSelect,
  initialSelectedImage = null,
  allowMultipleSelection = false,
}: ImageSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const s3Options = useMemo(() => ({ limit: 18 }), [])

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

  const { isUploading, handleDrop } = useImageUpload({
    uploadImage,
    onImagesUploaded: uploadedImages => {
      const keys = uploadedImages.map(img => img.key)
      if (allowMultipleSelection) {
        addToSelection(keys)
      } else {
        handleImageSelect(uploadedImages[0])
      }
    },
  })

  const filteredImages = useMemo(
    () => images.filter(img => img.filename.toLowerCase().includes(searchTerm.toLowerCase())),
    [images, searchTerm]
  )

  const handleConfirm = useCallback(() => {
    const selectedImages = getSelectedImages()
    if (onSelect) {
      if (allowMultipleSelection) {
        onSelect(selectedImages.length > 0 ? selectedImages : null)
      } else {
        onSelect(selectedImages[0] || null)
      }
    }
    onOpenChange(false)
  }, [allowMultipleSelection, getSelectedImages, onSelect, onOpenChange])

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

  const hasSelection = useMemo(() => {
    if (allowMultipleSelection) {
      return Array.isArray(selectedImage) && selectedImage.length > 0
    }
    return selectedImage !== null
  }, [selectedImage, allowMultipleSelection])

  return (
    <Modal
      size="large"
      open={open}
      onClose={() => onOpenChange(false)}
      title="Seleccionar imagen"
      primaryAction={{
        content: 'Confirmar',
        onAction: handleConfirm,
        disabled: !hasSelection,
      }}
      secondaryActions={[
        {
          content: 'Cancelar',
          onAction: () => onOpenChange(false),
        },
      ]}
    >
      <div onScroll={handleScroll} style={{ height: '75vh', overflowY: 'auto' }}>
        <Modal.Section>
          <BlockStack gap="400">
            <SearchAndFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <UploadDropZone onDrop={handleDrop} allowMultipleSelection={allowMultipleSelection} />
            {isUploading && (
              <Box paddingBlockStart="400">
                <Spinner accessibilityLabel="Subiendo imagen" size="small" />
              </Box>
            )}
            <ImageGallery
              images={filteredImages}
              selectedImage={selectedImage}
              allowMultipleSelection={allowMultipleSelection}
              loading={loading}
              error={error}
              searchTerm={searchTerm}
              onImageSelect={handleImageSelect}
              onDeleteImage={handleDeleteImage}
            />
            {loadingMore && (
              <Box paddingBlockStart="400">
                <Spinner accessibilityLabel="Cargando más imágenes" />
              </Box>
            )}
          </BlockStack>
        </Modal.Section>
      </div>
    </Modal>
  )
}
