import { useState, useEffect, useCallback } from 'react';
import { getSecureImageUrl } from '@/lib/actions/secure-image';

interface UseSecureUrlOptions {
  baseUrl: string;
  type?: 'template' | 'profile-image' | 'asset' | 'store-logo' | 'product' | 'base-template';
  enabled?: boolean;
}

interface UseSecureUrlReturn {
  url: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache global para URLs seguras
const urlCache = new Map<string, string>();

export function useSecureUrl({ baseUrl, type = 'asset', enabled = true }: UseSecureUrlOptions): UseSecureUrlReturn {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUrl = useCallback(async () => {
    if (!enabled || !baseUrl) {
      setUrl('');
      setIsLoading(false);
      setError(null);
      return;
    }

    // Verificar cache global primero
    const cacheKey = `${baseUrl}-${type}`;
    if (urlCache.has(cacheKey)) {
      const cachedUrl = urlCache.get(cacheKey);
      if (cachedUrl) {
        setUrl(cachedUrl);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Next.js maneja el cache automáticamente
      const secureUrl = await getSecureImageUrl(baseUrl);

      // Guardar en cache global
      urlCache.set(cacheKey, secureUrl);
      setUrl(secureUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting secure URL');
      setUrl(baseUrl); // Fallback a la URL original
    } finally {
      setIsLoading(false);
    }
  }, [enabled, baseUrl, type]);

  const refetch = async () => {
    // Limpiar cache y forzar refresh
    const cacheKey = `${baseUrl}-${type}`;
    urlCache.delete(cacheKey);
    await fetchUrl();
  };

  useEffect(() => {
    // Verificar cache primero
    const cacheKey = `${baseUrl}-${type}`;
    if (enabled && baseUrl && urlCache.has(cacheKey)) {
      const cachedUrl = urlCache.get(cacheKey);
      if (cachedUrl) {
        setUrl(cachedUrl);
        return;
      }
    }

    // Solo hacer fetch si no está en cache
    if (enabled && baseUrl && !urlCache.has(cacheKey)) {
      fetchUrl();
    }
  }, [enabled, baseUrl, type, fetchUrl]);

  return {
    url,
    isLoading,
    error,
    refetch,
  };
}
