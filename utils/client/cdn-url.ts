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

/**
 * Utilidades para construir URLs de CDN o S3 en el frontend
 * Reglas:
 * - Si NEXT_PUBLIC_CLOUDFRONT_DOMAIN está configurado: usar CloudFront
 * - Si no: usar bucket público de S3 con NEXT_PUBLIC_S3_URL y NEXT_PUBLIC_AWS_REGION
 */

export function getCdnBaseUrl(): string {
  const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;

  if (cloudFrontDomain && cloudFrontDomain.trim() !== '') {
    return `https://${cloudFrontDomain}`;
  }

  const bucketName = process.env.NEXT_PUBLIC_S3_URL;
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2';

  if (!bucketName) {
    throw new Error('NEXT_PUBLIC_S3_URL is not defined in your environment variables');
  }

  return `https://${bucketName}.s3.${region}.amazonaws.com`;
}

export function getCdnUrlForKey(s3Key: string): string {
  return `${getCdnBaseUrl()}/${s3Key}`;
}
