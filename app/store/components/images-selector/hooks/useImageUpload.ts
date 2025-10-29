import { useState, useCallback, useRef } from 'react';
import { isValidMediaFile } from '@/lib/utils/validation-utils';
import type { S3Image } from '@/app/store/components/images-selector/types/s3-types';
import { useToast } from '@/app/store/context/ToastContext';

export interface BatchUploadResult {
  successfulImages: S3Image[];
  failedUploads: { filename: string; error: string }[];
  totalProcessed: number;
}

interface UploadProgressOptionsUI {
  onStart?: (totalFiles: number) => void;
  onProgress?: (overallPercent: number, perFile: number[]) => void;
  onComplete?: () => void;
}

interface UseImageUploadProps {
  uploadImages: (files: File[], options?: any) => Promise<BatchUploadResult | null>;
  onImagesUploaded?: (result: BatchUploadResult) => void;
  onUploadError?: (error: string) => void;
}

export function useImageUpload({ uploadImages, onImagesUploaded, onUploadError }: UseImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    total: number;
    completed: number;
    failed: number;
    overallPercent: number;
    perFilePercent: number[];
  } | null>(null);
  const completedSetRef = useRef<Set<number>>(new Set());

  const { showToast } = useToast();

  const handleDrop = useCallback(
    async (files: File[], _options?: UploadProgressOptionsUI) => {
      const isValidFile = (file: File) => isValidMediaFile(file);

      const mediaFiles = files.filter(isValidFile);

      if (mediaFiles.length === 0) {
        const errorMessage =
          'No se encontraron archivos multimedia válidos. Tipos permitidos: imágenes, videos y audio.';
        showToast(errorMessage, true);
        onUploadError?.(errorMessage);
        return null;
      }

      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB para archivos multimedia
      const oversizedFiles = mediaFiles.filter((file) => file.size > MAX_FILE_SIZE);

      if (oversizedFiles.length > 0) {
        const errorMessage = `${oversizedFiles.length} archivo(s) superan el límite de 50MB. Tamaño máximo permitido: 50MB.`;
        showToast(errorMessage, true);
        onUploadError?.(errorMessage);
        return null;
      }

      setIsUploading(true);
      const perFilePercentInit = new Array<number>(mediaFiles.length).fill(0);
      completedSetRef.current = new Set();
      setUploadProgress({
        total: mediaFiles.length,
        completed: 0,
        failed: 0,
        overallPercent: 0,
        perFilePercent: perFilePercentInit,
      });

      try {
        const result = await uploadImages(mediaFiles, {
          onFileProgress: (index: number, percent: number) => {
            setUploadProgress((prev) =>
              prev
                ? {
                    ...prev,
                    perFilePercent: prev.perFilePercent.map((p, i) => (i === index ? percent : p)),
                  }
                : prev
            );
            if (percent >= 100 && !completedSetRef.current.has(index)) {
              completedSetRef.current.add(index);
              setUploadProgress((prev) =>
                prev
                  ? {
                      ...prev,
                      completed: Math.min(prev.total, prev.completed + 1),
                    }
                  : prev
              );
            }
          },
          onOverallProgress: (percent: number) => {
            setUploadProgress((prev) => (prev ? { ...prev, overallPercent: percent } : prev));
          },
        });

        if (result) {
          const { successfulImages, failedUploads, totalProcessed } = result;

          setUploadProgress((prev) =>
            prev
              ? {
                  ...prev,
                  total: totalProcessed,
                  completed: successfulImages.length,
                  failed: failedUploads.length,
                }
              : prev
          );

          if (successfulImages.length > 0) {
            showToast(`${successfulImages.length} archivo(s) subido(s) correctamente`, false);
            onImagesUploaded?.(result);
          }

          if (failedUploads.length > 0) {
            const errorMessage = `${failedUploads.length} archivo(s) no pudieron subirse`;
            showToast(errorMessage, true);
            onUploadError?.(errorMessage);
          }

          return result;
        } else {
          const errorMessage = 'Error al procesar la carga de archivos';
          showToast(errorMessage, true);
          onUploadError?.(errorMessage);
          return null;
        }
      } catch (error) {
        console.error('Error in upload:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir archivos';
        showToast(errorMessage, true);
        onUploadError?.(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(null), 3000);
      }
    },
    [uploadImages, onImagesUploaded, onUploadError, showToast]
  );

  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(null);
  }, []);

  return {
    isUploading,
    uploadProgress,
    handleDrop,
    resetUploadState,
  };
}
