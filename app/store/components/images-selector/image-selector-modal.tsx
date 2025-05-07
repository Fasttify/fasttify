import { useState, useRef, useCallback } from 'react'
import { Search, Grid, List, Upload, Trash2 } from 'lucide-react'
import { Loader } from '@/components/ui/loader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useS3Images, type S3Image } from '@/app/store/hooks/useS3Images'
import Image from 'next/image'

interface ImageSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (image: S3Image | null) => void
  initialSelectedImage?: string | null
}

export default function ImageSelectorModal({
  open,
  onOpenChange,
  onSelect,
  initialSelectedImage = null,
}: ImageSelectorModalProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImage, setSelectedImage] = useState<string | null>(initialSelectedImage)
  const [searchTerm, setSearchTerm] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  // Usar el hook useS3Images para obtener, cargar y eliminar imágenes
  const { images, loading, error, uploadImage, deleteImage } = useS3Images({
    limit: 100,
  })
  // Filtrar imágenes según el término de búsqueda
  const filteredImages = images.filter(img =>
    img.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Manejar la selección de imágenes
  const handleImageSelect = (image: S3Image) => {
    const newSelectedKey = selectedImage === image.key ? null : image.key
    setSelectedImage(newSelectedKey)
  }

  // Manejar la confirmación de selección
  const handleConfirm = () => {
    const selected = images.find(img => img.key === selectedImage) || null
    if (onSelect) {
      onSelect(selected)
    }
    onOpenChange(false)
  }

  // Manejar la carga de archivos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setIsUploading(true)

    // Crear una vista previa de la imagen
    const reader = new FileReader()
    reader.onload = e => {
      if (e.target?.result) {
        setUploadPreview(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)

    try {
      const uploadedImage = await uploadImage(file)
      if (uploadedImage) {
        setSelectedImage(uploadedImage.key)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsUploading(false)
      setUploadPreview(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Manejar la eliminación de imágenes
  const handleDeleteImage = async (key: string) => {
    try {
      const success = await deleteImage(key)
      if (success) {
        if (selectedImage === key) {
          setSelectedImage(null)
        }
      }
    } catch (error) {}
  }

  // Manejar el arrastrar y soltar
  const onDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0]

        try {
          const uploadedImage = await uploadImage(file)
          if (uploadedImage) {
            setSelectedImage(uploadedImage.key)
          }
        } catch (error) {}
      }
    },
    [uploadImage]
  )

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] p-0 gap-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Seleccionar imagen</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar archivos"
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2">
                    {viewMode === 'grid' ? (
                      <Grid className="h-4 w-4" />
                    ) : (
                      <List className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setViewMode('grid')}>
                    <Grid className="h-4 w-4 mr-2" />
                    Cuadrícula
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode('list')}>
                    <List className="h-4 w-4 mr-2" />
                    Lista
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Drop zone */}
          <div
            className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center"
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Agregar imágenes
            </Button>
            <p className="text-sm text-muted-foreground">Arrastrar y soltar imágenes</p>
          </div>

          {/* Upload preview */}
          {isUploading && uploadPreview && (
            <div className="border rounded-md p-4 flex items-center gap-4">
              <div className="relative h-16 w-16 flex-shrink-0">
                <Image
                  src={uploadPreview || '/placeholder.svg'}
                  alt="Preview"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1 flex items-center">
                <Loader color="white" />
                <span className="text-sm">Subiendo imagen...</span>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center py-8">
              <Loader color="white" />
              <span className="text-sm">Cargando imágenes...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-8 text-red-500">
              Error al cargar las imágenes. Por favor, intenta de nuevo.
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredImages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay imágenes disponibles. Sube algunas imágenes para comenzar.
            </div>
          )}

          {/* Image gallery - Grid view */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
              {filteredImages.map((image, index) => (
                <div
                  key={image.key}
                  className={`relative border rounded-md overflow-hidden ${
                    selectedImage === image.key ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleImageSelect(image)}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedImage === image.key}
                      onChange={() => handleImageSelect(image)}
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
                        handleDeleteImage(image.key)
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
                      priority={selectedImage === image.key || index < 12}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
                      style={{ objectFit: 'cover' }}
                      loading={selectedImage === image.key || index < 12 ? undefined : 'lazy'}
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+"
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
              {filteredImages.map((image, index) => (
                <div
                  key={image.key}
                  className={`flex items-center border rounded-md p-2 ${
                    selectedImage === image.key ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleImageSelect(image)}
                >
                  <div className="mr-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedImage === image.key}
                      onChange={() => handleImageSelect(image)}
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
                      priority={selectedImage === image.key || index < 20}
                      className="object-cover w-full h-full rounded"
                      style={{ objectFit: 'cover' }}
                      loading={selectedImage === image.key || index < 20 ? undefined : 'lazy'}
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg=="
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
                      handleDeleteImage(image.key)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-[#2a2a2a] h-9 px-4 text-sm font-medium text-white py-2 rounded-md hover:bg-[#3a3a3a] transition-colors"
            onClick={handleConfirm}
          >
            Seleccionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
