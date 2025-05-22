import { useState, useEffect } from 'react'
import { post } from 'aws-amplify/api'
import useStoreDataStore from '@/context/core/storeDataStore'

export interface S3Image {
  key: string
  url: string
  filename: string
  lastModified?: Date
  size?: number
  type?: string
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

  const fetchImages = async (token?: string) => {
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
            limit: options.limit || 18,
            prefix: options.prefix || '',
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
  }

  useEffect(() => {
    fetchImages()
  }, [storeId, options.prefix])

  const fetchMoreImages = () => {
    if (nextContinuationToken && !loadingMore && !loading) {
      fetchImages(nextContinuationToken)
    }
  }

  const uploadImage = async (files: File[]): Promise<S3Image[] | null> => {
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
  }

  const deleteImage = async (key: string): Promise<boolean> => {
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
  }

  const fileToBase64 = (file: File): Promise<string> => {
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
  }

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
