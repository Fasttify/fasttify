import { useAuth } from '@/context/hooks/useAuth';
import { getCdnUrlForKey } from '@/utils/client';
import { updateUserAttributes } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useUpdateProfilePicture() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const updateProfilePicture = async (file: File) => {
    setIsLoading(true);
    try {
      // Generar un ID único para el archivo
      const uniqueId = uuidv4();
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${uniqueId}.${fileExtension}`;

      // 1. Subir la imagen a S3 en una carpeta pública con el nombre único.
      const result = await uploadData({
        path: `profile-pictures/${user?.userId}/${uniqueFileName}`,
        data: file,
        options: {
          contentType: file.type,
          bucket: 'fasttifyAssets',
        },
      }).result;

      // 2. Construir la URL pública usando la utilidad de CDN.
      const publicUrl = getCdnUrlForKey(result.path);

      // 3. Actualizar el atributo 'picture' del usuario con la URL pública.
      await updateUserAttributes({
        userAttributes: {
          picture: publicUrl,
        },
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProfilePicture, isLoading };
}
