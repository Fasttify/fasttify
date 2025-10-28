import { useCallback } from 'react';
import { post } from 'aws-amplify/api';
import useStoreDataStore from '@/context/core/storeDataStore';
import { generateFallbackId } from '@/app/store/components/images-selector/utils/s3-utils';
import type { S3Image } from '@/app/store/components/images-selector/types/s3-types';

interface PresignedUrlResponse {
  presignedUrl: string;
  s3Key: string;
  url: string;
  expiresAt: number;
}

interface BatchPresignedUrlsResponse {
  urls: PresignedUrlResponse[];
  success: boolean;
}

interface BatchUploadResult {
  successfulImages: S3Image[];
  failedUploads: { filename: string; error: string }[];
  totalProcessed: number;
}

export function usePresignedUrls() {
  const { storeId } = useStoreDataStore();

  /**
   * Genera múltiples presigned URLs en una sola request batch
   */
  const generateBatchPresignedUrls = useCallback(
    async (files: File[]): Promise<BatchPresignedUrlsResponse> => {
      if (!storeId) {
        throw new Error('Store ID not found');
      }

      const restOperation = post({
        apiName: 'StoreImagesApi',
        path: 'store-images',
        options: {
          body: {
            action: 'generateBatchPresignedUrls',
            storeId,
            filesInfo: files.map((file) => ({
              filename: file.name,
              contentType: file.type,
            })),
            expiresIn: 900, // 15 minutos
          } as any,
        },
      });

      const { body } = await restOperation.response;
      const jsonData: any = await body.json();
      const response: BatchPresignedUrlsResponse = {
        urls: Array.isArray(jsonData?.urls) ? jsonData.urls : [],
        success: Boolean(jsonData?.success),
      };
      return response;
    },
    [storeId]
  );

  /**
   * Sube un archivo usando presigned URL directo a S3
   */
  const uploadFileWithPresignedUrl = useCallback(
    async (file: File, presignedUrlData: PresignedUrlResponse): Promise<S3Image> => {
      // Subir archivo directo a S3
      await fetch(presignedUrlData.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // Retornar información de la imagen
      return {
        key: presignedUrlData.s3Key,
        url: presignedUrlData.url,
        filename: file.name,
        lastModified: new Date(),
        size: file.size,
        type: file.type,
        id: generateFallbackId(presignedUrlData.s3Key, file.name),
      };
    },
    []
  );

  /**
   * Sube múltiples archivos usando presigned URLs
   */
  const uploadImagesWithPresignedUrls = useCallback(
    async (files: File[]): Promise<BatchUploadResult> => {
      if (!storeId || files.length === 0) {
        return {
          successfulImages: [],
          failedUploads: [],
          totalProcessed: 0,
        };
      }

      try {
        // Generar todas las presigned URLs en una sola request batch
        const batchUrls = await generateBatchPresignedUrls(files);
        const successfulImages: S3Image[] = [];
        const failedUploads: { filename: string; error: string }[] = [];

        // Procesar cada archivo con su URL correspondiente
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const presignedData = batchUrls.urls[i];

          if (presignedData) {
            try {
              const image = await uploadFileWithPresignedUrl(file, presignedData);
              successfulImages.push(image);
            } catch (error) {
              failedUploads.push({
                filename: file.name,
                error: error instanceof Error ? error.message : 'Upload failed',
              });
            }
          } else {
            failedUploads.push({
              filename: file.name,
              error: 'No presigned URL received for this file',
            });
          }
        }

        return {
          successfulImages,
          failedUploads,
          totalProcessed: files.length,
        };
      } catch (error) {
        console.error('Error in presigned URL upload:', error);
        return {
          successfulImages: [],
          failedUploads: files.map((file) => ({
            filename: file.name,
            error: 'Upload failed',
          })),
          totalProcessed: files.length,
        };
      }
    },
    [storeId, generateBatchPresignedUrls, uploadFileWithPresignedUrl]
  );

  return {
    uploadImagesWithPresignedUrls,
    generateBatchPresignedUrls,
    uploadFileWithPresignedUrl,
  };
}
