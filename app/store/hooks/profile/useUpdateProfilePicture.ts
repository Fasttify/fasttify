import { useState } from 'react';
import { updateUserAttributes } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage';
import { useAuth } from '@/context/hooks/useAuth';
import { getCdnUrlForKey } from '@/utils/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook personalizado para actualizar la imagen de perfil del usuario
 *
 * @returns {Object} Objeto con función para actualizar la imagen y estado de carga
 */
export function useUpdateProfilePicture() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshUser } = useAuth();

  /**
   * Actualiza la imagen de perfil del usuario
   *
   * @param {File} file - Archivo de imagen a subir
   * @returns {Promise<void>} Promise que se resuelve cuando se completa la actualización
   */
  const updateProfilePicture = async (file: File): Promise<void> => {
    if (!user?.userId) {
      throw new Error('Usuario no autenticado');
    }

    setIsLoading(true);

    try {
      // Generar un ID único para el archivo
      const uniqueId = uuidv4();
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${uniqueId}.${fileExtension}`;

      // 1. Subir la imagen a S3 en una carpeta pública con el nombre único
      const result = await uploadData({
        path: `profile-pictures/${user.userId}/${uniqueFileName}`,
        data: file,
        options: {
          contentType: file.type,
          bucket: 'fasttifyAssets',
        },
      }).result;

      // 2. Construir la URL pública usando la utilidad de CDN
      const publicUrl = getCdnUrlForKey(result.path);

      // 3. Actualizar el atributo 'picture' del usuario con la URL pública
      await updateUserAttributes({
        userAttributes: {
          picture: publicUrl,
        },
      });

      // 4. Refrescar los datos del usuario para mostrar la nueva imagen
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProfilePicture,
    isLoading,
  };
}
