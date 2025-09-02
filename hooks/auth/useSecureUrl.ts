import { useQuery } from '@tanstack/react-query';

interface UseSecureUrlOptions {
  baseUrl: string;
  type?: 'template' | 'profile-image' | 'asset' | 'store-logo' | 'product' | 'base-template';
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}

// Función para extraer la ruta del S3 de una URL completa
function extractS3Path(url: string): string {
  if (!url) return url;

  // Si ya es una ruta relativa (sin dominio), devolverla tal como está
  if (!url.includes('://')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    // Extraer la ruta después del dominio
    return urlObj.pathname.substring(1); // Remover el '/' inicial
  } catch (error) {
    console.error('Error parsing URL:', error);
    return url;
  }
}

// Función para obtener URL firmada
async function fetchSecureUrl(path: string): Promise<string> {
  if (!path) return path;

  // En desarrollo, usar URL directa
  if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
    return path;
  }
  // Extraer solo la ruta del S3
  const s3Path = extractS3Path(path);

  const response = await fetch(`/api/secure-url?path=${encodeURIComponent(s3Path)}`);

  if (!response.ok) {
    throw new Error(`Failed to get secure URL: ${response.status}`);
  }

  const { url } = await response.json();
  return url;
}

export function useSecureUrl({
  baseUrl,
  type = 'asset',
  enabled = true,
  staleTime,
  refetchInterval,
}: UseSecureUrlOptions) {
  // Determinar configuración según el tipo
  const getConfigForType = (type: string) => {
    switch (type) {
      case 'template':
      case 'base-template':
        return {
          staleTime: 6 * 24 * 60 * 60 * 1000, // 6 días
          refetchInterval: 6 * 24 * 60 * 60 * 1000,
        };
      case 'profile-image':
      case 'store-logo':
      case 'product':
      case 'asset':
      default:
        return {
          staleTime: 29 * 24 * 60 * 60 * 1000, // 29 días
          refetchInterval: 29 * 24 * 60 * 60 * 1000,
        };
    }
  };

  const typeConfig = getConfigForType(type);

  const {
    data: url,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['secure-url', baseUrl, type],
    queryFn: () => fetchSecureUrl(baseUrl),
    enabled: enabled && !!baseUrl,
    staleTime: staleTime || typeConfig.staleTime,
    refetchInterval: refetchInterval || typeConfig.refetchInterval,
    refetchIntervalInBackground: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    gcTime: 30 * 24 * 60 * 60 * 1000,
  });

  return {
    url: url || baseUrl,
    isLoading,
    error: error?.message || null,
    refetch,
    isFetching,
    isStale: isFetching && !isLoading,
  };
}
