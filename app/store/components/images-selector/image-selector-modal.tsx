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
import ImageGallery from './ImageGallery'

interface ImageSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (images: S3Image | S3Image[] | null) => void
  initialSelectedImage?: string | null
  allowMultipleSelection?: boolean
}

export default function ImageSelectorModal({
  open,
  onOpenChange,
  onSelect,
  initialSelectedImage = null,
  allowMultipleSelection = false,
}: ImageSelectorModalProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImage, setSelectedImage] = useState<string | string[] | null>(
    allowMultipleSelection
      ? initialSelectedImage
        ? [initialSelectedImage]
        : []
      : initialSelectedImage
  )
  const [searchTerm, setSearchTerm] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)

  const {
    images,
    loading,
    error,
    uploadImage,
    deleteImage,
    fetchMoreImages,
    loadingMore,
    nextContinuationToken,
  } = useS3Images({
    limit: 18,
  })
  const filteredImages = images.filter(img =>
    img.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Manejar la selección de imágenes
  const handleImageSelect = (image: S3Image) => {
    if (allowMultipleSelection) {
      const selectedKeys = Array.isArray(selectedImage) ? selectedImage : []
      const isSelected = selectedKeys.includes(image.key)
      if (isSelected) {
        setSelectedImage(selectedKeys.filter(key => key !== image.key))
      } else {
        setSelectedImage([...selectedKeys, image.key])
      }
    } else {
      const newSelectedKey = selectedImage === image.key ? null : image.key
      setSelectedImage(newSelectedKey)
    }
  }

  // Manejar la confirmación de selección
  const handleConfirm = () => {
    if (allowMultipleSelection) {
      const selectedKeys = Array.isArray(selectedImage) ? selectedImage : []
      const selectedImages = images.filter(img => selectedKeys.includes(img.key))
      if (onSelect) {
        onSelect(selectedImages.length > 0 ? selectedImages : null)
      }
    } else {
      const selected = images.find(img => img.key === selectedImage) || null
      if (onSelect) {
        onSelect(selected)
      }
    }
    onOpenChange(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)
    setIsUploading(true)

    const previews: string[] = []
    for (const file of filesArray) {
      const reader = new FileReader()
      reader.onload = e => {
        if (e.target?.result) {
          previews.push(e.target.result as string)

          if (previews.length === filesArray.length) {
            setUploadPreview(previews[0])
          }
        }
      }
      reader.readAsDataURL(file)
    }

    try {
      const uploadedImages = await uploadImage(filesArray)
      if (uploadedImages && uploadedImages.length > 0) {
        if (allowMultipleSelection) {
          setSelectedImage(prev => {
            const currentSelected = Array.isArray(prev) ? prev : prev ? [prev] : []
            const newKeys = uploadedImages.map(img => img.key)
            const uniqueNewKeys = newKeys.filter(key => !currentSelected.includes(key))
            return [...currentSelected, ...uniqueNewKeys]
          })
        } else {
          setSelectedImage(uploadedImages[0].key)
        }
      }
    } catch (error) {
      console.error('Error uploading image(s):', error)
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
        const filesArray = Array.from(e.dataTransfer.files)

        const imageFiles = filesArray.filter(file => file.type.startsWith('image/'))

        if (imageFiles.length === 0) {
          console.warn('Dropped files are not images.')
          return
        }

        setIsUploading(true)
        setUploadPreview(null)

        const reader = new FileReader()
        reader.onload = e => {
          if (e.target?.result) {
            setUploadPreview(e.target.result as string)
          }
        }
        reader.readAsDataURL(imageFiles[0])

        try {
          const uploadedImages = await uploadImage(imageFiles)
          if (uploadedImages && uploadedImages.length > 0) {
            if (allowMultipleSelection) {
              setSelectedImage(prev => {
                const currentSelected = Array.isArray(prev) ? prev : prev ? [prev] : []
                const newKeys = uploadedImages.map(img => img.key)
                const uniqueNewKeys = newKeys.filter(key => !currentSelected.includes(key))
                return [...currentSelected, ...uniqueNewKeys]
              })
            } else {
              setSelectedImage(uploadedImages[0].key)
            }
          }
        } catch (error) {
          console.error('Error uploading image(s) on drop:', error)
        } finally {
          setIsUploading(false)
          setUploadPreview(null)
        }
      }
    },
    [uploadImage, allowMultipleSelection, selectedImage]
  )

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  // Handle scroll to fetch more images
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    // Check if scrolled to the bottom (within a threshold)
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100 // 100px threshold

    if (isAtBottom && nextContinuationToken && !loadingMore && !loading) {
      fetchMoreImages()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Seleccionar imagen</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0" onScroll={handleScroll}>
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
              multiple={allowMultipleSelection}
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

          {/* Render the extracted ImageGallery component */}
          <ImageGallery
            images={filteredImages}
            viewMode={viewMode}
            selectedImage={selectedImage}
            allowMultipleSelection={allowMultipleSelection}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            onImageSelect={handleImageSelect}
            onDeleteImage={handleDeleteImage}
          />

          {/* Loading indicator for more images */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader color="white" />
              <span className="text-sm ml-2">Cargando más imágenes...</span>
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
