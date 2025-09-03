'use server';

import { generateSignedUrl } from '@/utils/server/cloudfront-signed-urls';
import { unstable_cache } from 'next/cache';

// Función base sin cache
async function _getSecureImageUrl(imageUrl: string): Promise<string> {
  if (!imageUrl) return imageUrl;

  // En desarrollo, devolver URL directa
  if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
    return imageUrl;
  }

  // Extraer ruta del S3
  const extractS3Path = (url: string): string => {
    if (!url.includes('://')) return url;
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1);
    } catch {
      return url;
    }
  };

  const s3Path = extractS3Path(imageUrl);

  // Generar URL firmada
  return generateSignedUrl(s3Path, 30 * 24 * 60); // 30 días
}

// Función con cache nativo de Next.js
export const getSecureImageUrl = unstable_cache(
  _getSecureImageUrl,
  ['secure-image-url'], // Cache key
  {
    revalidate: 24 * 60 * 60, // 24 horas
    tags: ['secure-urls'], // Para invalidar cache específico
  }
);
