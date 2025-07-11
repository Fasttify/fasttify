import { useCallback } from 'react';
import { post } from 'aws-amplify/api';
import useStoreDataStore from '@/context/core/storeDataStore';
import type {
  BatchUploadResult,
  S3BatchResponse,
  FileForUpload,
  S3Image,
} from '@/app/store/components/images-selector/types/s3-types';
import { UPLOAD_CHUNK_SIZE } from '@/app/store/components/images-selector/types/s3-types';
import { chunkArray, fileToBase64, generateFallbackId } from '@/app/store/components/images-selector/utils/s3-utils';

// Configuración para validación de archivos
const MAX_FILE_SIZE_MB = 8; // Máximo 8MB por imagen individual
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function useS3ImageUpload() {
  const { storeId } = useStoreDataStore();

  // Función para validar un archivo individual
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'El archivo no es una imagen válida' };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `Archivo demasiado grande (máximo ${MAX_FILE_SIZE_MB}MB, actual: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      };
    }

    return { isValid: true };
  }, []);

  // Función auxiliar para procesar un chunk de imágenes
  const processImageChunk = useCallback(
    async (
      files: FileForUpload[]
    ): Promise<{
      successfulImages: S3Image[];
      failedUploads: { filename: string; error: string }[];
    }> => {
      if (!storeId) {
        return {
          successfulImages: [],
          failedUploads: files.map((file) => ({
            filename: file.filename,
            error: 'Store ID not found',
          })),
        };
      }

      try {
        const restOperation = post({
          apiName: 'StoreImagesApi',
          path: 'store-images',
          options: {
            body: {
              action: 'batchUpload',
              storeId,
              files,
            } as any,
          },
        });

        const { body } = await restOperation.response;
        const response = (await body.json()) as S3BatchResponse;

        const successfulImages = (response.images || []).map((img) => ({
          ...img,
          lastModified: img.lastModified ? new Date(img.lastModified) : new Date(),
          id: img.id || generateFallbackId(img.key, img.filename),
        }));

        return {
          successfulImages,
          failedUploads: response.failed || [],
        };
      } catch (error) {
        console.error('Error processing image chunk:', error);
        return {
          successfulImages: [],
          failedUploads: files.map((file) => ({ filename: file.filename, error: 'Upload failed' })),
        };
      }
    },
    [storeId]
  );

  /**
   * Función optimizada para subir múltiples imágenes usando batch upload con chunking
   * Incluye validación de tamaño para evitar error 413
   */
  const uploadImages = useCallback(
    async (files: File[]): Promise<BatchUploadResult | null> => {
      if (!storeId || files.length === 0) return null;

      try {
        // Validar archivos primero
        const validationResults = files.map((file) => ({
          file,
          validation: validateFile(file),
        }));

        const validFiles = validationResults.filter((result) => result.validation.isValid).map((result) => result.file);

        const invalidFiles = validationResults
          .filter((result) => !result.validation.isValid)
          .map((result) => ({
            filename: result.file.name,
            error: result.validation.error || 'Validation failed',
          }));

        if (validFiles.length === 0) {
          return {
            successfulImages: [],
            failedUploads: invalidFiles,
            totalProcessed: files.length,
          };
        }

        // Convertir archivos válidos a base64 en paralelo
        const fileConversions = await Promise.allSettled(
          validFiles.map(
            async (file): Promise<FileForUpload> => ({
              filename: file.name,
              contentType: file.type,
              fileContent: await fileToBase64(file),
            })
          )
        );

        // Filtrar archivos que se convirtieron exitosamente
        const processedFiles = fileConversions
          .filter((result): result is PromiseFulfilledResult<FileForUpload> => result.status === 'fulfilled')
          .map((result) => result.value);

        const conversionErrors = fileConversions
          .map((result, index) =>
            result.status === 'rejected'
              ? {
                  filename: validFiles[index].name,
                  error: result.reason?.message || 'Conversion failed',
                }
              : null
          )
          .filter(Boolean) as { filename: string; error: string }[];

        const allInitialErrors = [...invalidFiles, ...conversionErrors];

        if (processedFiles.length === 0) {
          return {
            successfulImages: [],
            failedUploads: allInitialErrors,
            totalProcessed: files.length,
          };
        }

        // Dividir en chunks para evitar límite de API Gateway
        const chunks = chunkArray(processedFiles, UPLOAD_CHUNK_SIZE);

        // Procesar chunks secuencialmente para evitar sobrecarga
        let allSuccessfulImages: S3Image[] = [];
        let allFailedUploads: { filename: string; error: string }[] = [...allInitialErrors];

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const chunkResult = await processImageChunk(chunk);

          allSuccessfulImages = [...allSuccessfulImages, ...chunkResult.successfulImages];
          allFailedUploads = [...allFailedUploads, ...chunkResult.failedUploads];

          // Pequeña pausa entre chunks para evitar rate limiting
          if (i < chunks.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        return {
          successfulImages: allSuccessfulImages,
          failedUploads: allFailedUploads,
          totalProcessed: files.length,
        };
      } catch (err) {
        console.error('Error in batch upload:', err);
        return {
          successfulImages: [],
          failedUploads: files.map((file) => ({ filename: file.name, error: 'Upload failed' })),
          totalProcessed: files.length,
        };
      }
    },
    [storeId, validateFile, processImageChunk]
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
