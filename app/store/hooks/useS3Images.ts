import { useState, useEffect, useCallback, useMemo } from 'react'
import { post } from 'aws-amplify/api'
import useStoreDataStore from '@/context/core/storeDataStore'

export interface S3Image {
  key: string
  url: string
  filename: string
  lastModified?: Date
  size?: number
  type?: string
  id?: string
}

interface UseS3ImagesOptions {
  limit?: number
  prefix?: string
}

// Definir el tipo de la respuesta esperada del API
interface S3ImagesResponse {
  images?: S3Image[]
  success?: boolean
  image?: S3Image
  nextContinuationToken?: string
}

export function useS3Images(options: UseS3ImagesOptions = {}) {
  const [images, setImages] = useState<S3Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { storeId } = useStoreDataStore()
  const [nextContinuationToken, setNextContinuationToken] = useState<string | undefined>(undefined)
  const [loadingMore, setLoadingMore] = useState(false)

  // Memoizar las opciones para evitar re-renders innecesarios
  const memoizedOptions = useMemo(
    () => ({
      limit: options.limit || 18,
      prefix: options.prefix || '',
    }),
    [options.limit, options.prefix]
  )

  const fetchImages = useCallback(
    async (token?: string) => {
      if (!storeId) {
        setLoading(false)
        setImages([])
        setNextContinuationToken(undefined)
        return
      }

      if (!token) {
        setLoading(true)
        setImages([])
      } else {
        setLoadingMore(true)
      }
      setError(null)

      try {
        const restOperation = post({
          apiName: 'StoreImagesApi',
          path: 'store-images',
          options: {
            body: {
              action: 'list',
              storeId,
              limit: memoizedOptions.limit,
              prefix: memoizedOptions.prefix,
              continuationToken: token,
            } as any,
          },
        })

        const { body } = await restOperation.response
        const response = (await body.json()) as S3ImagesResponse

        if (!response.images) {
          if (!token) {
            setImages([])
          }
          setNextContinuationToken(undefined)
          return
        }

        const processedImages = response.images.map(img => ({
          ...img,
          lastModified: img.lastModified ? new Date(img.lastModified) : undefined,
          id: img.id || generateFallbackId(img.key, img.filename),
        }))

        setImages(prev => (token ? [...prev, ...processedImages] : processedImages))
        setNextContinuationToken(response.nextContinuationToken)
      } catch (err) {
        console.error(token ? 'Error fetching more S3 images:' : 'Error fetching S3 images:', err)
        setError(err instanceof Error ? err : new Error('Unknown error occurred'))
        setNextContinuationToken(undefined)
      } finally {
        if (!token) {
          setLoading(false)
        } else {
          setLoadingMore(false)
        }
      }
    },
    [storeId, memoizedOptions.limit, memoizedOptions.prefix]
  )

  // useEffect optimizado con dependencias estables
  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const fetchMoreImages = useCallback(() => {
    if (nextContinuationToken && !loadingMore && !loading) {
      fetchImages(nextContinuationToken)
    }
  }, [nextContinuationToken, loadingMore, loading, fetchImages])

  const uploadImage = useCallback(
    async (files: File[]): Promise<S3Image[] | null> => {
      if (!storeId || files.length === 0) return null

      const uploadedImages: S3Image[] = []

      for (const file of files) {
        try {
          const base64File = await fileToBase64(file)

          const restOperation = post({
            apiName: 'StoreImagesApi',
            path: 'store-images',
            options: {
              body: {
                action: 'upload',
                storeId,
                filename: file.name,
                contentType: file.type,
                fileContent: base64File,
              } as any,
            },
          })

          const { body } = await restOperation.response
          const response = (await body.json()) as S3ImagesResponse

          if (!response.image) {
            console.error('Failed to upload image:', file.name)
            continue
          }

          const newImage = {
            ...response.image,
            lastModified: response.image.lastModified
              ? new Date(response.image.lastModified)
              : new Date(),
            // Generar ID único si no existe (compatibilidad hacia atrás)
            id:
              response.image.id || generateFallbackId(response.image.key, response.image.filename),
          }

          uploadedImages.push(newImage)
        } catch (err) {
          console.error('Error uploading image:', file.name, err)
          continue
        }
      }

      if (uploadedImages.length > 0) {
        setImages(prev => [...uploadedImages, ...prev])
      }

      return uploadedImages.length > 0 ? uploadedImages : null
    },
    [storeId]
  )

  const deleteImage = useCallback(
    async (key: string): Promise<boolean> => {
      if (!storeId) return false

      try {
        const restOperation = post({
          apiName: 'StoreImagesApi',
          path: 'store-images',
          options: {
            body: {
              action: 'delete',
              storeId,
              key,
            } as any,
          },
        })

        const { body } = await restOperation.response
        const response = (await body.json()) as S3ImagesResponse

        if (!response.success) {
          throw new Error('Failed to delete image')
        }

        setImages(prev => prev.filter(img => img.key !== key))

        return true
      } catch (err) {
        console.error('Error deleting image:', err)
        return false
      }
    },
    [storeId]
  )

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

  return {
    images,
    loading,
    error,
    uploadImage,
    deleteImage,
    fetchMoreImages,
    loadingMore,
    nextContinuationToken,
  }
}

/**
 * Genera un ID único para compatibilidad hacia atrás cuando las imágenes
 * existentes no tienen el campo id
 */
function generateFallbackId(key: string, filename: string): string {
  // Crear hash simple del key
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Extraer timestamp del key si está disponible
  const timestampMatch = key.match(/\/(\d+)-/)
  const timestamp = timestampMatch ? timestampMatch[1] : Date.now().toString()

  return `fallback_${Math.abs(hash)}_${timestamp}`
}
