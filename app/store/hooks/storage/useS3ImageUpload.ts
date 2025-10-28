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
import { validateFile } from '@/lib/utils/validation-utils';
import { usePresignedUrls } from '@/app/store/hooks/storage/usePresignedUrls';

// Configuración para validación de archivos
const MAX_FILE_SIZE_MB = 10; // Aumentado a 10MB por imagen individual
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Threshold para decidir cuándo usar Presigned URLs
// Usar presigned URLs para archivos > 5MB (más seguro para API Gateway 10MB limit)
const PRESIGNED_URL_THRESHOLD = 5 * 1024 * 1024; // 5MB
const PRESIGNED_URL_COUNT_THRESHOLD = 10; // Más de 10 archivos

export function useS3ImageUpload() {
  const { storeId } = useStoreDataStore();
  const { uploadImagesWithPresignedUrls } = usePresignedUrls();

  // Función para validar un archivo individual
  const validateFileCallback = useCallback((file: File): { isValid: boolean; error?: string } => {
    return validateFile(file, {
      maxSizeBytes: MAX_FILE_SIZE_BYTES,
      isImage: true,
    });
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
   * Usa Presigned URLs automáticamente cuando sea necesario
   */
  const uploadImages = useCallback(
    async (files: File[]): Promise<BatchUploadResult | null> => {
      if (!storeId || files.length === 0) return null;

      try {
        // Validar archivos primero
        const validationResults = files.map((file) => ({
          file,
          validation: validateFileCallback(file),
        }));

        const validFiles = validationResults.filter((result) => result.validation.isValid).map((result) => result.file);

        // Decidir estrategia: ¿usar Presigned URLs?
        const shouldUsePresignedUrls =
          files.length > PRESIGNED_URL_COUNT_THRESHOLD || // Más de 10 archivos
          files.some((file) => file.size > PRESIGNED_URL_THRESHOLD); // Algún archivo > 5MB

        if (shouldUsePresignedUrls) {
          console.log(`Using Presigned URLs for ${files.length} files`);
          return await uploadImagesWithPresignedUrls(validFiles);
        }

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
    [storeId, validateFileCallback, processImageChunk, uploadImagesWithPresignedUrls]
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
