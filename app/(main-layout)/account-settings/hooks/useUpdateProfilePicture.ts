import { useState } from 'react'
import { uploadData } from 'aws-amplify/storage'
import { updateUserAttributes } from 'aws-amplify/auth'
import { useAuthUser } from '@/hooks/auth/useAuthUser'
import { v4 as uuidv4 } from 'uuid'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export function useUpdateProfilePicture() {
  const [isLoading, setIsLoading] = useState(false)
  const { userData } = useAuthUser()

  const updateProfilePicture = async (file: File) => {
    setIsLoading(true)
    try {
      // Generar un ID único para el archivo
      const uniqueId = uuidv4()
      const fileExtension = file.name.split('.').pop()
      const uniqueFileName = `${uniqueId}.${fileExtension}`

      // 1. Subir la imagen a S3 en una carpeta pública con el nombre único.
      const result = await uploadData({
        path: `profile-pictures/${userData?.sub}/${uniqueFileName}`,
        data: file,
        options: {
          contentType: file.type,
          bucket: 'fasttifyAssets',
        },
      }).result

      // 2. Construir la URL pública condicionalmente.
      const bucketName = process.env.NEXT_PUBLIC_S3_URL
      const awsRegion = process.env.NEXT_PUBLIC_AWS_REGION
      const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN

      if (!bucketName) {
        throw new Error('NEXT_PUBLIC_S3_URL is not defined in your environment variables')
      }

      let publicUrl: string
      const s3Key = result.path

      if (cloudFrontDomain && cloudFrontDomain.trim() !== '') {
        // Usar CloudFront para producción (o cuando esté configurado)
        publicUrl = `https://${cloudFrontDomain}/${s3Key}`
      } else {
        // Fallback a la URL de S3 para otros entornos
        const regionForS3Url = awsRegion
        publicUrl = `https://${bucketName}.s3.${regionForS3Url}.amazonaws.com/${s3Key}`
      }

      // 3. Actualizar el atributo 'picture' del usuario con la URL pública.
      await updateUserAttributes({
        userAttributes: {
          picture: publicUrl,
        },
      })
    } catch (error) {
      console.error('Error updating profile picture:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { updateProfilePicture, isLoading }
}
