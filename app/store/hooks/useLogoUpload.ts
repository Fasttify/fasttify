import { useState } from 'react'
import { uploadData } from 'aws-amplify/storage'
import { getCurrentUser } from 'aws-amplify/auth'
import { Amplify } from 'aws-amplify'
import { v4 as uuidv4 } from 'uuid'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)

type UploadType = 'logo' | 'favicon'
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export interface UploadedLogo {
  url: string
  type: UploadType
}

interface UseLogoUploadReturn {
  uploadLogo: (file: File, type: UploadType) => Promise<UploadedLogo | null>
  status: UploadStatus
  error: string | null
  reset: () => void
}

export function useLogoUpload(): UseLogoUploadReturn {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  // Obtener el bucket correcto para logos de tienda
  const logoBucket = outputs.storage.buckets.find(bucket => bucket.name === 'storeLogo')
  const aws_region = outputs.auth.aws_region

  if (!logoBucket) {
    throw new Error('There is no bucket for store logos')
  }

  const reset = () => {
    setStatus('idle')
    setError(null)
  }

  const uploadLogo = async (file: File, type: UploadType): Promise<UploadedLogo | null> => {
    try {
      setStatus('uploading')
      setError(null)

      // Obtener el usuario actual para usar su ID en la ruta
      const user = await getCurrentUser()
      const userId = user.userId

      // Crear un nombre de archivo único con UUID
      const fileExtension = file.name.split('.').pop()
      const uniqueId = uuidv4()
      const key = `store/${userId}/${type}-${uniqueId}.${fileExtension}`

      const result = await uploadData({
        key,
        data: file,
        options: {
          bucket: 'storeLogo',
        },
      }).result

      // Construir la URL pública correcta usando el nombre del bucket
      const publicUrl = `https://${logoBucket.bucket_name}.s3.${aws_region}.amazonaws.com/public/${result.key}`

      setStatus('success')

      // Devolver la URL completa del archivo subido
      return {
        url: publicUrl,
        type: type,
      }
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error desconocido')
      console.error('Error uploading logo:', err)
      return null
    }
  }

  return {
    uploadLogo,
    status,
    error,
    reset,
  }
}
