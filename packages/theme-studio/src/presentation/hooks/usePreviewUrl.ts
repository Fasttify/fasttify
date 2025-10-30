/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useMemo } from 'react';

interface UsePreviewUrlParams {
  domain: string | null;
}

interface UsePreviewUrlResult {
  previewUrl: string | null;
}

/**
 * Hook para construir la URL del preview según el entorno
 * En desarrollo usa /preview?domain=... para evitar cross-origin
 * En producción usa el dominio completo como hostname
 */
export function usePreviewUrl({ domain }: UsePreviewUrlParams): UsePreviewUrlResult {
  const previewUrl = useMemo(() => {
    if (!domain) return null;

    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';

    if (isLocalhost) {
      // Pasar el dominio como query parameter para evitar problemas con puntos en path
      const encodedDomain = encodeURIComponent(domain);
      return `${currentOrigin}/preview?domain=${encodedDomain}&path=/`;
    }

    // En producción, usar el dominio completo como hostname
    return `${protocol}//${domain}?path=/`;
  }, [domain]);

  return { previewUrl };
}
