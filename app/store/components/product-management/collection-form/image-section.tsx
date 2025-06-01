import { useState, useEffect } from 'react'
import { Edit, Image as ImageIcon, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import ImageSelectorModal from '@/app/store/components/images-selector/components/image-selector-modal'
import { S3Image } from '@/app/store/hooks/useS3Images'
import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

export function ImageSection({
  imageUrl = '',
  onImageChange,
}: {
  imageUrl: string
  onImageChange: (image: string) => void
}) {
  // Implementar lógica para manejar el cambio y pasar el valor al componente padre
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<S3Image | null>(null)

  // Inicializar selectedImage si hay una imageUrl proporcionada
  useEffect(() => {
    if (imageUrl && !selectedImage) {
      // Crear un objeto de imagen a partir de la URL
      setSelectedImage({
        key: imageUrl,
        url: imageUrl,
        filename: imageUrl.split('/').pop() || 'imagen',
        type: 'image/',
        size: 0,
        lastModified: new Date(),
      })
    }
  }, [imageUrl, selectedImage])

  const handleImageSelect = (image: S3Image | null) => {
    setSelectedImage(image)

    // Llamar a onImageChange con la URL de la imagen seleccionada
    if (image) {
      onImageChange(image.url)
    } else {
      onImageChange('')
    }
  }

  // Resto del componente permanece igual
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium">Imagen</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsModalOpen(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {selectedImage ? (
        <div className="relative">
          <div
            className="aspect-square w-full overflow-hidden rounded-md cursor-pointer relative group"
            onClick={() => setIsModalOpen(true)}
          >
            <Image
              src={selectedImage.url}
              alt={selectedImage.filename}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-black hover:bg-gray-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Cambiar imagen
              </Button>
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-gray-500 truncate max-w-[70%]">
              {selectedImage.filename}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-blue-500 text-blue-600 hover:text-blue-800 hover:bg-blue-50 z-10"
              onClick={() => setIsModalOpen(true)}
            >
              Cambiar
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="bg-gray-100 p-3 rounded-full mb-3">
            <ImageIcon className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Agregar imagen</p>
          <p className="text-xs text-gray-400">Recomendado: 1200 x 1200px .jpg</p>
        </div>
      )}

      <ImageSelectorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSelect={handleImageSelect as (images: S3Image | S3Image[] | null) => void}
        initialSelectedImage={selectedImage?.key}
        allowMultipleSelection={false}
      />
    </div>
  )
}
