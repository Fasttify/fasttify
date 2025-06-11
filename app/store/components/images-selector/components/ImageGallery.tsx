import { Grid, Card, Thumbnail, Text, Spinner, EmptyState, Button, Box } from '@shopify/polaris'
import { DeleteIcon } from '@shopify/polaris-icons'
import { S3Image } from '@/app/store/hooks/useS3Images'

interface ImageGalleryProps {
  images: S3Image[]
  selectedImage: string | string[] | null
  allowMultipleSelection: boolean
  loading: boolean
  error: Error | null
  searchTerm: string
  onImageSelect: (image: S3Image) => void
  onDeleteImage: (key: string) => Promise<void>
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
}: ImageGalleryProps) {
  if (loading) {
    return (
      <Box padding="400" minHeight="200px">
        <Spinner accessibilityLabel="Cargando imágenes" size="large" />
      </Box>
    )
  }

  if (error) {
    return (
      <EmptyState
        heading="Error al cargar las imágenes"
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <p>Hubo un problema al recuperar tus imágenes. Por favor, intenta de nuevo.</p>
      </EmptyState>
    )
  }

  if (images.length === 0) {
    return (
      <EmptyState
        heading={searchTerm ? 'No se encontraron imágenes' : 'No tienes imágenes'}
        action={{
          content: 'Subir imágenes',
          onAction: () => {}, // Se podría conectar a un trigger de subida
        }}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <p>
          {searchTerm
            ? 'Prueba con un término de búsqueda diferente.'
            : 'Arrastra y suelta archivos para subirlos.'}
        </p>
      </EmptyState>
    )
  }

  const isSelected = (image: S3Image) => {
    if (allowMultipleSelection && Array.isArray(selectedImage)) {
      return selectedImage.includes(image.key)
    }
    return selectedImage === image.key
  }

  return (
    <Grid>
      {images.map(image => (
        <Grid.Cell key={image.key} columnSpan={{ xs: 2, sm: 2, md: 2, lg: 4, xl: 4 }}>
          <div
            onClick={() => onImageSelect(image)}
            style={{
              cursor: 'pointer',
              outline: isSelected(image) ? '2px solid #2962ff' : 'none',
              outlineOffset: '2px',
              borderRadius: 'var(--p-border-radius-200)',
            }}
          >
            <Card padding="0">
              <Box position="relative" borderRadius="200">
                <div
                  style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1 }}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <Button
                    icon={DeleteIcon}
                    size="slim"
                    variant="primary"
                    tone="critical"
                    onClick={() => onDeleteImage(image.key)}
                    accessibilityLabel="Eliminar imagen"
                  />
                </div>
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
  )
}
