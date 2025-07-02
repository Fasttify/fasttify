import { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import { v4 as uuidv4 } from 'uuid';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);

type UploadType = 'logo' | 'favicon';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadedLogo {
  url: string;
  type: UploadType;
}

interface UseLogoUploadReturn {
  uploadLogo: (file: File, type: UploadType) => Promise<UploadedLogo | null>;
  status: UploadStatus;
  error: string | null;
  reset: () => void;
}

export function useLogoUpload(): UseLogoUploadReturn {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Obtener el bucket y la región desde las variables de entorno
  const bucketName = process.env.NEXT_PUBLIC_S3_URL;
  const awsRegion = process.env.NEXT_PUBLIC_AWS_REGION;
  const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;

  if (!bucketName) {
    throw new Error('environment variable NEXT_PUBLIC_S3_URL is not defined');
  }

  if (!awsRegion && (!cloudFrontDomain || cloudFrontDomain.trim() === '')) {
    throw new Error(
      'environment variable NEXT_PUBLIC_AWS_REGION is not defined or NEXT_PUBLIC_CLOUDFRONT_DOMAIN is not defined or empty'
    );
  }

  const reset = () => {
    setStatus('idle');
    setError(null);
  };

  const uploadLogo = async (file: File, type: UploadType): Promise<UploadedLogo | null> => {
    try {
      setStatus('uploading');
      setError(null);

      // Obtener el usuario actual para usar su ID en la ruta
      const user = await getCurrentUser();
      const userId = user.userId;

      // Crear un nombre de archivo único con UUID
      const fileExtension = file.name.split('.').pop();
      const uniqueId = uuidv4();
      const key = `store-logos/${userId}/${type}-${uniqueId}.${fileExtension}`;

      const result = await uploadData({
        path: key,
        data: file,
        options: {
          bucket: 'fasttifyAssets',
          contentType: file.type,
        },
      }).result;

      // Construir la URL pública condicionalmente
      let publicUrl: string;
      const s3Key = result.path;

      if (cloudFrontDomain && cloudFrontDomain.trim() !== '') {
        publicUrl = `https://${cloudFrontDomain}/${s3Key}`;
      } else {
        // Fallback a la URL de S3
        const regionForS3Url = awsRegion;
        publicUrl = `https://${bucketName}.s3.${regionForS3Url}.amazonaws.com/${s3Key}`;
      }

      setStatus('success');

      // Devolver la URL completa del archivo subido
      return {
        url: publicUrl,
        type: type,
      };
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unknown error has occurred');
      console.error('Error uploading logo:', err);
      return null;
    }
  };

  return {
    uploadLogo,
    status,
    error,
    reset,
  };
}
