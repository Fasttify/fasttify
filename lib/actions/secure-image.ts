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

  // Verificar si es una URL externa (Google, Facebook, etc.)
  const isExternalUrl = (url: string): boolean => {
    if (!url.includes('://')) return false;

    try {
      const urlObj = new URL(url);
      const externalDomains = [
        'lh3.googleusercontent.com',
        'lh4.googleusercontent.com',
        'lh5.googleusercontent.com',
        'lh6.googleusercontent.com',
        'graph.facebook.com',
        'platform-lookaside.fbsbx.com',
        'scontent.xx.fbcdn.net',
        'scontent-a.xx.fbcdn.net',
        'scontent-b.xx.fbcdn.net',
        'scontent-c.xx.fbcdn.net',
        'scontent-d.xx.fbcdn.net',
        'scontent-e.xx.fbcdn.net',
        'scontent-f.xx.fbcdn.net',
        'scontent-g.xx.fbcdn.net',
        'scontent-h.xx.fbcdn.net',
        'scontent-i.xx.fbcdn.net',
        'scontent-j.xx.fbcdn.net',
        'scontent-k.xx.fbcdn.net',
        'scontent-l.xx.fbcdn.net',
        'scontent-m.xx.fbcdn.net',
        'scontent-n.xx.fbcdn.net',
        'scontent-o.xx.fbcdn.net',
        'scontent-p.xx.fbcdn.net',
        'scontent-q.xx.fbcdn.net',
        'scontent-r.xx.fbcdn.net',
        'scontent-s.xx.fbcdn.net',
        'scontent-t.xx.fbcdn.net',
        'scontent-u.xx.fbcdn.net',
        'scontent-v.xx.fbcdn.net',
        'scontent-w.xx.fbcdn.net',
        'scontent-x.xx.fbcdn.net',
        'scontent-y.xx.fbcdn.net',
        'scontent-z.xx.fbcdn.net',
        'avatars.githubusercontent.com',
        'github.com',
        'twitter.com',
        'pbs.twimg.com',
        'abs.twimg.com',
        'cdn.discordapp.com',
        'media.discordapp.net',
      ];

      return externalDomains.some((domain) => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  // Si es una URL externa, devolverla tal como está
  if (isExternalUrl(imageUrl)) {
    return imageUrl;
  }

  // Extraer ruta del S3 para URLs internas
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

  // Generar URL firmada solo para URLs internas
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
