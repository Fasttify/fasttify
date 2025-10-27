#!/usr/bin/env node
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

import fs from 'fs';
import path from 'path';

/**
 * Configuración de los alias del proyecto
 * Solo convertimos aliases que apuntan dentro del paquete (@/liquid-forge y @/)
 * Los demás se mantienen como alias ya que apuntan fuera del paquete
 */
const ALIAS_CONFIG: Record<string, string> = {
  '@/liquid-forge': '.',
  '@/': '.',
};

/**
 * Aliases que NO se deben convertir (rutas externas al paquete)
 */
const EXTERNAL_ALIASES = ['@/utils', '@/lib', '@/amplify', '@/data-schema', '@/amplify_outputs.json', '@/api'];

/**
 * Verifica si un import es de fuera del paquete
 */
function isExternalAlias(importPath: string): boolean {
  return EXTERNAL_ALIASES.some((alias) => importPath.startsWith(alias));
}

/**
 * Tipos de archivos que procesar
 */
const FILE_EXTENSIONS = ['.ts', '.tsx'];

/**
 * Directorios a excluir
 */
const EXCLUDE_DIRS = ['node_modules', 'dist', '.git', 'scripts', '__tests__', 'test', 'tests'];

/**
 * Estadísticas del proceso
 */
interface ProcessStats {
  filesScanned: number;
  filesModified: number;
  importsConverted: number;
  errors: number;
}

/**
 * Verifica si una ruta debe ser excluida
 */
function shouldExclude(filePath: string): boolean {
  const pathParts = filePath.split(path.sep);
  return EXCLUDE_DIRS.some((excludeDir) => pathParts.includes(excludeDir));
}

/**
 * Convierte un import con alias a una ruta relativa
 */
function convertAliasToRelative(importPath: string, fromFile: string, baseDir: string): string {
  // Buscar el alias más largo que coincida
  let matchedAlias = '';
  let matchedPath = '';

  for (const [alias, target] of Object.entries(ALIAS_CONFIG)) {
    if (importPath.startsWith(alias)) {
      if (alias.length > matchedAlias.length) {
        matchedAlias = alias;
        matchedPath = target;
      }
    }
  }

  if (!matchedAlias) {
    return importPath; // No hay alias, mantener el import original
  }

  // Remover el alias del path
  const remainingPath = importPath.substring(matchedAlias.length);

  // Construir la ruta completa del alias
  // Si el path empieza con /, removerlo
  const cleanRemaining = remainingPath.startsWith('/') ? remainingPath.substring(1) : remainingPath;
  const fullTargetPath = path.resolve(baseDir, matchedPath, cleanRemaining);

  // Obtener la ruta relativa desde el archivo origen
  const relativePath = path.relative(path.dirname(fromFile), fullTargetPath);

  // Normalizar la ruta relativa para import statements
  let normalizedPath = relativePath.replace(/\\/g, '/');

  // Asegurar que las rutas relativas empiecen con ./
  if (!normalizedPath.startsWith('.') && !normalizedPath.startsWith('@')) {
    normalizedPath = './' + normalizedPath;
  }

  // Remover la extensión .ts o .tsx
  normalizedPath = normalizedPath.replace(/\.tsx?$/, '');

  return normalizedPath;
}

/**
 * Verifica si una ruta de archivo existe
 */
