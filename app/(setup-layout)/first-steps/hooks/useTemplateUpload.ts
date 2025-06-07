import { useState } from 'react'

interface TemplateUploadData {
  storeId: string
  storeName: string
  domain: string
  storeData?: {
    theme?: string
    currency?: string
    description?: string
    logo?: string
    banner?: string
    contactEmail?: string
    contactPhone?: string
    storeAddress?: string
  }
}

interface TemplateUploadResponse {
  success: boolean
  message: string
  templateUrls: Record<string, string>
  uploadedFiles: number
  files: Array<{ key: string; path: string; size: number }>
}

interface TemplateUploadError {
  error: string
  message?: string
}

export function useTemplateUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadTemplate = async (
    data: TemplateUploadData
  ): Promise<TemplateUploadResponse | null> => {
    setIsUploading(true)
    setError(null)

    try {
      const response = await fetch('/api/stores/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        const errorData = result as TemplateUploadError
        throw new Error(errorData.message || errorData.error || 'Failed to upload template')
      }

      return result as TemplateUploadResponse
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Template upload error:', err)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadTemplate,
    isUploading,
    error,
    clearError: () => setError(null),
  }
}
