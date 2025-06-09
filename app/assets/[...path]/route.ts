import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

// Configuración de S3
const s3Client = new S3Client({
  region: process.env.REGION_BUCKET || 'us-east-2',
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const assetPath = path.join('/')

    // Extraer storeId del host/subdominio
    const host = request.headers.get('host') || ''
    const storeId = extractStoreIdFromHost(host)

    if (!storeId) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Construir la key de S3
    const s3Key = `templates/${storeId}/assets/${assetPath}`

    // Obtener el archivo desde S3
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: s3Key,
    })

    const response = await s3Client.send(command)

    if (!response.Body) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Convertir stream a buffer
    const buffer = await streamToBuffer(response.Body)

    // Determinar content type
    const contentType = getContentTypeFromFilename(assetPath)

    // Retornar el archivo con headers apropiados
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
        ETag: response.ETag || '',
      },
    })
  } catch (error) {
    console.error('[AssetsAPI] Error loading asset:', error)

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

// Helper function para extraer storeId del host
function extractStoreIdFromHost(host: string): string | null {
  // Ejemplos de host:
  // tienda-4cbd405.localhost:3000 -> 4cbd405
  // store-abc123.yourdomain.com -> abc123
  // localhost:3000 -> null (no es subdominio)

  const parts = host.split('.')

  if (parts.length < 2) {
    return null // No es un subdominio
  }

  const subdomain = parts[0]

  // Buscar patrón: palabra-STOREID
  const match = subdomain.match(/^.+-([a-zA-Z0-9]+)$/)

  if (match && match[1]) {
    return match[1]
  }

  return null
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
