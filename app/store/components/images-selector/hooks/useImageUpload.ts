import { useState, useCallback } from 'react'
import type { S3Image } from '@/app/store/hooks/useS3Images'

interface UseImageUploadProps {
  uploadImage: (files: File[]) => Promise<S3Image[] | null>
  onImagesUploaded?: (images: S3Image[]) => void
}

export function useImageUpload({ uploadImage, onImagesUploaded }: UseImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleDrop = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter(file => file.type.startsWith('image/'))

      if (imageFiles.length === 0) {
        console.warn('No image files found.')
        return null
      }

      setIsUploading(true)

      try {
        const uploadedImages = await uploadImage(imageFiles)
        if (uploadedImages && uploadedImages.length > 0) {
          onImagesUploaded?.(uploadedImages)
          return uploadedImages
        }
        return null
      } catch (error) {
        console.error('Error uploading images:', error)
        return null
      } finally {
        setIsUploading(false)
      }
    },
    [uploadImage, onImagesUploaded]
  )

  return {
    isUploading,
    handleDrop,
  }
}
