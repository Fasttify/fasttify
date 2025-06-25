import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { logger } from '@/renderer-engine/lib/logger'

// Configuración de S3
const s3Client = new S3Client({
  region: process.env.REGION_BUCKET || 'us-east-2',
})

// Configuración de entorno
const bucketName = process.env.BUCKET_NAME || ''
const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN_NAME || ''
const appEnv = process.env.APP_ENV || 'development'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; path: string[] }> }
) {
  try {
    const { storeId, path } = await params
    const assetPath = path.join('/')

    let buffer: Buffer
    let etag: string | undefined

    // En producción usar CloudFront, en desarrollo usar S3 directo
    if (appEnv === 'production' && cloudFrontDomain) {
      const result = await loadAssetFromCloudFront(storeId, assetPath)
      buffer = result.buffer
      etag = result.etag
    } else {
      const result = await loadAssetFromS3(storeId, assetPath)
      buffer = result.buffer
      etag = result.etag
    }

    // Determinar content type
    const contentType = getContentTypeFromFilename(assetPath)

    logger.debug(
      `[AssetsAPI] Serving asset: ${assetPath} (${contentType}) - ${buffer.length} bytes`,
      undefined,
      'AssetsAPI'
    )

    // Retornar el archivo con headers apropiados
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
        ETag: etag || '',
      },
    })
  } catch (error) {
    logger.error('[AssetsAPI] Error loading asset', error, 'AssetsAPI')

    if (error instanceof Error && error.name === 'NoSuchKey') {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Helper function para cargar asset desde CloudFront (producción)
async function loadAssetFromCloudFront(
  storeId: string,
  assetPath: string
): Promise<{ buffer: Buffer; etag?: string }> {
  const assetUrl = `https://${cloudFrontDomain}/templates/${storeId}/assets/${assetPath}`

  const response = await fetch(assetUrl)

  if (!response.ok) {
    throw new Error(`Asset not found: ${assetPath} (CloudFront returned ${response.status})`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const etag = response.headers.get('etag') || undefined

  return { buffer, etag }
}

// Helper function para cargar asset desde S3 (desarrollo)
async function loadAssetFromS3(
  storeId: string,
  assetPath: string
): Promise<{ buffer: Buffer; etag?: string }> {
  if (!bucketName) {
    throw new Error('S3 bucket not configured')
  }

  // Construir la key de S3
  const s3Key = `templates/${storeId}/assets/${assetPath}`

  // Obtener el archivo desde S3
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  })

  const response = await s3Client.send(command)

  if (!response.Body) {
    throw new Error(`Asset not found: ${assetPath}`)
  }

  // Convertir stream a buffer
  const buffer = await streamToBuffer(response.Body)
  const etag = response.ETag

  return { buffer, etag }
}

// Helper function para convertir stream a buffer
async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Uint8Array[] = []

  for await (const chunk of stream) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

// Helper function para determinar content type
function getContentTypeFromFilename(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()

  const contentTypes: Record<string, string> = {
    // Imágenes
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    ico: 'image/x-icon',
    // CSS y JS
    css: 'text/css',
    js: 'application/javascript',
    // Fonts
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
  }

  return contentTypes[ext || ''] || 'application/octet-stream'
}
