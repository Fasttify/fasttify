import {
  Grid,
  Card,
  Thumbnail,
  Text,
  Spinner,
  EmptyState,
  Button,
  Box,
  ButtonGroup,
  InlineStack,
} from '@shopify/polaris';
import { DeleteIcon, SelectIcon } from '@shopify/polaris-icons';
import { S3Image } from '@/app/store/hooks/storage/useS3Images';
import { useState, useCallback } from 'react';
import { useToast } from '@/app/store/context/ToastContext';

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

export default function ImageGallery({
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

  if (loading) {
    return (
      <Box padding="400" minHeight="200px">
        <Spinner accessibilityLabel="Cargando imágenes" size="large" />
      </Box>
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
      {/* Controles para eliminación múltiple */}
      {images.length > 1 && onDeleteMultiple && (
        <Box paddingBlockEnd="400">
          {!deleteMode ? (
            <InlineStack align="end">
              <Button icon={DeleteIcon} variant="tertiary" onClick={() => setDeleteMode(true)}>
                Eliminar múltiples
              </Button>
            </InlineStack>
          ) : (
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
          )}
        </Box>
      )}

      <Grid>
        {images.map((image) => (
          <Grid.Cell key={image.key} columnSpan={{ xs: 2, sm: 2, md: 2, lg: 4, xl: 4 }}>
            <div
              onClick={() => {
                if (deleteMode) {
                  toggleDeleteSelection(image.key);
                } else {
                  onImageSelect(image);
                }
              }}
              style={{
                cursor: 'pointer',
                outline: deleteMode
                  ? isMarkedForDeletion(image.key)
                    ? '2px solid #d72c0d'
                    : '1px solid #e1e3e5'
                  : isSelected(image)
                    ? '2px solid #2962ff'
                    : 'none',
                outlineOffset: '2px',
                borderRadius: 'var(--p-border-radius-200)',
                opacity: deleteMode && isMarkedForDeletion(image.key) ? 0.7 : 1,
              }}>
              <Card padding="0">
                <Box position="relative" borderRadius="200">
                  {/* Indicador de selección para eliminación */}
                  {deleteMode && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        zIndex: 2,
                        backgroundColor: isMarkedForDeletion(image.key) ? '#d72c0d' : 'rgba(255,255,255,0.9)',
                        borderRadius: '50%',
                        padding: '4px',
                      }}>
                      <SelectIcon />
                    </div>
                  )}

                  {/* Botón de eliminación individual (solo si no está en modo delete) */}
                  {!deleteMode && (
                    <div
                      style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1 }}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <Button
                        icon={DeleteIcon}
                        size="slim"
                        variant="primary"
                        tone="critical"
                        onClick={() => onDeleteImage(image.key)}
                        accessibilityLabel="Eliminar imagen"
                      />
                    </div>
                  )}

                  <Thumbnail source={image.url || ''} alt={image.filename} size="large" />
                </Box>
                <Box padding="200">
                  <Text as="p" variant="bodySm" truncate>
                    {image.filename}
                  </Text>
                </Box>
              </Card>
            </div>
          </Grid.Cell>
        ))}
      </Grid>
    </Box>
  );
}
