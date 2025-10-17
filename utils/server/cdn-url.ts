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
 * Utilidades para construir URLs de CDN o S3
 * Reglas:
 * - Producción (NODE_ENV === 'production'): usar cdn.fasttify.com
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
