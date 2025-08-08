/**
 * Utilidades para construir URLs de CDN o S3
 * Reglas:
 * - Producción (APP_ENV === 'production'): usar cdn.fasttify.com
 * - No-producción: usar bucket público de S3 con BUCKET_NAME y AWS_REGION
 */

export function getCdnBaseUrl(): string {
  const appEnv = process.env.APP_ENV || 'development';

  if (appEnv === 'production') {
    return 'https://cdn.fasttify.com';
  }

  const bucket = process.env.BUCKET_NAME;
  const region = process.env.AWS_REGION || 'us-east-2';
  return `https://${bucket}.s3.${region}.amazonaws.com`;
}

export function getCdnUrlForKey(s3Key: string): string {
  return `${getCdnBaseUrl()}/${s3Key}`;
}
