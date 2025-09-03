import { useState, useEffect } from 'react';
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

export function useSecureUrl({ baseUrl, type = 'asset', enabled = true }: UseSecureUrlOptions): UseSecureUrlReturn {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUrl = async () => {
    if (!enabled || !baseUrl) {
      setUrl('');
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Next.js maneja el cache automáticamente
      const secureUrl = await getSecureImageUrl(baseUrl);
      setUrl(secureUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting secure URL');
      setUrl(baseUrl); // Fallback a la URL original
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    // Forzar refresh llamando de nuevo (Next.js cache se encarga del resto)
    await fetchUrl();
  };

  useEffect(() => {
    fetchUrl();
  }, [baseUrl, enabled, type]);

  return {
    url,
    isLoading,
    error,
    refetch,
  };
}
