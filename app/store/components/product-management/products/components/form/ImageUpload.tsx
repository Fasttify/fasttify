import ImageSelectorModal from '@/app/store/components/images-selector/components/ImageSelectorModal';
import { BlockStack, Button, Card, TextField, Thumbnail } from '@shopify/polaris';
import { useState, useMemo, useCallback } from 'react';

interface ImageFile {
  url: string;
  alt?: string;
}

interface ImageUploadProps {
  value: ImageFile[];
  onChange: (value: ImageFile[]) => void;
  storeId: string;
}

export function ImageUpload({ value, onChange, storeId: _storeId }: ImageUploadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const _handleDropZoneDrop = () => {
    setIsModalOpen(true);
  };

  const removeImage = (index: number) => {
    const newImages = [...value];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const updateAltText = (index: number, alt: string) => {
    const newImages = [...value];
    newImages[index].alt = alt;
    onChange(newImages);
  };

  const handleSelectImages = useCallback(
    (selectedImages: any) => {
      const imagesToAdd: ImageFile[] = (Array.isArray(selectedImages) ? selectedImages : [selectedImages]).map(
        (img) => ({
          url: img.url,
          alt: img.filename || '',
        })
      );
      onChange([...value, ...imagesToAdd]);
      setIsModalOpen(false);
    },
    [value, onChange]
  );

  // Memoizar las props del modal para evitar re-renders
  const modalProps = useMemo(
    () => ({
      allowMultipleSelection: true,
      onSelect: handleSelectImages,
      initialSelectedImage: value.length > 0 ? value[0].url : null,
    }),
    [handleSelectImages, value]
  );

  return (
    <>
      <BlockStack gap="400">
        <Button onClick={() => setIsModalOpen(true)}>Añadir imágenes desde la galería</Button>

        {value.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px',
            }}>
            {value.map((image, index) => (
              <Card key={index}>
                <div style={{ position: 'relative', padding: 8, background: '#fafafa', borderRadius: 8 }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      zIndex: 2,
                    }}>
                    <Button
                      onClick={() => removeImage(index)}
                      variant="plain"
                      tone="critical"
                      aria-label="Eliminar imagen">
                      ×
                    </Button>
                  </div>
                  <BlockStack gap="100" inlineAlign="center">
                    <Thumbnail source={image.url || ''} alt={image.alt || 'Imagen de producto'} size="large" />
                    <TextField
                      label="Texto alternativo"
                      labelHidden
                      value={image.alt || ''}
                      onChange={(alt) => updateAltText(index, alt)}
                      autoComplete="off"
                      placeholder="Texto alternativo"
                    />
                  </BlockStack>
                </div>
              </Card>
            ))}
          </div>
        )}
      </BlockStack>

      <ImageSelectorModal {...modalProps} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