function fileExists(filePath: string): boolean {
  try {
    // Probar con diferentes extensiones
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.json'];
    for (const ext of extensions) {
      if (fs.existsSync(filePath + ext)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Convierte imports en un archivo
 */
function convertFileImports(
  filePath: string,
  baseDir: string,
  dryRun: boolean = false
): { modified: boolean; importsConverted: number; changes: Array<{ old: string; new: string }> } {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let modified = false;
    let importsConverted = 0;
    const changes: Array<{ old: string; new: string }> = [];

    // Procesar el contenido completo para capturar imports multi-línea
    const contentStr = lines.join('\n');

    // Buscar todos los imports estáticos (pueden ser multi-línea)
    const staticImportRegex = /import\s+(?:[^'"]*?from\s+['"])([@\/\w_-]+)(['"])/g;
    // Buscar imports dinámicos (import(), require(), etc.)
    const dynamicImportRegex = /(?:import|require)\s*\(['"]([@\/\w_-]+)['"]\)/g;

    let newContent = contentStr;

    // Procesar imports estáticos
    newContent = contentStr.replace(staticImportRegex, (match, importPath) => {
      // NO convertir imports externos al paquete
      if (isExternalAlias(importPath)) {
        return match;
      }

      // Verificar si es un alias que necesitamos convertir
      let shouldConvert = false;
      for (const alias of Object.keys(ALIAS_CONFIG)) {
        if (importPath.startsWith(alias)) {
          shouldConvert = true;
          break;
        }
      }

      if (shouldConvert) {
        const relativePath = convertAliasToRelative(importPath, filePath, baseDir);

        if (relativePath !== importPath) {
          modified = true;
          importsConverted++;

          changes.push({ old: importPath, new: relativePath });

          return match.replace(importPath, relativePath);
        }
      }

      return match;
    });

    // Procesar imports dinámicos
    newContent = newContent.replace(dynamicImportRegex, (match, importPath) => {
      // NO convertir imports externos al paquete
      if (isExternalAlias(importPath)) {
        return match;
      }

      // Verificar si es un alias que necesitamos convertir
      let shouldConvert = false;
      for (const alias of Object.keys(ALIAS_CONFIG)) {
        if (importPath.startsWith(alias)) {
          shouldConvert = true;
          break;
        }
      }

      if (shouldConvert) {
        const relativePath = convertAliasToRelative(importPath, filePath, baseDir);

        if (relativePath !== importPath) {
          modified = true;
          importsConverted++;

          changes.push({ old: importPath, new: relativePath });

          return match.replace(importPath, relativePath);
        }
      }

      return match;
    });

    const newLines = newContent.split('\n');

    if (modified && !dryRun) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
      console.log(`Convertido: ${path.relative(baseDir, filePath)} (${importsConverted} imports)`);
    } else if (modified && dryRun) {
      console.log(`  - ${path.relative(baseDir, filePath)} (${importsConverted} imports)`);
    }

    return { modified, importsConverted, changes };
  } catch (error) {
    console.error(`Error procesando ${filePath}:`, error);
    return { modified: false, importsConverted: 0, changes: [] };
  }
}

/**
 * Encuentra todos los archivos TypeScript en un directorio
 */
function findTsFiles(dir: string, baseDir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);

    if (shouldExclude(fullPath)) {
      continue;
    }

    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      findTsFiles(fullPath, baseDir, fileList);
    } else if (stats.isFile()) {
      const ext = path.extname(item);
      if (FILE_EXTENSIONS.includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }

  return fileList;
}

/**
 * Función principal
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');

  const packageDir = path.resolve(__dirname, '..');
  const stats: ProcessStats = {
    filesScanned: 0,
    filesModified: 0,
    importsConverted: 0,
    errors: 0,
  };

  if (dryRun) {
    console.log('Modo DRY-RUN: No se realizarán cambios\n');
  } else {
    console.log('Iniciando conversión de imports...\n');
  }

  console.log(`Directorio del paquete: ${packageDir}\n`);

  // Encontrar todos los archivos TypeScript
  const files = findTsFiles(packageDir, packageDir);
  stats.filesScanned = files.length;

  console.log(`${files.length} archivos encontrados\n`);

  // Procesar cada archivo
  for (const file of files) {
    const result = convertFileImports(file, packageDir, dryRun);

    if (result.modified) {
      stats.filesModified++;
      stats.importsConverted += result.importsConverted;
    }
  }

  // Mostrar estadísticas
  console.log('\nConversión completada\n');
  console.log('Estadísticas:');
  console.log(`   • Archivos escaneados: ${stats.filesScanned}`);
  console.log(`   • Archivos que serían modificados: ${stats.filesModified}`);
  console.log(`   • Imports convertidos: ${stats.importsConverted}`);
  console.log(`   • Errores: ${stats.errors}`);

  if (dryRun) {
    console.log('\nPara aplicar los cambios, ejecuta sin --dry-run');
  } else if (stats.filesModified > 0) {
    console.log('\nRecomendación: Revisa los cambios con git diff antes de hacer commit');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

export { convertAliasToRelative, ALIAS_CONFIG };
