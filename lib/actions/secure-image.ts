'use server';

import { generateSignedUrl } from '@/utils/server/cloudfront-signed-urls';
import { unstable_cache } from 'next/cache';
import { isExternalUrl } from '@/lib/utils/external-domains';

// Función base sin cache
async function _getSecureImageUrl(imageUrl: string): Promise<string> {
  if (!imageUrl) return imageUrl;

  // En desarrollo, devolver URL directa
  if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
    return imageUrl;
  }

  // Verificar si es una URL de CloudFront sin firmar (de la Lambda storeImages)
  const isUnsignedCloudFrontUrl = (url: string): boolean => {
    if (!url.includes('://')) return false;

    try {
      const urlObj = new URL(url);
      // Detectar URLs de CloudFront que no tienen parámetros de firma
      const isCloudFront = urlObj.hostname.includes('cloudfront.net') || urlObj.hostname.includes('amazonaws.com');
      const hasSignature =
        urlObj.searchParams.has('Expires') ||
        urlObj.searchParams.has('Signature') ||
        urlObj.searchParams.has('Key-Pair-Id');

      return isCloudFront && !hasSignature;
    } catch {
      return false;
    }
  };

  // Si es una URL externa, devolverla tal como está
  if (isExternalUrl(imageUrl)) {
    return imageUrl;
  }

  // Si es una URL de CloudFront sin firmar (de la Lambda storeImages), firmarla
  if (isUnsignedCloudFrontUrl(imageUrl)) {
    try {
      const urlObj = new URL(imageUrl);
      const s3Path = urlObj.pathname.substring(1); // Remover el '/' inicial
      return generateSignedUrl(s3Path, 30 * 24 * 60); // 30 días
    } catch {
      return imageUrl; // Fallback a la URL original
    }
  }

  // Extraer ruta del S3 para URLs internas (rutas directas)
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

  // Generar URL firmada para URLs internas
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
