import outputs from '@/amplify_outputs.json';
import { getCdnUrlForKey } from '@/utils/client';
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

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

      // Construir la URL pública usando la utilidad CDN
      const publicUrl = getCdnUrlForKey(result.path);

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
