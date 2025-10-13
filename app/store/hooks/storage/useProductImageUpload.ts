import { getCdnUrlForKey } from '@/utils/client';
import { uploadData } from 'aws-amplify/storage';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedImage {
  url: string;
  alt: string;
}

export function useProductImageUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadProductImage = async (file: File, storeId: string): Promise<UploadedImage | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Generar un UUID único para el archivo
      const uniqueFileName = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`;

      // Subir la imagen al bucket correcto
      const result = await uploadData({
        path: `products/${storeId}/${uniqueFileName}`,
        options: {
          bucket: 'fasttifyAssets',
          contentType: file.type,
        },
        data: file,
      }).result;

      // Construir la URL pública usando la utilidad CDN
      const publicUrl = getCdnUrlForKey(result.path);

      return {
        url: publicUrl,
        alt: '',
      };
    } catch (error) {
      console.error('Error uploading product image:', error);
      setError(error instanceof Error ? error : new Error('Unknown error uploading product image'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadMultipleProductImages = async (files: File[], storeId: string): Promise<UploadedImage[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Subir todas las imágenes en paralelo
      const uploadPromises = files.map((file) => uploadProductImage(file, storeId));
      const results = await Promise.all(uploadPromises);

      // Filtrar las imágenes que se subieron correctamente
      return results.filter((result): result is UploadedImage => result !== null);
    } catch (error) {
      console.error('Error uploading multiple product images:', error);
      setError(error instanceof Error ? error : new Error('Unknown error uploading multiple product images'));
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadProductImage,
    uploadMultipleProductImages,
    isLoading,
    error,
  };
}
