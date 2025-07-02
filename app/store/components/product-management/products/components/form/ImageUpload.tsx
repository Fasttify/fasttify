import ImageSelectorModal from '@/app/store/components/images-selector/components/ImageSelectorModal';
import { BlockStack, Button, Card, DropZone, LegacyStack, Text, TextField, Thumbnail } from '@shopify/polaris';
import { useState } from 'react';

interface ImageFile {
  url: string;
  alt?: string;
}

interface ImageUploadProps {
  value: ImageFile[];
  onChange: (value: ImageFile[]) => void;
  storeId: string;
}

export function ImageUpload({ value, onChange, storeId }: ImageUploadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDropZoneDrop = () => {
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

  const handleSelectImages = (selectedImages: any) => {
    const imagesToAdd: ImageFile[] = (Array.isArray(selectedImages) ? selectedImages : [selectedImages]).map((img) => ({
      url: img.url,
      alt: img.filename || '',
    }));
    onChange([...value, ...imagesToAdd]);
    setIsModalOpen(false);
  };

  return (
    <>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          Imágenes
        </Text>
        <DropZone onDrop={handleDropZoneDrop}>
          <DropZone.FileUpload actionHint="o suéltelos para subirlos" />
        </DropZone>

        <Button onClick={() => setIsModalOpen(true)}>Añadir imágenes desde la galería</Button>

        {value.length > 0 && (
          <LegacyStack spacing="loose" wrap>
            {value.map((image, index) => (
              <Card key={index}>
                <BlockStack gap="200" inlineAlign="center">
                  <Thumbnail source={image.url || ''} alt={image.alt || 'Imagen de producto'} size="large" />
                  <div style={{ flexGrow: 1 }}>
                    <TextField
                      label="Texto alternativo"
                      labelHidden
                      value={image.alt || ''}
                      onChange={(alt) => updateAltText(index, alt)}
                      autoComplete="off"
                    />
                  </div>
                  <Button onClick={() => removeImage(index)} variant="plain" tone="critical">
                    Eliminar
                  </Button>
                </BlockStack>
              </Card>
            ))}
          </LegacyStack>
        )}
      </BlockStack>

      <ImageSelectorModal
        allowMultipleSelection
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSelect={handleSelectImages}
        initialSelectedImage={value.length > 0 ? value[0].url : null}
      />
    </>
  );
}
