#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const FILE_PATTERNS = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];

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

function hasLicenseHeader(content) {
  return (
    content.includes('Copyright 2025 Fasttify LLC') ||
    content.includes('Licensed under the Apache License') ||
    content.includes('http://www.apache.org/licenses/LICENSE-2.0') ||
    (content.trim().startsWith('/*') && content.includes('license'))
  );
}

function checkHeaderInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return hasLicenseHeader(content);
  } catch (error) {
    console.error(`Error leyendo ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const specificPath = args.find((arg) => !arg.startsWith('--'));
  const exitOnMissing = args.includes('--exit-on-missing') || args.includes('-e');

  console.log('Verificando headers de licencia...\n');

  let files = [];

  if (specificPath) {
    if (fs.statSync(specificPath).isFile()) {
      files = [specificPath];
    } else {
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
    for (const pattern of FILE_PATTERNS) {
      const found = glob.sync(pattern, { ignore: EXCLUDE_PATTERNS });
      files.push(...found);
    }
  }

  files = [...new Set(files)].sort();

  console.log(`Verificando ${files.length} archivos...\n`);

  let withHeader = 0;
  let withoutHeader = 0;
  const missingHeaderFiles = [];

  for (const file of files) {
    if (checkHeaderInFile(file)) {
      withHeader++;
      console.log(`${file}`);
    } else {
      withoutHeader++;
      missingHeaderFiles.push(file);
      console.log(`${file}`);
    }
  }

  console.log(`\nResumen:`);
  console.log(`    Con header: ${withHeader}`);
  console.log(`    Sin header: ${withoutHeader}`);
  console.log(`    Total archivos: ${files.length}`);

  if (withoutHeader > 0) {
    console.log(`\nArchivos sin header de licencia:`);
    missingHeaderFiles.forEach((file) => {
      console.log(`   - ${file}`);
    });

    console.log(`\nPara agregar headers automáticamente:`);
    console.log(`   npm run license`);

    if (exitOnMissing) {
      console.log(`\nExiting with error code due to missing license headers.`);
      process.exit(1);
    }
  } else {
    console.log(`\n¡Todos los archivos tienen header de licencia!`);
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Uso: node scripts/check-license-header.js [opciones] [ruta]

Opciones:
  --exit-on-missing, -e    Salir con código de error si faltan headers
  --help, -h               Mostrar esta ayuda

Ejemplos:
  node scripts/check-license-header.js                     # Verificar todo el proyecto
  node scripts/check-license-header.js --exit-on-missing   # Verificar y fallar si hay problemas
  node scripts/check-license-header.js app/                # Solo directorio específico
  node scripts/check-license-header.js app/page.tsx        # Solo archivo específico
`);
  process.exit(0);
}

main().catch(console.error);
