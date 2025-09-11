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

/**
 * Construye el prefijo para las búsquedas en S3
 * @param storeId - El ID de la tienda
 * @returns El prefijo para las búsquedas en S3
 */
export function buildThemePrefix(storeId: string): string {
  if (!storeId) throw new Error('INVALID_INPUT');
  return `templates/${storeId}`;
}

/**
 * Normaliza el path
 * @param p - El path a normalizar
 * @returns El path normalizado
 */
export function normalizePath(p: string): string {
  const cleaned = p.replace(/\\/g, '/').replace(/\.\.+/g, '').replace(/^\/+/, '');
  if (cleaned.includes('..')) throw new Error('INVALID_PATH');
  return cleaned;
}

/**
 * Verifica si el archivo es un texto
 * @param path - El path del archivo
 * @returns true si el archivo es un texto, false en caso contrario
 */
const TEXT_EXTENSIONS = new Set(['liquid', 'css', 'js', 'json', 'html', 'htm']);

export function isTextFile(path: string): boolean {
  const ext = (path.split('.').pop() || '').toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

/**
 * Obtiene el contenido type del archivo
 * @param path - El path del archivo
 * @returns El contenido type del archivo
 */
export function getContentType(path: string): string {
  const ext = (path.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'liquid':
    case 'html':
    case 'htm':
      return 'text/html; charset=utf-8';
    case 'css':
      return 'text/css; charset=utf-8';
    case 'js':
      return 'application/javascript; charset=utf-8';
    case 'json':
      return 'application/json; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Obtiene el tipo de archivo basado en la extensión
 * @param path - El path del archivo
 * @returns El tipo de archivo
 */
export function getFileType(path: string): string {
  const extension = (path.split('.').pop() || '').toLowerCase();

  switch (extension) {
    case 'css':
      return 'css';
    case 'js':
      return 'javascript';
    case 'json':
      return 'json';
    case 'liquid':
      return 'liquid';
    case 'html':
    case 'htm':
      return 'html';
    case 'svg':
      return 'svg';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return 'image';
    default:
      return 'other';
  }
}

/**
 * Crea el ID del archivo
 * @param path - El path del archivo
 * @returns El ID del archivo
 */
export function createFileId(path: string): string {
  return `file_${path.replace(/[^a-zA-Z0-9]/g, '_')}`;
}
