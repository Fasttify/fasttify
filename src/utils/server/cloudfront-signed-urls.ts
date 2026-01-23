import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN_NAME;
const CLOUDFRONT_KEY_PAIR_ID = process.env.CLOUDFRONT_KEY_PAIR_ID;
// Reemplazamos `\n` por saltos de línea reales
const CLOUDFRONT_PRIVATE_KEY = process.env.CLOUDFRONT_PRIVATE_KEY?.replace(/\\n/g, '\n');

/**
 * Genera una URL firmada de CloudFront para cualquier archivo
 */
export async function generateSignedUrl(s3Key: string, expiresInMinutes: number = 60): Promise<string> {
  if (!CLOUDFRONT_KEY_PAIR_ID || !CLOUDFRONT_PRIVATE_KEY) {
    throw new Error('CloudFront key pair not configured');
  }

  const url = `https://${CLOUDFRONT_DOMAIN}/${s3Key}`;
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  return getSignedUrl({
    url,
    dateLessThan: expiresAt.toISOString(),
    keyPairId: CLOUDFRONT_KEY_PAIR_ID,
    privateKey: CLOUDFRONT_PRIVATE_KEY,
  });
}

/**
 * Genera una URL firmada de CloudFront para acceso temporal a templates
 */
export async function generateSignedTemplateUrl(
  storeId: string,
  templatePath: string,
  expiresInMinutes: number = 60
): Promise<string> {
  const s3Key = `templates/${storeId}/${templatePath}`;
  return generateSignedUrl(s3Key, expiresInMinutes);
}

/**
 * Genera URL firmada para el ZIP del tema
 */
export async function generateSignedThemeZipUrl(storeId: string, expiresInMinutes: number = 30): Promise<string> {
  return generateSignedTemplateUrl(storeId, 'theme.zip', expiresInMinutes);
}

/**
 * Genera URL firmada para metadata del tema
 */
export async function generateSignedMetadataUrl(storeId: string, expiresInMinutes: number = 60): Promise<string> {
  return generateSignedTemplateUrl(storeId, 'metadata.json', expiresInMinutes);
}

/**
 * Genera URL firmada para assets del tema
 */
export async function generateSignedAssetUrl(
  storeId: string,
  assetPath: string,
  expiresInMinutes: number = 120
): Promise<string> {
  return generateSignedTemplateUrl(storeId, `assets/${assetPath}`, expiresInMinutes);
}
