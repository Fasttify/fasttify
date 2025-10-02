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

import { NextRequest, NextResponse } from 'next/server';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/liquid-forge/lib/logger';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: process.env.REGION_BUCKET });
const bucketName = process.env.BUCKET_NAME || '';
const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN_NAME || '';
const appEnv = process.env.APP_ENV || 'development';

export async function getAsset(request: NextRequest, storeId: string, assetPath: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    if (assetPath.includes('..')) {
      return NextResponse.json({ error: 'Invalid asset path' }, { status: 400, headers: corsHeaders });
    }

    let buffer: Buffer;
    let etag: string | undefined;

    if (appEnv === 'production' && cloudFrontDomain) {
      const result = await loadAssetFromCloudFront(storeId, assetPath);
      buffer = result.buffer;
      etag = result.etag;
    } else {
      const result = await loadAssetFromS3(storeId, assetPath);
      buffer = result.buffer;
      etag = result.etag;
    }

    const ifNoneMatch = request.headers.get('if-none-match');
    if (etag && ifNoneMatch && etag === ifNoneMatch) {
      return new NextResponse(null, {
        status: 304,
        headers: { ...corsHeaders, ETag: etag, 'Cache-Control': 'public, max-age=31536000' },
      });
    }

    const contentType = getContentTypeFromFilename(assetPath);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
        ETag: etag || '',
      },
    });
  } catch (error: any) {
    logger.error('[AssetsAPI] Error loading asset', error, 'AssetsAPI');
    if (
      (error instanceof Error && error.name === 'NoSuchKey') ||
      error.Code === 'NoSuchKey' ||
      (error.$metadata && error.$metadata.httpStatusCode === 404)
    ) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function loadAssetFromCloudFront(storeId: string, assetPath: string): Promise<{ buffer: Buffer; etag?: string }> {
  const assetUrl = `https://${cloudFrontDomain}/templates/${storeId}/assets/${assetPath}`;
  const response = await fetch(assetUrl, {
    headers: { 'User-Agent': 'Fasttify-API/1.0', 'X-API-Source': 'fasttify-server' },
  });
  if (!response.ok) throw new Error(`Asset not found: ${assetPath} (CloudFront returned ${response.status})`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const etag = response.headers.get('etag') || undefined;
  return { buffer, etag };
}

async function loadAssetFromS3(storeId: string, assetPath: string): Promise<{ buffer: Buffer; etag?: string }> {
  if (!bucketName) throw new Error('S3 bucket not configured');
  const s3Key = `templates/${storeId}/assets/${assetPath}`;
  const command = new GetObjectCommand({ Bucket: bucketName, Key: s3Key });
  const response = await s3Client.send(command);
  if (!response.Body) {
    const err: any = new Error(`Asset not found: ${assetPath}`);
    err.name = 'NoSuchKey';
    throw err;
  }
  const buffer = await streamToBuffer(response.Body);
  const etag = response.ETag;
  return { buffer, etag };
}

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function getContentTypeFromFilename(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const contentTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    ico: 'image/x-icon',
    css: 'text/css',
    js: 'application/javascript',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
  };
  return contentTypes[ext || ''] || 'application/octet-stream';
}
