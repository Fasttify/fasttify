import { useState, useEffect } from 'react'
import { post } from 'aws-amplify/api'
import useStoreDataStore from '@/zustand-states/storeDataStore'

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
}

export function useS3Images(options: UseS3ImagesOptions = {}) {
  const [images, setImages] = useState<S3Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { storeId } = useStoreDataStore()

  useEffect(() => {
    const fetchImages = async () => {
      if (!storeId) {
        setLoading(false)
        setImages([])
        return
      }

      setLoading(true)
      try {
        const restOperation = post({
          apiName: 'StoreImagesApi',
          path: 'store-images',
          options: {
            body: {
              action: 'list',
              storeId,
              limit: options.limit || 1000,
              prefix: options.prefix || '',
            },
          },
        })

        const { body } = await restOperation.response
        const response = (await body.json()) as S3ImagesResponse

        if (!response.images) {
          setImages([])
          return
        }

        const processedImages = response.images.map(img => ({
          ...img,
          lastModified: img.lastModified ? new Date(img.lastModified) : undefined,
        }))

        setImages(processedImages)
      } catch (err) {
        console.error('Error fetching S3 images:', err)
        setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [storeId, options.prefix, options.limit])

  const uploadImage = async (file: File): Promise<S3Image | null> => {
    if (!storeId || !file) return null

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
          },
        },
      })

      const { body } = await restOperation.response
      const response = (await body.json()) as S3ImagesResponse

      if (!response.image) {
        throw new Error('Failed to upload image')
      }

      const newImage = {
        ...response.image,
        lastModified: response.image.lastModified
          ? new Date(response.image.lastModified)
          : new Date(),
      }

      setImages(prev => [newImage, ...prev])

      return newImage
    } catch (err) {
      console.error('Error uploading image:', err)
      return null
    }
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
          },
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

  return { images, loading, error, uploadImage, deleteImage }
}
