import { useCallback } from 'react';
import useStoreDataStore from '@/context/core/storeDataStore';
import type { BatchUploadResult, S3Image } from '@/app/store/components/images-selector/types/s3-types';
import { validateFile } from '@/lib/utils/validation-utils';
import { usePresignedUrls } from '@/app/store/hooks/storage/usePresignedUrls';

interface UploadProgressOptions {
  onFileProgress?: (index: number, percent: number, loadedBytes: number, totalBytes: number) => void;
  onOverallProgress?: (percent: number) => void;
}

// Configuración para validación de archivos
const MAX_FILE_SIZE_MB = 50; // Aumentado a 50MB para archivos multimedia
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function useS3ImageUpload() {
  const { storeId } = useStoreDataStore();
  const { uploadImagesWithPresignedUrls } = usePresignedUrls();

  const validateFileCallback = useCallback((file: File): { isValid: boolean; error?: string } => {
    return validateFile(file, {
      maxSizeBytes: MAX_FILE_SIZE_BYTES,
      isMedia: true,
    });
  }, []);

  /**
   * Sube múltiples archivos multimedia usando siempre Presigned URLs.
   * Incluye validación de tamaño/tipo y conversión a base64 cuando aplique.
   */
  const uploadImages = useCallback(
    async (files: File[], options: UploadProgressOptions = {}): Promise<BatchUploadResult | null> => {
      if (!storeId || files.length === 0) return null;

      try {
        // Validar archivos primero
        const validationResults = files.map((file) => ({
          file,
          validation: validateFileCallback(file),
        }));

        const validFiles = validationResults.filter((result) => result.validation.isValid).map((result) => result.file);

        // Siempre usar Presigned URLs con callbacks de progreso
        const presignedResult = await uploadImagesWithPresignedUrls(validFiles, {
          onFileProgress: options.onFileProgress,
          onOverallProgress: options.onOverallProgress,
        });

        const invalidFiles = validationResults
          .filter((result) => !result.validation.isValid)
          .map((result) => ({
            filename: result.file.name,
            error: result.validation.error || 'Validation failed',
          }));

        if (!presignedResult) {
          return {
            successfulImages: [],
            failedUploads: invalidFiles,
            totalProcessed: files.length,
          };
        }

        return {
          successfulImages: presignedResult.successfulImages,
          failedUploads: [...invalidFiles, ...presignedResult.failedUploads],
          totalProcessed: files.length,
        };
      } catch (err) {
        console.error('Error in presigned upload:', err);
        return {
          successfulImages: [],
          failedUploads: files.map((file) => ({ filename: file.name, error: 'Upload failed' })),
          totalProcessed: files.length,
        };
      }
    },
    [storeId, validateFileCallback, uploadImagesWithPresignedUrls]
  );

  /**
   * Función legacy para compatibilidad hacia atrás
   * @deprecated Use uploadImages instead for better performance
   */
  const uploadImage = useCallback(
    async (files: File[]): Promise<S3Image[] | null> => {
      const result = await uploadImages(files);
      return result ? result.successfulImages : null;
    },
    [uploadImages]
  );

  return {
    uploadImages,
    uploadImage, // Legacy
    validateFile,
  };
}
