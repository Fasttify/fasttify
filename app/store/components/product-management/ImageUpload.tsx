import { useState, useRef } from 'react'
import Image from 'next/image'
import { X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'

interface ImageFile {
  url: string
  alt: string
}

interface ImageUploadProps {
  value: ImageFile[]
  onChange: (value: ImageFile[]) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [enlargedImage, setEnlargedImage] = useState<ImageFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newImages = Array.from(files)
      .filter(file => file.type.startsWith('image/') && file.size <= 5242880) // 5MB
      .map(file => ({
        url: URL.createObjectURL(file),
        alt: '',
      }))

    onChange([...value, ...newImages])
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const removeImage = (index: number) => {
    const newImages = [...value]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  const updateAltText = (index: number, alt: string) => {
    const newImages = [...value]
    newImages[index].alt = alt
    onChange(newImages)
  }

  // Funcionalidad para reordenar imágenes
  const handleImageDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...value]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    onChange(newImages)
    setDraggedIndex(index)
  }

  const handleImageDragEnd = () => {
    setDraggedIndex(null)
  }

  const openEnlargedView = (image: ImageFile) => {
    setEnlargedImage(image)
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50',
          isDragging ? 'border-blue-500 bg-blue-100' : 'border-gray-300 hover:border-blue-500'
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          onChange={e => handleFileSelect(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="font-medium text-lg">Arrastre y suelte imágenes aquí</h3>
          <p className="text-sm text-muted-foreground">
            o haga clic para buscar (máximo 5MB por imagen)
          </p>
          <Button type="button" variant="secondary" className="mt-2">
            Seleccionar Archivos
          </Button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Imágenes del Producto ({value.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((image, index) => (
              <div
                key={index}
                className="border rounded-lg p-2 space-y-2"
                draggable
                onDragStart={() => handleImageDragStart(index)}
                onDragOver={e => handleImageDragOver(e, index)}
                onDragEnd={handleImageDragEnd}
              >
                <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
                  <Image
                    src={image.url || '/placeholder.svg'}
                    alt={image.alt || 'Imagen del producto'}
                    fill
                    className="object-cover cursor-pointer"
                    onClick={() => openEnlargedView(image)}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={e => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Eliminar imagen</span>
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`alt-text-${index}`} className="text-xs">
                    Texto Alternativo
                  </Label>
                  <Input
                    id={`alt-text-${index}`}
                    value={image.alt || ''}
                    onChange={e => updateAltText(index, e.target.value)}
                    placeholder="Describa esta imagen"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {index === 0 ? 'Imagen Principal' : `Imagen ${index + 1}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!enlargedImage} onOpenChange={open => !open && setEnlargedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-1 sm:p-2">
          <DialogClose className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-6 w-6" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
          {enlargedImage && (
            <div className="relative w-full h-[80vh]">
              <Image
                src={enlargedImage.url || '/placeholder.svg'}
                alt={enlargedImage.alt || 'Imagen ampliada del producto'}
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
