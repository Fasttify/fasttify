import { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
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
  const { storeId } = useStoreDataStore();
  const queryClient = useQueryClient();

  // Memoizar las opciones para evitar re-renders innecesarios
  const memoizedOptions = useMemo(
    () => ({
      limit: options.limit || 18,
      prefix: options.prefix || '',
    }),
    [options.limit, options.prefix]
  );

  // Función para hacer la petición de imágenes
  const fetchImagesPage = useCallback(
    async ({ pageParam }: { pageParam?: string }) => {
      if (!storeId || memoizedOptions.limit <= 0) {
        return {
          images: [],
          nextContinuationToken: undefined,
        };
      }

      const restOperation = post({
        apiName: 'StoreImagesApi',
        path: 'store-images',
        options: {
          body: {
            action: 'list',
            storeId,
            limit: memoizedOptions.limit,
            prefix: memoizedOptions.prefix,
            continuationToken: pageParam,
          } as any,
        },
      });

      const { body } = await restOperation.response;
      const response = (await body.json()) as S3ImagesResponse;

      if (!response.images) {
        return {
          images: [],
          nextContinuationToken: undefined,
        };
      }

      const processedImages = response.images.map((img) => ({
        ...img,
        lastModified: img.lastModified ? new Date(img.lastModified) : undefined,
        id: img.id || generateFallbackId(img.key, img.filename),
      }));

      return {
        images: processedImages,
        nextContinuationToken: response.nextContinuationToken,
      };
    },
    [storeId, memoizedOptions.limit, memoizedOptions.prefix]
  );

  // Configurar la query infinita de React Query
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ['s3-images', storeId, memoizedOptions.limit, memoizedOptions.prefix],
    queryFn: fetchImagesPage,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextContinuationToken,
    enabled: !!storeId && memoizedOptions.limit > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Combinar todas las páginas de imágenes en una sola lista
  const images = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.images);
  }, [data]);

  // Función para cargar más imágenes
  const fetchMoreImages = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Función para verificar si necesitamos cargar más imágenes automáticamente
  const checkAndLoadMoreIfNeeded = useCallback(() => {
    // Si no hay imágenes pero hay más páginas disponibles, cargar automáticamente
    if (images.length === 0 && hasNextPage && !isFetchingNextPage) {
      fetchMoreImages();
    }
  }, [images.length, hasNextPage, isFetchingNextPage, fetchMoreImages]);

  // Función para actualizar imágenes después de operaciones exitosas
  const updateImages = useCallback(
    (
      updater: (
        prev: import('@/app/store/components/images-selector/types/s3-types').S3Image[]
      ) => import('@/app/store/components/images-selector/types/s3-types').S3Image[]
    ) => {
      // Actualizar el cache de React Query
      queryClient.setQueryData(
        ['s3-images', storeId, memoizedOptions.limit, memoizedOptions.prefix],
        (oldData: any) => {
          if (!oldData) return oldData;

          const allImages = oldData.pages.flatMap((page: any) => page.images);
          const updatedImages = updater(allImages);

          // Reorganizar las imágenes actualizadas en páginas
          const pageSize = memoizedOptions.limit;
          const newPages = [];

          for (let i = 0; i < updatedImages.length; i += pageSize) {
            newPages.push({
              images: updatedImages.slice(i, i + pageSize),
              nextContinuationToken: i + pageSize < updatedImages.length ? 'continue' : undefined,
            });
          }

          return {
            ...oldData,
            pages: newPages,
          };
        }
      );
    },
    [queryClient, storeId, memoizedOptions.limit, memoizedOptions.prefix]
  );

  // Función para invalidar y refrescar el cache
  const refreshImages = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['s3-images', storeId, memoizedOptions.limit, memoizedOptions.prefix],
    });
  }, [queryClient, storeId, memoizedOptions.limit, memoizedOptions.prefix]);

  return {
    images,
    loading: isLoading,
    error: error as Error | null,
    fetchMoreImages,
    loadingMore: isFetchingNextPage,
    nextContinuationToken: hasNextPage ? 'available' : undefined,
    checkAndLoadMoreIfNeeded,
    updateImages,
    refreshImages,
    refetch,
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
