import { useToast } from '@/app/store/context/ToastContext';
import { S3Image } from '@/app/store/hooks/storage/useS3Images';
import { Box, Button, ButtonGroup, EmptyState, Grid, InlineStack, Spinner, Text } from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';
import { useCallback, useState, memo } from 'react';
import ImageCard from './ImageCard';

interface ImageGalleryProps {
  images: S3Image[];
  selectedImage: string | string[] | null;
  allowMultipleSelection: boolean;
  loading: boolean;
  error: Error | null;
  searchTerm: string;
  onImageSelect: (image: S3Image) => void;
  onDeleteImage: (key: string) => Promise<void>;
  onDeleteMultiple?: (keys: string[]) => Promise<void>;
}

const ImageGallery = memo(function ImageGallery({
  images,
  selectedImage,
  allowMultipleSelection,
  loading,
  error,
  searchTerm,
  onImageSelect,
  onDeleteImage,
  onDeleteMultiple,
}: ImageGalleryProps) {
  const [deleteMode, setDeleteMode] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  // Memoizar funciones para evitar re-creaciones
  const isSelected = useCallback(
    (image: S3Image) => {
      if (allowMultipleSelection && Array.isArray(selectedImage)) {
        return selectedImage.includes(image.key);
      }
      return selectedImage === image.key;
    },
    [allowMultipleSelection, selectedImage]
  );

  const isMarkedForDeletion = useCallback((key: string) => imagesToDelete.has(key), [imagesToDelete]);

  const toggleDeleteSelection = useCallback(
    (key: string) => {
      setImagesToDelete((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          if (newSet.size >= 25) {
            showToast('Solo puedes seleccionar hasta 25 imágenes para eliminar a la vez', true);
            return prev;
          }
          newSet.add(key);
        }
        return newSet;
      });
    },
    [showToast]
  );

  const handleDeleteMultiple = useCallback(async () => {
    if (imagesToDelete.size === 0 || !onDeleteMultiple) return;

    if (imagesToDelete.size > 25) {
      showToast('Solo puedes eliminar hasta 25 imágenes a la vez', true);
      return;
    }

    setIsDeleting(true);
    try {
      await onDeleteMultiple(Array.from(imagesToDelete));
      showToast(`${imagesToDelete.size} imagen(es) eliminada(s) correctamente`, false);
      setImagesToDelete(new Set());
      setDeleteMode(false);
    } catch (error) {
      console.error('Error deleting multiple images:', error);
      showToast('Error al eliminar las imágenes seleccionadas', true);
    } finally {
      setIsDeleting(false);
    }
  }, [imagesToDelete, onDeleteMultiple, showToast]);

  const cancelDeleteMode = useCallback(() => {
    setDeleteMode(false);
    setImagesToDelete(new Set());
  }, []);

  const selectAllForDeletion = useCallback(() => {
    const availableImages = images.slice(0, 25);
    if (images.length > 25) {
      showToast('Solo se pueden seleccionar las primeras 25 imágenes para eliminación múltiple', true);
    }
    setImagesToDelete(new Set(availableImages.map((img) => img.key)));
  }, [images, showToast]);

  const deselectAllForDeletion = useCallback(() => {
    setImagesToDelete(new Set());
  }, []);

  // Memoizar controles de eliminación múltiple
  const deleteControls = useCallback(() => {
    if (images.length <= 1 || !onDeleteMultiple) return null;

    if (!deleteMode) {
      return (
        <Box paddingBlockEnd="400">
          <InlineStack align="end">
            <Button icon={DeleteIcon} variant="tertiary" onClick={() => setDeleteMode(true)}>
              Eliminar múltiples
            </Button>
          </InlineStack>
        </Box>
      );
    }

    return (
      <Box paddingBlockEnd="400">
        <InlineStack gap="200" align="space-between">
          <InlineStack gap="200">
            <Text as="p" variant="bodySm">
              {imagesToDelete.size} imagen(es) seleccionada(s)
              {imagesToDelete.size >= 25 && (
                <Text as="span" variant="bodySm" tone="critical">
                  {' '}
                  (Máximo 25)
                </Text>
              )}
            </Text>
            {imagesToDelete.size > 0 && (
              <ButtonGroup>
                <Button size="slim" onClick={deselectAllForDeletion}>
                  Deseleccionar todo
                </Button>
              </ButtonGroup>
            )}
            {imagesToDelete.size < Math.min(images.length, 25) && (
              <Button size="slim" onClick={selectAllForDeletion}>
                Seleccionar todo{images.length > 25 ? ' (25 máx.)' : ''}
              </Button>
            )}
          </InlineStack>
          <ButtonGroup>
            <Button onClick={cancelDeleteMode}>Cancelar</Button>
            <Button
              variant="primary"
              tone="critical"
              onClick={handleDeleteMultiple}
              disabled={imagesToDelete.size === 0 || isDeleting}
              loading={isDeleting}>
              Eliminar {imagesToDelete.size > 0 ? `(${imagesToDelete.size})` : ''}
            </Button>
          </ButtonGroup>
        </InlineStack>
      </Box>
    );
  }, [
    images,
    deleteMode,
    imagesToDelete,
    isDeleting,
    onDeleteMultiple,
    cancelDeleteMode,
    deselectAllForDeletion,
    handleDeleteMultiple,
    selectAllForDeletion,
  ]);

  // Memoizar renderizado de imágenes individuales usando ImageCard
  const renderImage = useCallback(
    (image: S3Image) => {
      const COLUMN_SPAN_CONFIG = { xs: 3, sm: 3, md: 2, lg: 2, xl: 2 } as const;

      return (
        <Grid.Cell key={image.id || image.key} columnSpan={COLUMN_SPAN_CONFIG}>
          <ImageCard
            image={image}
            isSelected={isSelected(image)}
            isMarkedForDeletion={isMarkedForDeletion(image.key)}
            deleteMode={deleteMode}
            onImageClick={() => {
              if (deleteMode) {
                toggleDeleteSelection(image.key);
              } else {
                onImageSelect(image);
              }
            }}
            onDeleteImage={onDeleteImage}
          />
        </Grid.Cell>
      );
    },
    [deleteMode, isMarkedForDeletion, isSelected, onImageSelect, onDeleteImage, toggleDeleteSelection]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner accessibilityLabel="Cargando imágenes" size="small" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        heading="Error al cargar las imágenes"
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
        <p>Hubo un problema al recuperar tus imágenes. Por favor, intenta de nuevo.</p>
      </EmptyState>
    );
  }

  if (images.length === 0) {
    return (
      <EmptyState
        heading={searchTerm ? 'No se encontraron imágenes' : 'No tienes imágenes'}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
        <p>
          {searchTerm ? 'Prueba con un término de búsqueda diferente.' : 'Arrastra y suelta archivos para subirlos.'}
        </p>
      </EmptyState>
    );
  }

  return (
    <Box>
      {deleteControls()}
      <Grid>{images.map(renderImage)}</Grid>
    </Box>
  );
});

export default ImageGallery;
