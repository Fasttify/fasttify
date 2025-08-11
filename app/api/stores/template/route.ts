import { getNextCorsHeaders } from '@/lib/utils/next-cors'
import { SchemaParser } from '@/renderer-engine/services/templates/parsing/schema-parser'
import { ThemeValidator } from '@/renderer-engine/services/themes'
import type { ThemeFile, ValidationResult } from '@/renderer-engine/services/themes/types'
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils'
import { getCdnBaseUrl, getCdnUrlForKey } from '@/utils/server'
import {
  CopyObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  S3Client,
} from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'

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

/**
 * Carga los objetos del template base desde S3 y los convierte en ThemeFile[]
 */
async function loadBaseTemplateAsThemeFiles(
  templateObjects: Array<{ key: string; relativePath: string }>
): Promise<ThemeFile[]> {
  const files: ThemeFile[] = []
  for (const obj of templateObjects) {
    try {
      const response = await s3Client.send(
        new GetObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: obj.key })
      )
      const body = await response.Body?.transformToByteArray()
      if (!body) continue

      const isText = isTextLike(obj.relativePath)
      const content = isText ? new TextDecoder('utf-8').decode(body) : Buffer.from(body)

      files.push({
        path: obj.relativePath,
        content,
        type: determineFileType(obj.relativePath),
        size: body.length,
        lastModified: new Date(),
      })
    } catch (e) {
      console.error('Failed to load base template file from S3', obj.key, e)
    }
  }
  return files
}

function isTextLike(path: string): boolean {
  const ext = path.toLowerCase().split('.').pop() || ''
  return ['liquid', 'json', 'css', 'js', 'html', 'xml', 'txt', 'md'].includes(ext)
}

function determineFileType(path: string): 'liquid' | 'json' | 'css' | 'js' | 'image' | 'font' | 'other' {
  const extension = path.toLowerCase().split('.').pop() || ''
  if (extension === 'liquid') return 'liquid'
  if (extension === 'json') return 'json'
  if (extension === 'css') return 'css'
  if (extension === 'js') return 'js'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) return 'image'
  if (['woff', 'woff2', 'ttf', 'eot', 'otf'].includes(extension)) return 'font'
  return 'other'
}

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

    // 6. Validar el "tema local" (la plantilla base) reutilizando el validador de temas
    //    Leemos los archivos fuente desde el bucket base y construimos ThemeFile[]
    const themeFiles: ThemeFile[] = await loadBaseTemplateAsThemeFiles(templateObjects)
    const validator = ThemeValidator.getInstance()
    const validation: ValidationResult = await validator.validateThemeFiles(themeFiles, storeId)

    // Extraer metadatos del tema desde config/settings_schema.json
    const settingsFile = themeFiles.find(
      (f) =>
        f.path === 'config/settings_schema.json' ||
        f.path.endsWith('/config/settings_schema.json') ||
        f.path.includes('/config/settings_schema.json')
    )
    let themeInfo: any = {}
    if (settingsFile && typeof settingsFile.content === 'string') {
      try {
        const parser = new SchemaParser()
        const info = parser.extractThemeInfo(settingsFile.content as string)
        themeInfo = info
      } catch (e) {
        // ignorar errores de parseo aquí; ya vendrán reflejados en validation
      }
    }

    // Resolver preview URL buscando un asset conocido o usando la del schema
    const previewUrl = findPreviewUrlFromTemplateUrls(templateUrls) || themeInfo.previewUrl || null

    // 7. Crear registro del tema en la DB con la información validada
    try {
      const s3FolderKey = `templates/${storeId}`
      const baseUrl = getCdnBaseUrl()

      const totalBytes = themeFiles.reduce((sum, f) => sum + (Number(f.size) || 0), 0)

      const themeRecord = {
        storeId,
        name: themeInfo.name || `${storeData?.theme || 'Default'} Theme`,
        version: themeInfo.version || '1.0.0',
        author: themeInfo.author || 'System',
        description: themeInfo.description || storeData?.description || 'Tema inicial de la tienda',
        s3Key: s3FolderKey,
        cdnUrl: `${baseUrl}/${s3FolderKey}/theme.zip`,
        fileCount: copyResults.length,
        totalSize: totalBytes,
        isActive: true,
        settings: JSON.stringify({
          name: themeInfo.name || `${storeData?.theme || 'Default'} Theme`,
          version: themeInfo.version || '1.0.0',
          settings_schema: themeInfo.settings_schema || [],
          settings_defaults: themeInfo.settings_defaults || {},
        }),
        validation: JSON.stringify(validation),
        analysis: JSON.stringify(validation.analysis || {}),
        preview: previewUrl,
        owner: user.username,
      }

      await cookiesClient.models.UserTheme.create(themeRecord as any)
    } catch (e) {
      console.error('Failed to create initial theme record in DB:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Template files copied to user store successfully',
      templateUrls,
      copiedFiles: copyResults.length,
      files: copyResults,
      validation: {
        isValid: validation.isValid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        errors: validation.errors,
        warnings: validation.warnings,
        theme: themeInfo,
      },
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
    urls[path] = getCdnUrlForKey(key)
  })

  return urls
}

function sanitizeMetadataValue(value: string): string {
  return value.replace(/[^\x00-\x7F]/g, '')
}

// Busca una URL de preview dentro de los archivos copiados del template
function findPreviewUrlFromTemplateUrls(urls: Record<string, string>): string | undefined {
  const candidates = [
    'assets/preview.png',
    'assets/preview.jpg',
    'assets/preview.webp',
    'assets/screenshot.png',
    'assets/screenshot.jpg',
    'assets/screenshot.webp',
    'preview.png',
    'preview.jpg',
    'preview.webp',
    'screenshot.png',
    'screenshot.jpg',
    'screenshot.webp',
  ]

  // Intentar coincidencia exacta por clave
  for (const name of candidates) {
    if (urls[name]) return urls[name]
  }

  // Si no está exacto, buscar por sufijo en claves (por si vienen en subcarpetas)
  const keys = Object.keys(urls)
  for (const key of keys) {
    if (candidates.some((c) => key.endsWith('/' + c) || key.toLowerCase().endsWith('/' + c))) {
      return urls[key]
    }
  }
  return undefined
}
