import { AuthGetCurrentUserServer } from '@/utils/client/AmplifyUtils'
import {
  CopyObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  S3Client,
} from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'
import { getNextCorsHeaders } from '@/lib/utils/next-cors'

interface TemplateRequest {
  storeId: string
  storeName: string
  domain: string
  storeData?: {
    theme?: string
    currency?: string
    description?: string
    logo?: string
    banner?: string
  }
}

// Configuración de S3
const s3Client = new S3Client({
  region: process.env.REGION_BUCKET || 'us-east-2',
})

// Prefijo de la plantilla base en S3
const BASE_TEMPLATE_PREFIX = 'base-templates/default/'

export async function POST(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    // 1. Validar autenticación
    const user = await AuthGetCurrentUserServer()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders })
    }

    // 2. Parsear request body
    const body: TemplateRequest = await request.json()
    const { storeId, storeName, domain, storeData } = body

    if (!storeId || !storeName || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields: storeId, storeName, domain' },
        { status: 400, headers: corsHeaders }
      )
    }

    // 3. Listar todos los objetos de la plantilla base
    const templateObjects = await listBaseTemplateObjects()

    // 4. Copiar cada objeto a la carpeta del usuario con personalización
    const copyResults = await copyTemplateToUserStore(templateObjects, storeId, {
      storeName,
      domain,
      storeData: storeData || {},
    })

    // 5. Generar URLs de las plantillas
    const templateUrls = generateTemplateUrls(storeId, copyResults)

    return NextResponse.json({
      success: true,
      message: 'Template files copied to user store successfully',
      templateUrls,
      copiedFiles: copyResults.length,
      files: copyResults,
    })
  } catch (error) {
    console.error('Error copying template to user store:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Función para listar todos los objetos de la plantilla base
async function listBaseTemplateObjects(): Promise<
  Array<{ key: string; relativePath: string }>
> {
  const objects: Array<{ key: string; relativePath: string }> = []
  let continuationToken: string | undefined = undefined

  do {
    const command = new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME,
      Prefix: BASE_TEMPLATE_PREFIX,
      ContinuationToken: continuationToken,
    })

    const response: ListObjectsV2CommandOutput = await s3Client.send(command)

    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key && object.Key !== BASE_TEMPLATE_PREFIX) {
          // Excluir el prefijo mismo
          const relativePath = object.Key.replace(BASE_TEMPLATE_PREFIX, '')
          objects.push({
            key: object.Key,
            relativePath,
          })
        }
      }
    }

    continuationToken = response.NextContinuationToken
  } while (continuationToken)

  return objects
}

// Función para copiar plantillas al almacenamiento del usuario
async function copyTemplateToUserStore(
  templateObjects: Array<{ key: string; relativePath: string }>,
  storeId: string,
  storeConfig: {
    storeName: string
    domain: string
    storeData: any
  }
): Promise<Array<{ key: string; path: string }>> {
  // Crear un mapa de metadatos para personalización
  const metadata = {
    'store-id': storeId,
    'store-name': sanitizeMetadataValue(storeConfig.storeName),
    'store-domain': storeConfig.domain,
    'store-description': sanitizeMetadataValue(storeConfig.storeData.description || ''),
    'store-currency': storeConfig.storeData.currency || 'USD',
    'store-theme': storeConfig.storeData.theme || 'modern',
    'template-type': 'store-template',
    'upload-time': new Date().toISOString(),
  }

  const copyPromises = templateObjects.map(async ({ key, relativePath }) => {
    const targetKey = `templates/${storeId}/${relativePath}`

    const command = new CopyObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      CopySource: `${process.env.BUCKET_NAME}/${key}`,
      Key: targetKey,
      Metadata: metadata,
      MetadataDirective: 'REPLACE', // Reemplazar metadatos en la copia
    })

    await s3Client.send(command)

    return {
      key: targetKey,
      path: relativePath,
    }
  })

  return Promise.all(copyPromises)
}

// Función para generar URLs de plantillas
function generateTemplateUrls(
  storeId: string,
  copyResults: Array<{ key: string; path: string }>
): Record<string, string> {
  const urls: Record<string, string> = {}

  copyResults.forEach(({ key, path }) => {
    const baseUrl =
      process.env.CLOUDFRONT_DOMAIN_NAME && process.env.APP_ENV === 'production'
        ? `https://${process.env.CLOUDFRONT_DOMAIN_NAME}`
        : `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION_BUCKET || 'us-east-2'}.amazonaws.com`

    urls[path] = `${baseUrl}/${key}`
  })

  return urls
}

// Función para sanitizar los valores de los metadatos
function sanitizeMetadataValue(value: string): string {
  // S3 metadata must be ASCII. This removes non-ASCII characters
  // to prevent SignatureDoesNotMatch errors.
  return value.replace(/[^\x00-\x7F]/g, '')
}
