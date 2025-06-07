import { NextRequest, NextResponse } from 'next/server'
import { AuthGetCurrentUserServer } from '@/utils/AmplifyUtils'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'

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

interface TemplateFile {
  path: string
  content: string
  contentType: string
}

// Configuración de S3
const s3Client = new S3Client({
  region: process.env.REGION_BUCKET || 'us-east-2',
})

export async function POST(request: NextRequest) {
  try {
    // 1. Validar autenticación
    const user = await AuthGetCurrentUserServer()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // 2. Parsear request body
    const body: TemplateRequest = await request.json()
    const { storeId, storeName, domain, storeData } = body

    if (!storeId || !storeName || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields: storeId, storeName, domain' },
        { status: 400 }
      )
    }

    // Nota: No verificamos la existencia de la tienda aquí porque puede haber delay
    // en la propagación de datos después de la creación. La autenticación del usuario
    // es suficiente para este endpoint que viene del flujo controlado de setup.

    // 3. Leer plantillas base
    const templateFiles = await readTemplateFiles()

    // 4. Personalizar plantillas con datos de la tienda
    const processedTemplates = await processTemplateFiles(templateFiles, {
      storeName,
      domain,
      storeData: storeData || {},
    })

    // 5. Subir plantillas a S3
    const uploadResults = await uploadTemplatesToS3(storeId, processedTemplates)

    // 6. Generar URLs de las plantillas
    const templateUrls = generateTemplateUrls(storeId, uploadResults)

    return NextResponse.json({
      success: true,
      message: 'Template files uploaded to S3 successfully',
      templateUrls,
      uploadedFiles: uploadResults.length,
      files: uploadResults,
    })
  } catch (error) {
    console.error('Error uploading template to S3:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Función para leer archivos de plantilla
async function readTemplateFiles(): Promise<TemplateFile[]> {
  const templateDir = join(process.cwd(), 'template')
  const files: TemplateFile[] = []

  async function readDirectory(dir: string, basePath: string = ''): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      const relativePath = join(basePath, entry.name)

      if (entry.isDirectory()) {
        await readDirectory(fullPath, relativePath)
      } else if (entry.isFile()) {
        const contentType = getContentType(entry.name)

        // Determinar si es un archivo binario o de texto
        const isBinaryFile =
          contentType.startsWith('image/') ||
          contentType.startsWith('font/') ||
          contentType === 'application/octet-stream'

        let content: string

        if (isBinaryFile) {
          // Leer archivo binario como Buffer y convertir a base64
          const buffer = await readFile(fullPath)
          content = buffer.toString('base64')
        } else {
          // Leer archivo de texto como utf-8
          content = await readFile(fullPath, 'utf-8')
        }

        files.push({
          path: relativePath.replace(/\\/g, '/'), // Normalizar path para web
          content,
          contentType,
        })
      }
    }
  }

  await readDirectory(templateDir)
  return files
}

// Función para procesar y personalizar plantillas Liquid
async function processTemplateFiles(
  files: TemplateFile[],
  storeConfig: {
    storeName: string
    domain: string
    storeData: any
  }
): Promise<TemplateFile[]> {
  return files.map(file => {
    let processedContent = file.content

    // Variables de configuración de la tienda
    const storeVariables = {
      'shop.name': storeConfig.storeName,
      'shop.domain': storeConfig.domain,
      'shop.description': storeConfig.storeData.description || '',
      'shop.currency': storeConfig.storeData.currency || 'USD',
      'shop.money_format': storeConfig.storeData.currency === 'EUR' ? '€{{amount}}' : '${{amount}}',
      'shop.logo': storeConfig.storeData.logo || '',
      'shop.banner': storeConfig.storeData.banner || '',
      'shop.theme': storeConfig.storeData.theme || 'modern',
      'shop.email': storeConfig.storeData.contactEmail || '',
      'shop.phone': storeConfig.storeData.contactPhone || '',
      'shop.address': storeConfig.storeData.storeAddress || '',
    }

    // Reemplazar variables de Liquid
    Object.entries(storeVariables).forEach(([key, value]) => {
      // Reemplazar tanto {{ shop.name }} como {{shop.name}} (con y sin espacios)
      const regexWithSpaces = new RegExp(`\\{\\{\\s*${key.replace('.', '\\.')}\\s*\\}\\}`, 'g')
      processedContent = processedContent.replace(regexWithSpaces, value)
    })

    // Variables adicionales para compatibilidad
    processedContent = processedContent
      .replace(/\{\{storeName\}\}/g, storeConfig.storeName)
      .replace(/\{\{domain\}\}/g, storeConfig.domain)
      .replace(/\{\{storeDescription\}\}/g, storeConfig.storeData.description || '')

    return {
      ...file,
      content: processedContent,
    }
  })
}

// Función para subir plantillas a S3
async function uploadTemplatesToS3(
  storeId: string,
  files: TemplateFile[]
): Promise<Array<{ key: string; path: string; size: number }>> {
  const uploadPromises = files.map(async file => {
    const key = `templates/${storeId}/${file.path}`

    // Determinar si es un archivo binario
    const isBinaryFile =
      file.contentType.startsWith('image/') ||
      file.contentType.startsWith('font/') ||
      file.contentType === 'application/octet-stream'

    // Preparar el body según el tipo de archivo
    const body = isBinaryFile
      ? Buffer.from(file.content, 'base64') // Convertir de base64 a Buffer
      : file.content // Mantener como string

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: file.contentType,
      Metadata: {
        'store-id': storeId,
        'template-type': 'store-template',
        'upload-time': new Date().toISOString(),
      },
    })

    await s3Client.send(command)

    return {
      key,
      path: file.path,
      size: isBinaryFile
        ? Buffer.from(file.content, 'base64').length
        : Buffer.byteLength(file.content, 'utf-8'),
    }
  })

  return Promise.all(uploadPromises)
}

// Función para generar URLs de plantillas
function generateTemplateUrls(
  storeId: string,
  uploadResults: Array<{ key: string; path: string; size: number }>
): Record<string, string> {
  const urls: Record<string, string> = {}

  uploadResults.forEach(({ key, path }) => {
    const baseUrl =
      process.env.CLOUDFRONT_DOMAIN_NAME && process.env.APP_ENV === 'production'
        ? `https://${process.env.CLOUDFRONT_DOMAIN_NAME}`
        : `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION_BUCKET || 'us-east-2'}.amazonaws.com`

    urls[path] = `${baseUrl}/${key}`
  })

  return urls
}

// Función para determinar content type
function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()

  const contentTypes: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    liquid: 'application/liquid',
    txt: 'text/plain',
    md: 'text/markdown',
    scss: 'text/scss',
    sass: 'text/sass',
    xml: 'application/xml',
    // Tipos de imagen
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    ico: 'image/x-icon',
    // Tipos de font
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
  }

  return contentTypes[ext || ''] || 'application/octet-stream'
}
