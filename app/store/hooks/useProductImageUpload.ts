import { useState } from 'react'
import { uploadData } from 'aws-amplify/storage'
import { Amplify } from 'aws-amplify'
import { v4 as uuidv4 } from 'uuid'
import { getCurrentUser } from 'aws-amplify/auth'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)

export interface UploadedImage {
  url: string
  alt: string
}

export function useProductImageUpload() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Obtener el bucket, la región y el dominio del CDN desde las variables de entorno
  const bucketName = process.env.NEXT_PUBLIC_S3_URL
  const awsRegion = process.env.NEXT_PUBLIC_AWS_REGION
  const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN

  if (!bucketName) {
    throw new Error('environment variable NEXT_PUBLIC_S3_URL is not defined')
  }
  // Es bueno tener awsRegion si se usa el fallback a S3
  if (!awsRegion && (!cloudFrontDomain || cloudFrontDomain.trim() === '')) {
    throw new Error(
      'environment variable NEXT_PUBLIC_AWS_REGION is not defined or NEXT_PUBLIC_CLOUDFRONT_DOMAIN is not defined or empty'
    )
  }

  const uploadProductImage = async (file: File, storeId: string): Promise<UploadedImage | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // Generar un UUID único para el archivo
      const uniqueFileName = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`
      // Obtener el usuario actual para usar su ID en la ruta
      const user = await getCurrentUser()
      const userId = user.userId

      // Subir la imagen al bucket correcto
      const result = await uploadData({
        path: `products/${userId}/${uniqueFileName}`,
        options: {
          bucket: 'fasttifyAssets',
          contentType: file.type,
        },
        data: file,
      }).result

      // Construir la URL pública condicionalmente
      let publicUrl: string
      const s3Key = result.path

      if (cloudFrontDomain && cloudFrontDomain.trim() !== '') {
        // Usar CloudFront (generalmente para producción o cuando esté configurado)
        publicUrl = `https://${cloudFrontDomain}/${s3Key}`
      } else {
        // Fallback a la URL de S3
        const regionForS3Url = awsRegion
        publicUrl = `https://${bucketName}.s3.${regionForS3Url}.amazonaws.com/${s3Key}`
      }

      return {
        url: publicUrl,
        alt: '',
      }
    } catch (error) {
      console.error('Error uploading product image:', error)
      setError(error instanceof Error ? error : new Error('Unknown error uploading product image'))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const uploadMultipleProductImages = async (
    files: File[],
    storeId: string
  ): Promise<UploadedImage[]> => {
    setIsLoading(true)
    setError(null)

    try {
      // Subir todas las imágenes en paralelo
      const uploadPromises = files.map(file => uploadProductImage(file, storeId))
      const results = await Promise.all(uploadPromises)

      // Filtrar las imágenes que se subieron correctamente
      return results.filter((result): result is UploadedImage => result !== null)
    } catch (error) {
      console.error('Error uploading multiple product images:', error)
      setError(
        error instanceof Error
          ? error
          : new Error('Unknown error uploading multiple product images')
      )
      return []
    } finally {
      setIsLoading(false)
    }
  }

  return {
    uploadProductImage,
    uploadMultipleProductImages,
    isLoading,
    error,
  }
}
