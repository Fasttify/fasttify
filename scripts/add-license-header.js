#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Header de licencia Apache 2.0
const LICENSE_HEADER = `/*
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
 */`;

// Patrones de archivos a incluir
const FILE_PATTERNS = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];

// Directorios y archivos a excluir
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '**/*.d.ts',
  '**/next-env.d.ts',
  'amplify_outputs.json',
  'package*.json',
  'tsconfig*.json',
  'jest.config.js',
  'jest.setup.js',
  'next.config.ts',
  'tailwind.config.ts',
  'postcss.config.mjs',
];

// Función para verificar si el archivo ya tiene un header de licencia
function hasLicenseHeader(content) {
  return (
    content.includes('Copyright 2025 Fasttify LLC') ||
    content.includes('Licensed under the Apache License') ||
    content.includes('http://www.apache.org/licenses/LICENSE-2.0') ||
    (content.trim().startsWith('/*') && content.includes('license'))
  );
}

// Función para agregar header a un archivo
function addHeaderToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Si ya tiene header, saltar
    if (hasLicenseHeader(content)) {
      console.log(`⏭️  Saltando ${filePath} (ya tiene header de licencia)`);
      return false;
    }

    // Agregar header al inicio del archivo
    const newContent = LICENSE_HEADER + '\n\n' + content;
    fs.writeFileSync(filePath, newContent, 'utf8');

    console.log(`✅ Header agregado a ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const specificPath = args.find((arg) => !arg.startsWith('--'));

  console.log('🔍 Buscando archivos para agregar header de licencia...\n');

  let files = [];

  if (specificPath) {
    // Si se especifica un archivo o directorio específico
    if (fs.statSync(specificPath).isFile()) {
      files = [specificPath];
    } else {
      // Buscar archivos en el directorio específico
      // Normalizar la ruta del directorio
      const normalizedPath = specificPath.replace(/\\/g, '/').replace(/\/$/, '');

      for (const pattern of FILE_PATTERNS) {
        const searchPattern = `${normalizedPath}/${pattern}`;
        const found = glob.sync(searchPattern, {
          ignore: EXCLUDE_PATTERNS.map((exclude) => {
            if (exclude.startsWith('**/')) {
              return exclude;
            }
            return `${normalizedPath}/${exclude}`;
          }),
        });
        files.push(...found);
      }
    }
  } else {
    // Buscar en todo el proyecto
    for (const pattern of FILE_PATTERNS) {
      const found = glob.sync(pattern, { ignore: EXCLUDE_PATTERNS });
      files.push(...found);
    }
  }

  // Remover duplicados y ordenar
  files = [...new Set(files)].sort();

  console.log(`📁 Encontrados ${files.length} archivos candidatos\n`);

  if (dryRun) {
    console.log('🔍 MODO DRY-RUN - Solo mostrando archivos que serían modificados:\n');
    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      if (!hasLicenseHeader(content)) {
        console.log(`  📝 ${file}`);
      }
    });
    return;
  }

  let processedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    if (addHeaderToFile(file)) {
      processedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ Archivos procesados: ${processedCount}`);
  console.log(`   ⏭️  Archivos saltados: ${skippedCount}`);
  console.log(`   📁 Total de archivos: ${files.length}`);
}

// Mostrar ayuda
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Uso: node scripts/add-license-header.js [opciones] [ruta]

Opciones:
  --dry-run, -d    Solo mostrar archivos que serían modificados
  --help, -h       Mostrar esta ayuda

Ejemplos:
  node scripts/add-license-header.js                     # Procesar todo el proyecto
  node scripts/add-license-header.js --dry-run           # Ver archivos candidatos
  node scripts/add-license-header.js renderer-engine/    # Solo directorio específico
  node scripts/add-license-header.js app/page.tsx        # Solo archivo específico
`);
  process.exit(0);
}

// Ejecutar
main().catch(console.error);
