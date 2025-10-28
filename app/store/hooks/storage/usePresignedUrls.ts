import { useCallback } from 'react';
import { post } from 'aws-amplify/api';
import useStoreDataStore from '@/context/core/storeDataStore';
import { generateFallbackId } from '@/app/store/components/images-selector/utils/s3-utils';
import type { S3Image, BatchUploadResult } from '@/app/store/components/images-selector/types/s3-types';

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

type FileProgressCallback = (index: number, percent: number, loadedBytes: number, totalBytes: number) => void;
type OverallProgressCallback = (percent: number) => void;

interface UploadProgressOptions {
  onFileProgress?: FileProgressCallback;
  onOverallProgress?: OverallProgressCallback;
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
    async (
      file: File,
      presignedUrlData: PresignedUrlResponse,
      onProgress?: (loaded: number, total: number) => void
    ): Promise<S3Image> => {
      // Subir archivo directo a S3 con progreso usando XHR para onprogress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presignedUrlData.presignedUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);

        // Emitir inicio 0%
        if (onProgress) onProgress(0, file.size || 0);

        xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
          if (!onProgress) return;
          const total = event.lengthComputable && event.total > 0 ? event.total : file.size || 0;
          const loaded = event.loaded;
          onProgress(loaded, total);
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`S3 upload failed with status ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Network error during S3 upload'));
        xhr.onabort = () => reject(new Error('S3 upload aborted'));

        xhr.send(file);
      });

      // Emitir final 100%
      if (onProgress) onProgress(file.size || 0, file.size || 0);

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
    async (files: File[], options: UploadProgressOptions = {}): Promise<BatchUploadResult> => {
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
        const perFileLoaded = new Array<number>(files.length).fill(0);
        const perFileTotal = files.map((f) => f.size || 0);

        const emitOverall = () => {
          if (!options.onOverallProgress) return;
          const totalLoaded = perFileLoaded.reduce((a, b) => a + b, 0);
          const totalBytes = perFileTotal.reduce((a, b) => a + b, 0) || 1;
          const percent = Math.min(100, Math.round((totalLoaded / totalBytes) * 100));
          options.onOverallProgress(percent);
        };

        // Procesar cada archivo con su URL correspondiente
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const presignedData = batchUrls.urls[i];

          if (presignedData) {
            try {
              const image = await uploadFileWithPresignedUrl(file, presignedData, (loaded, total) => {
                perFileLoaded[i] = loaded;
                perFileTotal[i] = total || file.size || 0;
                const safeTotal = perFileTotal[i] || file.size || 1;
                const percent = Math.min(100, Math.round((loaded / safeTotal) * 100));
                if (options.onFileProgress) options.onFileProgress(i, percent, loaded, total || file.size || 0);
                emitOverall();
              });
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
