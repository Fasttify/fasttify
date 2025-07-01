#!/usr/bin/env node

/**
 * Script para subir la plantilla base a S3
 *
 * Este script toma todos los archivos de la carpeta 'template' local
 * y los sube a S3 en la ruta 'base-templates/default/'
 *
 * Uso:
 * node scripts/upload-base-template.js
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { readFile, readdir } = require('fs/promises')
const { join, relative } = require('path')
const dotenv = require('dotenv')

// Cargar variables de entorno
dotenv.config()

// Configuración
const BUCKET_NAME = process.env.BUCKET_NAME
const REGION = process.env.REGION_BUCKET || 'us-east-2'
const BASE_TEMPLATE_PREFIX = 'base-templates/default/'
const TEMPLATE_DIR = join(process.cwd(), 'template')

// Cliente S3
const s3Client = new S3Client({
  region: REGION,
})

// Función para determinar content type
function getContentType(filename) {
  const ext = filename.toLowerCase().split('.').pop()

  const contentTypes = {
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

  return contentTypes[ext] || 'application/octet-stream'
}

// Función para leer archivos de plantilla
async function readTemplateFiles() {
  const files = []

  async function readDirectory(dir, basePath = '') {
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

        let content

        if (isBinaryFile) {
          // Leer archivo binario como Buffer
          content = await readFile(fullPath)
        } else {
          // Leer archivo de texto como utf-8
          content = await readFile(fullPath, 'utf-8')
        }

        files.push({
          path: relativePath.replace(/\\/g, '/'), // Normalizar path para web
          content,
          contentType,
          isBinaryFile,
        })
      }
    }
  }

  await readDirectory(TEMPLATE_DIR)
  return files
}

// Función para subir plantillas a S3
async function uploadTemplatesToS3(files) {
  console.log(`Subiendo ${files.length} archivos a S3...`)

  const uploadPromises = files.map(async file => {
    const key = `${BASE_TEMPLATE_PREFIX}${file.path}`

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.isBinaryFile ? file.content : file.content,
      ContentType: file.contentType,
      Metadata: {
        'template-type': 'base-template',
        'upload-time': new Date().toISOString(),
      },
    })

    try {
      await s3Client.send(command)
      console.log(`✅ Subido: ${key}`)
      return {
        key,
        path: file.path,
        size: file.isBinaryFile
          ? file.content.length
          : Buffer.byteLength(file.content, 'utf-8'),
      }
    } catch (error) {
      console.error(`❌ Error al subir ${key}:`, error)
      throw error
    }
  })

  return Promise.all(uploadPromises)
}

// Función principal
async function main() {
  try {
    console.log('Iniciando subida de plantilla base a S3...')
    console.log(`Bucket: ${BUCKET_NAME}`)
    console.log(`Región: ${REGION}`)
    console.log(`Prefijo: ${BASE_TEMPLATE_PREFIX}`)
    console.log(`Directorio de plantilla: ${TEMPLATE_DIR}`)

    // Leer archivos de plantilla
    console.log('Leyendo archivos de plantilla...')
    const templateFiles = await readTemplateFiles()
    console.log(`Se encontraron ${templateFiles.length} archivos.`)

    // Subir plantillas a S3
    const uploadResults = await uploadTemplatesToS3(templateFiles)

    console.log('\n✅ Subida completada con éxito!')
    console.log(`Se subieron ${uploadResults.length} archivos.`)
  } catch (error) {
    console.error('❌ Error al subir la plantilla base:', error)
    process.exit(1)
  }
}

// Ejecutar
main()
