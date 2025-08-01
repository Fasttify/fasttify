import ImageGallery from '@/app/store/components/images-selector/components/ImageGallery';
import type { S3Image } from '@/app/store/components/images-selector/types/s3-types';
import { useToast } from '@/app/store/context/ToastContext';
import { useS3ImagesWithOperations } from '@/app/store/hooks/storage/useS3ImagesWithOperations';
import { Banner, BlockStack, Box, Modal, ProgressBar, Spinner, Text } from '@shopify/polaris';
import { useCallback, useMemo, useState } from 'react';

// Hooks
import { useImageSelection } from '@/app/store/components/images-selector/hooks/useImageSelection';
import { useImageUpload } from '@/app/store/components/images-selector/hooks/useImageUpload';

// Componentes modulares
import SearchAndFilters from '@/app/store/components/images-selector/components/SearchAndFilters';
import UploadDropZone from '@/app/store/components/images-selector/components/UploadDropZone';

interface ImageSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (images: S3Image | S3Image[] | null) => void;
  initialSelectedImage?: string | string[] | null;
  allowMultipleSelection?: boolean;
}

export default function ImageSelectorModal({
  open,
  onOpenChange,
  onSelect,
  initialSelectedImage = null,
  allowMultipleSelection = false,
}: ImageSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const s3Options = useMemo(() => ({ limit: 18 }), []);
  const { showToast } = useToast();

  const { images, loading, error, uploadImages, deleteImages, fetchMoreImages, loadingMore, nextContinuationToken } =
    useS3ImagesWithOperations(s3Options);

  const { selectedImage, handleImageSelect, getSelectedImages, removeFromSelection, addToSelection } =
    useImageSelection({
      initialSelectedImage,
      allowMultipleSelection,
      images,
    });

  const { isUploading, uploadProgress, handleDrop, resetUploadState } = useImageUpload({
    uploadImages,
    onImagesUploaded: (result) => {
      const { successfulImages } = result;
      if (successfulImages.length > 0) {
        const keys = successfulImages.map((img) => img.key);
        if (allowMultipleSelection) {
          addToSelection(keys);
        } else {
          handleImageSelect(successfulImages[0]);
        }
      }
    },
    onUploadError: () => {},
  });

  const filteredImages = useMemo(
    () => images.filter((img) => img.filename.toLowerCase().includes(searchTerm.toLowerCase())),
    [images, searchTerm]
  );

  const handleConfirm = useCallback(() => {
    const selectedImages = getSelectedImages();
    if (onSelect) {
      if (allowMultipleSelection) {
        onSelect(selectedImages.length > 0 ? selectedImages : null);
      } else {
        onSelect(selectedImages[0] || null);
      }
    }
    onOpenChange(false);
  }, [allowMultipleSelection, getSelectedImages, onSelect, onOpenChange]);

  const handleDeleteImage = useCallback(
    async (key: string) => {
      try {
        const result = await deleteImages([key]);

        if (result) {
          if (result.successCount > 0) {
            removeFromSelection(key);
            showToast('Imagen eliminada correctamente', false);
          }

          if (result.failedDeletes.length > 0) {
            const error = result.failedDeletes[0];
            showToast(`Error al eliminar imagen: ${error.error}`, true);
          }
        } else {
          showToast('Error al eliminar la imagen', true);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        showToast('Error inesperado al eliminar la imagen', true);
      }
    },
    [deleteImages, removeFromSelection, showToast]
  );

  const handleDeleteMultiple = useCallback(
    async (keys: string[]) => {
      try {
        const result = await deleteImages(keys);

        if (result) {
          if (result.successCount > 0) {
            // Remover las imágenes exitosamente eliminadas de la selección
            const failedKeys = new Set(result.failedDeletes.map((f) => f.key));
            const successfullyDeletedKeys = keys.filter((key) => !failedKeys.has(key));
            successfullyDeletedKeys.forEach((key) => removeFromSelection(key));
          }

          if (result.failedDeletes.length > 0) {
            showToast(`Error al eliminar ${result.failedDeletes.length} imagen(es)`, true);
          }
        } else {
          showToast('Error al eliminar las imágenes', true);
        }
      } catch (error) {
        console.error('Error deleting multiple images:', error);
        showToast('Error inesperado al eliminar las imágenes', true);
      }
    },
    [deleteImages, removeFromSelection, showToast]
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;

      if (isAtBottom && nextContinuationToken && !loadingMore && !loading) {
        fetchMoreImages();
      }
    },
    [nextContinuationToken, loadingMore, loading, fetchMoreImages]
  );

  const handleModalClose = useCallback(() => {
    // Limpiar estado al cerrar
    resetUploadState();
    onOpenChange(false);
  }, [onOpenChange, resetUploadState]);

  const hasSelection = useMemo(() => {
    if (allowMultipleSelection) {
      return Array.isArray(selectedImage) && selectedImage.length > 0;
    }
    return selectedImage !== null;
  }, [selectedImage, allowMultipleSelection]);

  // Calcular progreso de carga
  const uploadProgressPercentage = uploadProgress
    ? Math.round(((uploadProgress.completed + uploadProgress.failed) / uploadProgress.total) * 100)
    : 0;

  return (
    <Modal
      size="large"
      open={open}
      onClose={handleModalClose}
      title="Seleccionar imagen"
      primaryAction={{
        content: 'Confirmar',
        onAction: handleConfirm,
        disabled: !hasSelection,
      }}
      secondaryActions={[
        {
          content: 'Cancelar',
          onAction: handleModalClose,
        },
      ]}>
      <div onScroll={handleScroll} style={{ height: '75vh', overflowY: 'auto' }}>
        <Modal.Section>
          <BlockStack gap="400">
            {/* Solo mostrar banner para errores críticos de carga */}
            {error && (
              <Banner title="Error al cargar imágenes" tone="critical">
                <p>Hubo un problema al recuperar tus imágenes. Por favor, recarga la página.</p>
              </Banner>
            )}

            <SearchAndFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <UploadDropZone onDrop={handleDrop} allowMultipleSelection={allowMultipleSelection} />

            {/* Indicador de progreso de carga */}
            {isUploading && (
              <Box paddingBlockStart="400">
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm">
                    Subiendo imágenes...
                  </Text>
                  {uploadProgress && (
                    <>
                      <ProgressBar progress={uploadProgressPercentage} size="small" />
                      <Text as="p" variant="bodySm" tone="subdued">
                        {uploadProgress.completed} de {uploadProgress.total} completadas
                        {uploadProgress.failed > 0 && ` (${uploadProgress.failed} fallidas)`}
                      </Text>
                    </>
                  )}
                  {!uploadProgress && <Spinner accessibilityLabel="Subiendo imagen" size="small" />}
                </BlockStack>
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
              onDeleteMultiple={handleDeleteMultiple}
            />

            {loadingMore && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Box paddingBlockStart="400">
                  <Spinner accessibilityLabel="Cargando más imágenes" size="small" />
                </Box>
              </div>
            )}
          </BlockStack>
        </Modal.Section>
      </div>
    </Modal>
  );
}
