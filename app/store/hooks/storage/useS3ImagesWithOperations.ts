import { useCallback } from 'react';
import { useS3Images } from '@/app/store/hooks/storage/useS3Images';
import { useS3ImageUpload } from '@/app/store/hooks/storage/useS3ImageUpload';
import { useS3ImageDelete } from '@/app/store/hooks/storage/useS3ImageDelete';
import type {
  S3Image,
  BatchUploadResult,
  BatchDeleteResult,
} from '@/app/store/components/images-selector/types/s3-types';

interface UseS3ImagesWithOperationsOptions {
  limit?: number;
  prefix?: string;
}

/**
 * Hook compuesto que integra las operaciones de listado, upload y delete de imágenes S3
 * Maneja automáticamente la actualización del estado después de las operaciones
 */
export function useS3ImagesWithOperations(options: UseS3ImagesWithOperationsOptions = {}) {
  // Hook principal para listado de imágenes
  const {
    images,
    loading,
    error,
    fetchMoreImages,
    loadingMore,
    nextContinuationToken,
    checkAndLoadMoreIfNeeded,
    updateImages,
  } = useS3Images(options);

  // Hooks especializados para operaciones
  const { uploadImages: uploadImagesBase, validateFile } = useS3ImageUpload();
  const { deleteImages: deleteImagesBase } = useS3ImageDelete();

  /**
   * Sube imágenes y actualiza el estado automáticamente
   */
  const uploadImages = useCallback(
    async (files: File[]): Promise<BatchUploadResult | null> => {
      const result = await uploadImagesBase(files);

      if (result && result.successfulImages.length > 0) {
        // Agregar las nuevas imágenes al principio de la lista
        updateImages((prev) => [...result.successfulImages, ...prev]);
      }

      return result;
    },
    [uploadImagesBase, updateImages]
  );

  /**
   * Elimina imágenes y actualiza el estado automáticamente
   */
  const deleteImages = useCallback(
    async (keys: string[]): Promise<BatchDeleteResult | null> => {
      const result = await deleteImagesBase(keys);

      if (result && result.successCount > 0) {
        // Determinar qué imágenes se eliminaron exitosamente
        const failedKeys = new Set(result.failedDeletes.map((f) => f.key));
        const successfullyDeletedKeys = keys.filter((key) => !failedKeys.has(key));

        updateImages((prev) => {
          const newImages = prev.filter((img) => !successfullyDeletedKeys.includes(img.key));

          // Si no quedan imágenes pero hay más disponibles, cargar automáticamente
          if (newImages.length === 0 && nextContinuationToken) {
            // Usar setTimeout para evitar conflictos con el estado actual
            setTimeout(() => {
              checkAndLoadMoreIfNeeded();
            }, 100);
          }

          return newImages;
        });
      }

      return result;
    },
    [deleteImagesBase, updateImages, nextContinuationToken, checkAndLoadMoreIfNeeded]
  );

  /**
   * Funciones legacy para compatibilidad hacia atrás
   */
  const uploadImage = useCallback(
    async (files: File[]): Promise<S3Image[] | null> => {
      const result = await uploadImages(files);
      return result ? result.successfulImages : null;
    },
    [uploadImages]
  );

  const deleteImage = useCallback(
    async (key: string): Promise<boolean> => {
      const result = await deleteImages([key]);
      return result ? result.successCount > 0 : false;
    },
    [deleteImages]
  );

  return {
    // Estado de las imágenes
    images,
    loading,
    error,

    // Operaciones de paginación
    fetchMoreImages,
    loadingMore,
    nextContinuationToken,
    checkAndLoadMoreIfNeeded,

    // Operaciones principales
    uploadImages,
    deleteImages,

    // Funciones legacy
    uploadImage,
    deleteImage,

    // Utilidades
    validateFile,
    updateImages,
  };
}
