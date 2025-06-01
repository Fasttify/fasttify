import Image from 'next/image'
import { Loader } from '@/components/ui/loader'

interface UploadPreviewProps {
  uploadPreview: string
  isUploading: boolean
}

export default function UploadPreview({ uploadPreview, isUploading }: UploadPreviewProps) {
  if (!isUploading || !uploadPreview) {
    return null
  }

  return (
    <div className="border rounded-md p-4 flex items-center gap-4">
      <div className="relative h-16 w-16 flex-shrink-0">
        <Image src={uploadPreview} alt="Preview" fill className="object-cover rounded-md" />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <Loader color="white" />
        <span className="text-sm">Subiendo imagen...</span>
      </div>
    </div>
  )
}
