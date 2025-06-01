import { useState, useCallback, useRef } from 'react'
import type { S3Image } from '@/app/store/hooks/useS3Images'

interface UseImageUploadProps {
  uploadImage: (files: File[]) => Promise<S3Image[] | null>
  allowMultipleSelection?: boolean
  onImagesUploaded?: (images: S3Image[]) => void
}

export function useImageUpload({
  uploadImage,
  allowMultipleSelection = false,
  onImagesUploaded,
}: UseImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = error => reject(error)
    })
  }, [])

  const processFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter(file => file.type.startsWith('image/'))

      if (imageFiles.length === 0) {
        console.warn('No image files found.')
        return null
      }

      setIsUploading(true)
      setUploadPreview(null)

      // Set preview for first image
      try {
        const reader = new FileReader()
        reader.onload = e => {
          if (e.target?.result) {
            setUploadPreview(e.target.result as string)
          }
        }
        reader.readAsDataURL(imageFiles[0])
      } catch (error) {
        console.error('Error setting preview:', error)
      }

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
        setUploadPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [uploadImage, onImagesUploaded]
  )

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files || files.length === 0) return

      const filesArray = Array.from(files)
      await processFiles(filesArray)
    },
    [processFiles]
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const filesArray = Array.from(e.dataTransfer.files)
        await processFiles(filesArray)
      }
    },
    [processFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return {
    isUploading,
    uploadPreview,
    fileInputRef,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    triggerFileSelect,
    allowMultipleSelection,
  }
}
