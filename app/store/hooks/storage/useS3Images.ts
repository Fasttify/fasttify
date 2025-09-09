import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { post } from 'aws-amplify/api';
import useStoreDataStore from '@/context/core/storeDataStore';

// Re-exportar tipos y hooks relacionados
export type { S3Image } from '@/app/store/components/images-selector/types/s3-types';
export type { BatchUploadResult, BatchDeleteResult } from '@/app/store/components/images-selector/types/s3-types';
export { useS3ImageUpload } from '@/app/store/hooks/storage/useS3ImageUpload';
export { useS3ImageDelete } from '@/app/store/hooks/storage/useS3ImageDelete';

interface UseS3ImagesOptions {
  limit?: number;
  prefix?: string;
}

// Definir el tipo de la respuesta esperada del API
interface S3ImagesResponse {
  images?: import('@/app/store/components/images-selector/types/s3-types').S3Image[];
  success?: boolean;
  image?: import('@/app/store/components/images-selector/types/s3-types').S3Image;
  nextContinuationToken?: string;
}

export function useS3Images(options: UseS3ImagesOptions = {}) {
  const [images, setImages] = useState<import('@/app/store/components/images-selector/types/s3-types').S3Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { storeId } = useStoreDataStore();
  const [nextContinuationToken, setNextContinuationToken] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);

  // Ref para evitar peticiones duplicadas
  const isFetching = useRef(false);
  const lastFetchParams = useRef<string>('');

  // Memoizar las opciones para evitar re-renders innecesarios
  const memoizedOptions = useMemo(
    () => ({
      limit: options.limit || 18,
      prefix: options.prefix || '',
    }),
    [options.limit, options.prefix]
  );

  const fetchImages = useCallback(
    async (token?: string) => {
      // Crear una clave única para esta petición
      const fetchKey = `${storeId}-${memoizedOptions.limit}-${memoizedOptions.prefix}-${token || 'initial'}`;

      // Si ya hay una petición en curso con los mismos parámetros, no hacer otra
      if (isFetching.current && lastFetchParams.current === fetchKey) {
        return;
      }

      if (!storeId || memoizedOptions.limit <= 0) {
        setLoading(false);
        setImages([]);
        setNextContinuationToken(undefined);
        return;
      }

      // Marcar que estamos haciendo una petición
      isFetching.current = true;
      lastFetchParams.current = fetchKey;

      if (!token) {
        setLoading(true);
        setImages([]);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const restOperation = post({
          apiName: 'StoreImagesApi',
          path: 'store-images',
          options: {
            body: {
              action: 'list',
              storeId,
              limit: memoizedOptions.limit,
              prefix: memoizedOptions.prefix,
              continuationToken: token,
            } as any,
          },
        });

        const { body } = await restOperation.response;
        const response = (await body.json()) as S3ImagesResponse;

        if (!response.images) {
          if (!token) {
            setImages([]);
          }
          setNextContinuationToken(undefined);
          return;
        }

        const processedImages = response.images.map((img) => ({
          ...img,
          lastModified: img.lastModified ? new Date(img.lastModified) : undefined,
          id: img.id || generateFallbackId(img.key, img.filename),
        }));

        setImages((prev) => (token ? [...prev, ...processedImages] : processedImages));
        setNextContinuationToken(response.nextContinuationToken);
      } catch (err) {
        console.error(token ? 'Error fetching more S3 images:' : 'Error fetching S3 images:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setNextContinuationToken(undefined);
      } finally {
        // Resetear el flag de petición
        isFetching.current = false;

        if (!token) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [storeId, memoizedOptions.limit, memoizedOptions.prefix]
  );

  // useEffect optimizado - solo se ejecuta cuando es necesario
  useEffect(() => {
    if (storeId && memoizedOptions.limit > 0) {
      fetchImages();
    }
  }, [storeId, memoizedOptions.limit, memoizedOptions.prefix, fetchImages]);

  const fetchMoreImages = useCallback(() => {
    if (nextContinuationToken && !loadingMore && !loading) {
      fetchImages(nextContinuationToken);
    }
  }, [nextContinuationToken, loadingMore, loading, fetchImages]);

  // Función para verificar si necesitamos cargar más imágenes automáticamente
  const checkAndLoadMoreIfNeeded = useCallback(() => {
    // Si no hay imágenes pero hay nextToken disponible, cargar automáticamente
    if (images.length === 0 && nextContinuationToken && !loadingMore && !loading) {
      fetchMoreImages();
    }
  }, [images.length, nextContinuationToken, loadingMore, loading, fetchMoreImages]);

  // Función para actualizar imágenes después de operaciones exitosas
  const updateImages = useCallback(
    (
      updater: (
        prev: import('@/app/store/components/images-selector/types/s3-types').S3Image[]
      ) => import('@/app/store/components/images-selector/types/s3-types').S3Image[]
    ) => {
      setImages(updater);
    },
    []
  );

  return {
    images,
    loading,
    error,
    fetchMoreImages,
    loadingMore,
    nextContinuationToken,
    checkAndLoadMoreIfNeeded,
    updateImages,
  };
}

/**
 * Genera un ID único para compatibilidad hacia atrás cuando las imágenes
 * existentes no tienen el campo id
 */
function generateFallbackId(key: string, _filename: string): string {
  // Crear hash simple del key
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Extraer timestamp del key si está disponible
  const timestampMatch = key.match(/\/(\d+)-/);
  const timestamp = timestampMatch ? timestampMatch[1] : Date.now().toString();

  return `fallback_${Math.abs(hash)}_${timestamp}`;
}
