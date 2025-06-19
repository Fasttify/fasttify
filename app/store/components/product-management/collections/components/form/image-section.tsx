import { useState } from 'react'
import {
  Card,
  Thumbnail,
  Text,
  BlockStack,
  Button,
  ButtonGroup,
  Box,
  InlineStack,
} from '@shopify/polaris'
import type { S3Image } from '@/app/store/hooks/storage/useS3Images'
import { ImageSelectorModal } from '@/app/store/components/images-selector'

const ImagePlaceholder = ({ onOpenModal }: { onOpenModal: () => void }) => (
  <Box borderWidth="025" borderColor="border" borderRadius="200" background="bg-surface-secondary">
    <Box padding="400">
      <BlockStack gap="200" inlineAlign="center">
        <Text as="p" tone="subdued">
          No se ha añadido ninguna imagen.
        </Text>
        <Button onClick={onOpenModal}>Añadir imagen</Button>
      </BlockStack>
    </Box>
  </Box>
)

export function ImageSection({
  imageUrl,
  onImageChange,
}: {
  imageUrl: string
  onImageChange: (url: string) => void
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleImageSelectFromModal = (selection: S3Image | S3Image[] | null) => {
    if (selection && !Array.isArray(selection)) {
      onImageChange(selection.url)
    }
    setIsModalOpen(false)
  }

  const handleRemoveImage = () => {
    onImageChange('')
  }

  const openModal = () => setIsModalOpen(true)

  return (
    <>
      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Imagen
          </Text>

          {imageUrl ? (
            <InlineStack gap="400" blockAlign="center">
              <Thumbnail size="large" alt="Imagen de la colección" source={imageUrl} />
              <ButtonGroup>
                <Button onClick={openModal}>Cambiar</Button>
                <Button onClick={handleRemoveImage} variant="tertiary">
                  Eliminar
                </Button>
              </ButtonGroup>
            </InlineStack>
          ) : (
            <ImagePlaceholder onOpenModal={openModal} />
          )}
        </BlockStack>
      </Card>

      <ImageSelectorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSelect={handleImageSelectFromModal}
        allowMultipleSelection={false}
        initialSelectedImage={imageUrl}
      />
    </>
  )
}
