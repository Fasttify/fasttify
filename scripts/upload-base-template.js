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

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const { readFile, readdir } = require('fs/promises');
const { join } = require('path');
const dotenv = require('dotenv');

dotenv.config();

const BUCKET_NAME = process.env.BUCKET_NAME;
const REGION = process.env.REGION_BUCKET || 'us-east-2';
const CLOUDFRONT_DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;
const BASE_TEMPLATE_PREFIX = 'base-templates/default/';
const TEMPLATE_DIR = join(process.cwd(), 'template');
const FILTER_MODULES_DIR = join(process.cwd(), 'packages/liquid-forge/liquid/tags/filters/js');
const FILTER_MODULES_PREFIX = 'assets/';

const s3Client = new S3Client({
  region: REGION,
});

const cloudFrontClient = new CloudFrontClient({
  region: REGION,
});

function getContentType(filename) {
  const ext = filename.toLowerCase().split('.').pop();

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
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
  };

  return contentTypes[ext] || 'application/octet-stream';
}

async function readTemplateFiles() {
  const files = [];

  async function readDirectory(dir, basePath = '') {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = join(basePath, entry.name);

      if (entry.isDirectory()) {
        await readDirectory(fullPath, relativePath);
      } else if (entry.isFile()) {
        const contentType = getContentType(entry.name);

        const isBinaryFile =
          contentType.startsWith('image/') ||
          contentType.startsWith('font/') ||
          contentType === 'application/octet-stream';

        let content;

        if (isBinaryFile) {
          content = await readFile(fullPath);
        } else {
          content = await readFile(fullPath, 'utf-8');
        }

        files.push({
          path: relativePath.replace(/\\/g, '/'),
          content,
          contentType,
          isBinaryFile,
        });
      }
    }
  }

  await readDirectory(TEMPLATE_DIR);
  return files;
}

async function readFilterModules() {
  const files = [];

  try {
    const jsEntries = await readdir(FILTER_MODULES_DIR, { withFileTypes: true });
    for (const entry of jsEntries) {
      if (entry.isFile() && entry.name.endsWith('.js')) {
        const fullPath = join(FILTER_MODULES_DIR, entry.name);
        const content = await readFile(fullPath, 'utf-8');

        files.push({
          path: entry.name,
          content,
          contentType: 'application/javascript',
          isBinaryFile: false,
        });
      }
    }

    const cssDir = join(process.cwd(), 'packages/liquid-forge/liquid/tags/filters/css');
    try {
      const cssEntries = await readdir(cssDir, { withFileTypes: true });
      for (const entry of cssEntries) {
        if (entry.isFile() && entry.name.endsWith('.css')) {
          const fullPath = join(cssDir, entry.name);
          const content = await readFile(fullPath, 'utf-8');

          files.push({
            path: entry.name,
            content,
            contentType: 'text/css',
            isBinaryFile: false,
          });
        }
      }
    } catch (cssError) {
      console.warn('⚠️  No se encontró el directorio de CSS de filtros:', cssDir);
    }
  } catch (error) {
    console.warn('⚠️  No se encontró el directorio de módulos de filtros:', FILTER_MODULES_DIR);
  }

  return files;
}

async function uploadTemplatesToS3(files) {
  console.log(`Subiendo ${files.length} archivos de plantilla a S3...`);

  const uploadPromises = files.map(async (file) => {
    const key = `${BASE_TEMPLATE_PREFIX}${file.path}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.isBinaryFile ? file.content : file.content,
      ContentType: file.contentType,
      Metadata: {
        'template-type': 'base-template',
        'upload-time': new Date().toISOString(),
      },
    });

    try {
      await s3Client.send(command);
      console.log(`✅ Subido: ${key}`);
      return {
        key,
        path: file.path,
        size: file.isBinaryFile ? file.content.length : Buffer.byteLength(file.content, 'utf-8'),
      };
    } catch (error) {
      console.error(`❌ Error al subir ${key}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
}

async function uploadFilterModulesToS3(files) {
  console.log(`Subiendo ${files.length} módulos de filtros a S3...`);

  const uploadPromises = files.map(async (file) => {
    const key = `${FILTER_MODULES_PREFIX}${file.path}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.content,
      ContentType: file.contentType,
      Metadata: {
        'module-type': 'filter-module',
        'upload-time': new Date().toISOString(),
      },
    });

    try {
      await s3Client.send(command);
      console.log(`✅ Subido: ${key}`);
      return {
        key,
        path: file.path,
        size: Buffer.byteLength(file.content, 'utf-8'),
      };
    } catch (error) {
      console.error(`❌ Error al subir ${key}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
}

async function invalidateCloudFrontCache() {
  if (!CLOUDFRONT_DISTRIBUTION_ID) {
    console.warn('⚠️  CLOUDFRONT_DISTRIBUTION_ID no configurado, saltando invalidación');
    return;
  }

  try {
    const command = new CreateInvalidationCommand({
      DistributionId: CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        Paths: {
          Quantity: 1,
          Items: ['/assets/*'],
        },
        CallerReference: `invalidation-${Date.now()}`,
      },
    });

    await cloudFrontClient.send(command);
    console.log('✅ Cache de CloudFront invalidado');
  } catch (error) {
    console.error('❌ Error al invalidar cache de CloudFront:', error);
  }
}

async function main() {
  try {
    console.log('Iniciando subida de plantilla base y módulos de filtros a S3...');
    console.log(`Bucket: ${BUCKET_NAME}`);
    console.log(`Región: ${REGION}`);
    console.log(`Prefijo de plantilla: ${BASE_TEMPLATE_PREFIX}`);
    console.log(`Prefijo de módulos: ${FILTER_MODULES_PREFIX}`);
    console.log(`Directorio de plantilla: ${TEMPLATE_DIR}`);
    console.log(`Directorio de módulos: ${FILTER_MODULES_DIR}`);

    console.log('\n📁 Leyendo archivos de plantilla...');
    const templateFiles = await readTemplateFiles();
    console.log(`Se encontraron ${templateFiles.length} archivos de plantilla.`);

    console.log('\n🔧 Leyendo módulos de filtros...');
    const filterModules = await readFilterModules();
    console.log(`Se encontraron ${filterModules.length} módulos de filtros.`);

    console.log('\n📤 Subiendo plantillas...');
    const templateResults = await uploadTemplatesToS3(templateFiles);

    console.log('\n📤 Subiendo módulos de filtros...');
    const moduleResults = await uploadFilterModulesToS3(filterModules);

    console.log('\n✅ Subida completada con éxito!');
    console.log(`Se subieron ${templateResults.length} archivos de plantilla.`);
    console.log(`Se subieron ${moduleResults.length} módulos de filtros.`);
    console.log(`\n🌐 Los módulos están disponibles en: https://cdn.fasttify.com/assets/`);

    console.log('\n🔄 Invalidando cache de CloudFront...');
    await invalidateCloudFrontCache();
  } catch (error) {
    console.error('❌ Error durante la subida:', error);
    process.exit(1);
  }
}

main();
