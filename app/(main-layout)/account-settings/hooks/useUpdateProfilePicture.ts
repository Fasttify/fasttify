import { useState } from 'react'
import { uploadData } from 'aws-amplify/storage'
import { updateUserAttributes } from 'aws-amplify/auth'
import { useAuthUser } from '@/hooks/auth/useAuthUser'
import { Amplify } from 'aws-amplify'
import { v4 as uuidv4 } from 'uuid'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)

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
        path: `public/profile-pictures/${userData?.sub}/${uniqueFileName}`,
        data: file,
        options: {
          contentType: file.type,
        },
      }).result

      // 2. Construir la URL pública manualmente.
      const bucketName = outputs.storage.bucket_name
      const region = outputs.storage.aws_region
      const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${result.path}`

      // 3. Actualizar el atributo 'picture' del usuario con la URL pública.
      await updateUserAttributes({
        userAttributes: {
          picture: publicUrl,
        },
      })
    } catch (error) {
      console.error('Error al actualizar la foto de perfil:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { updateProfilePicture, isLoading }
}
