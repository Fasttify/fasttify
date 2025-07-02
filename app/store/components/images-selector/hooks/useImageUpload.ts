import { useState, useCallback } from 'react';
import type { S3Image } from '@/app/store/components/images-selector/types/s3-types';
import { useToast } from '@/app/store/context/ToastContext';

export interface BatchUploadResult {
  successfulImages: S3Image[];
  failedUploads: { filename: string; error: string }[];
  totalProcessed: number;
}

interface UseImageUploadProps {
  uploadImages: (files: File[]) => Promise<BatchUploadResult | null>;
  onImagesUploaded?: (result: BatchUploadResult) => void;
  onUploadError?: (error: string) => void;
}

export function useImageUpload({ uploadImages, onImagesUploaded, onUploadError }: UseImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    total: number;
    completed: number;
    failed: number;
  } | null>(null);

  const { showToast } = useToast();

  const handleDrop = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));

      if (imageFiles.length === 0) {
        const errorMessage = 'No se encontraron archivos de imagen válidos';
        showToast(errorMessage, true);
        onUploadError?.(errorMessage);
        return null;
      }

      // Reducir límite a 25 archivos para evitar problemas de payload
      if (imageFiles.length > 25) {
        const errorMessage = `Solo puedes subir hasta 25 imágenes a la vez. Has seleccionado ${imageFiles.length} archivos.`;
        showToast(errorMessage, true);
        onUploadError?.(errorMessage);
        return null;
      }

      // Validar tamaños de archivo para evitar error 413
      const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
      const oversizedFiles = imageFiles.filter((file) => file.size > MAX_FILE_SIZE);

      if (oversizedFiles.length > 0) {
        const errorMessage = `${oversizedFiles.length} archivo(s) superan el límite de 8MB. Tamaño máximo permitido: 8MB.`;
        showToast(errorMessage, true);
        onUploadError?.(errorMessage);
        return null;
      }

      setIsUploading(true);
      setUploadProgress({
        total: imageFiles.length,
        completed: 0,
        failed: 0,
      });

      try {
        console.log(`Starting upload of ${imageFiles.length} images`);

        const result = await uploadImages(imageFiles);

        if (result) {
          const { successfulImages, failedUploads, totalProcessed } = result;

          setUploadProgress({
            total: totalProcessed,
            completed: successfulImages.length,
            failed: failedUploads.length,
          });

          // Notificar resultados con toasts
          if (successfulImages.length > 0) {
            console.log(`Successfully uploaded ${successfulImages.length} images`);
            showToast(`${successfulImages.length} imagen(es) subida(s) correctamente`, false);
            onImagesUploaded?.(result);
          }

          if (failedUploads.length > 0) {
            console.warn(`Failed to upload ${failedUploads.length} images:`, failedUploads);
            const errorMessage = `${failedUploads.length} imagen(es) no pudieron subirse`;
            showToast(errorMessage, true);
            onUploadError?.(errorMessage);
          }

          // Mostrar información sobre chunking si es relevante
          if (imageFiles.length > 10) {
            showToast(`Procesadas en lotes pequeños para optimizar la carga`, false);
          }

          return result;
        } else {
          const errorMessage = 'Error al procesar la carga de imágenes';
          showToast(errorMessage, true);
          onUploadError?.(errorMessage);
          return null;
        }
      } catch (error) {
        console.error('Error in upload:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir imágenes';
        showToast(errorMessage, true);
        onUploadError?.(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
        // Limpiar el progreso después de un tiempo
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
