import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UploadDropZoneProps {
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  triggerFileSelect: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  allowMultipleSelection: boolean
}

export default function UploadDropZone({
  onDrop,
  onDragOver,
  onFileUpload,
  triggerFileSelect,
  fileInputRef,
  allowMultipleSelection,
}: UploadDropZoneProps) {
  return (
    <div
      className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        accept="image/*"
        className="hidden"
        multiple={allowMultipleSelection}
      />
      <Button variant="outline" className="mb-4" onClick={triggerFileSelect}>
        <Upload className="h-4 w-4 mr-2" />
        Agregar imágenes
      </Button>
      <p className="text-sm text-muted-foreground">Arrastrar y soltar imágenes aquí</p>
    </div>
  )
}
