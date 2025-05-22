import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { S3Image } from '@/app/store/hooks/useS3Images'

interface ImageGalleryProps {
  images: S3Image[]
  viewMode: 'grid' | 'list'
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
  viewMode,
  selectedImage,
  allowMultipleSelection,
  loading,
  error,
  searchTerm,
  onImageSelect,
  onDeleteImage,
}: ImageGalleryProps) {
  if (!loading && images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {searchTerm
          ? 'No hay imágenes que coincidan con la búsqueda.'
          : 'No hay imágenes disponibles. Sube algunas imágenes para comenzar.'}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader color="black" text="Cargando imágenes..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error al cargar las imágenes. Por favor, intenta de nuevo.
      </div>
    )
  }

  return (
    <>
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
          {images.map((image, index) => (
            <div
              key={image.key}
              className={`relative border rounded-md overflow-hidden ${allowMultipleSelection ? (Array.isArray(selectedImage) && selectedImage.includes(image.key) ? 'ring-2 ring-blue-500' : '') : selectedImage === image.key ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => onImageSelect(image)}
            >
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={
                    allowMultipleSelection
                      ? Array.isArray(selectedImage) && selectedImage.includes(image.key)
                      : selectedImage === image.key
                  }
                  onChange={() => onImageSelect(image)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                  onClick={e => {
                    e.stopPropagation()
                    onDeleteImage(image.key)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="aspect-square">
                <Image
                  src={image.url || '/placeholder.svg'}
                  alt={image.filename}
                  width={300}
                  height={300}
                  quality={75}
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
                  style={{ objectFit: 'cover' }}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                />
              </div>

              <div className="p-2 text-xs">
                <div className="truncate">{image.filename}</div>
                <div className="text-muted-foreground">
                  {image.type?.split('/')[1]?.toUpperCase() || 'IMG'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image gallery - List view */}
      {viewMode === 'list' && (
        <div className="space-y-2 mt-4">
          {images.map((image, index) => (
            <div
              key={image.key}
              className={`flex items-center border rounded-md p-2 ${allowMultipleSelection ? (Array.isArray(selectedImage) && selectedImage.includes(image.key) ? 'ring-2 ring-blue-500' : '') : selectedImage === image.key ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => onImageSelect(image)}
            >
              <div className="mr-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={
                    allowMultipleSelection
                      ? Array.isArray(selectedImage) && selectedImage.includes(image.key)
                      : selectedImage === image.key
                  }
                  onChange={() => onImageSelect(image)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <div className="h-12 w-12 mr-4 flex-shrink-0">
                <Image
                  src={image.url || '/placeholder.svg'}
                  alt={image.filename}
                  width={96}
                  height={96}
                  quality={75}
                  className="object-cover w-full h-full rounded"
                  style={{ objectFit: 'cover' }}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate">{image.filename}</div>
                <div className="text-xs text-muted-foreground">
                  {image.type?.split('/')[1]?.toUpperCase() || 'IMG'} •
                  {image.size ? ` ${Math.round(image.size / 1024)} KB` : ''}
                </div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="ml-2"
                onClick={e => {
                  e.stopPropagation()
                  onDeleteImage(image.key)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
