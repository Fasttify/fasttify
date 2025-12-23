/**
 * Utilidades para manejo de archivos
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import type { ThemeFile, FileMap } from '../types/theme-types';
import { FileType } from '../types/theme-types';
import { logger } from './logger';

const FILE_EXTENSIONS: Record<string, FileType> = {
  '.liquid': FileType.LIQUID,
  '.json': FileType.JSON,
  '.css': FileType.CSS,
  '.js': FileType.JAVASCRIPT,
  '.ts': FileType.JAVASCRIPT,
  '.png': FileType.IMAGE,
  '.jpg': FileType.IMAGE,
  '.jpeg': FileType.IMAGE,
  '.gif': FileType.IMAGE,
  '.svg': FileType.IMAGE,
  '.webp': FileType.IMAGE,
  '.woff': FileType.FONT,
  '.woff2': FileType.FONT,
  '.ttf': FileType.FONT,
  '.eot': FileType.FONT,
  '.otf': FileType.FONT,
};

export function detectFileType(filePath: string): FileType {
  const ext = path.extname(filePath).toLowerCase();
  return FILE_EXTENSIONS[ext] || FileType.OTHER;
}

export function readFile(filePath: string, encoding: BufferEncoding = 'utf8'): string {
  try {
    return fs.readFileSync(filePath, encoding);
  } catch (error) {
    logger.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

export function writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, encoding);
  } catch (error) {
    logger.error(`Error writing file ${filePath}:`, error);
    throw error;
  }
}

export function copyFile(sourcePath: string, destPath: string): void {
  try {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(sourcePath, destPath);
  } catch (error) {
    logger.error(`Error copying file ${sourcePath} to ${destPath}:`, error);
    throw error;
  }
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function isDirectory(dirPath: string): boolean {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export function getRelativePath(filePath: string, basePath: string): string {
  return path.relative(basePath, filePath);
}

export async function findFiles(
  directory: string,
  patterns: string[],
  options: { ignore?: string[]; recursive?: boolean } = {}
): Promise<string[]> {
  const { ignore = [], recursive = true } = options;
  const allFiles: string[] = [];

  for (const pattern of patterns) {
    try {
      const files = await glob(pattern, {
        cwd: directory,
        ignore,
        absolute: false,
        nodir: true,
      });
      allFiles.push(...files);
    } catch (error) {
      logger.warn(`Error searching for pattern ${pattern}:`, error);
    }
  }

  return [...new Set(allFiles)];
}

export function createFileMap(files: ThemeFile[], basePath: string): FileMap {
  const fileMap: FileMap = {};

  for (const file of files) {
    const fileName = path.basename(file.path);
    const fileNameWithoutExt = path.parse(fileName).name;
    const relativePath = getRelativePath(file.path, basePath);

    fileMap[fileName] = {
      path: file.path,
      relativePath,
      type: file.type,
    };

    fileMap[fileNameWithoutExt] = {
      path: file.path,
      relativePath,
      type: file.type,
    };
  }

  return fileMap;
}
