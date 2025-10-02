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

import type { ThemeFile } from '../../types';

/**
 * Tipos de archivo que contienen texto
 */
export const TEXT_FILE_TYPES = ['liquid', 'js', 'css', 'html', 'xml', 'md', 'txt', 'json'] as const;

/**
 * Tipos de archivo que contienen código
 */
export const CODE_FILE_TYPES = ['liquid', 'js', 'css', 'html'] as const;

/**
 * Filtra archivos que contienen texto y pueden ser procesados con operaciones de string
 */
export function filterTextFiles(files: ThemeFile[]): ThemeFile[] {
  return files.filter((file) => typeof file.content === 'string' && TEXT_FILE_TYPES.includes(file.type as any));
}

/**
 * Filtra archivos que contienen código (Liquid, JS, CSS, HTML)
 */
export function filterCodeFiles(files: ThemeFile[]): ThemeFile[] {
  return files.filter((file) => typeof file.content === 'string' && CODE_FILE_TYPES.includes(file.type as any));
}

/**
 * Filtra archivos Liquid específicamente
 */
export function filterLiquidFiles(files: ThemeFile[]): ThemeFile[] {
  return files.filter((file) => typeof file.content === 'string' && file.type === 'liquid');
}

/**
 * Filtra archivos de assets (imágenes, fuentes, etc.)
 */
export function filterAssetFiles(files: ThemeFile[]): ThemeFile[] {
  return files.filter((file) => file.type === 'image' || file.type === 'font' || file.path.includes('assets/'));
}

/**
 * Verifica si un archivo puede ser procesado como texto
 */
export function isTextFile(file: ThemeFile): boolean {
  return typeof file.content === 'string' && TEXT_FILE_TYPES.includes(file.type as any);
}

/**
 * Verifica si un archivo es de tipo código
 */
export function isCodeFile(file: ThemeFile): boolean {
  return typeof file.content === 'string' && CODE_FILE_TYPES.includes(file.type as any);
}

/**
 * Verifica si un archivo es de tipo Liquid
 */
export function isLiquidFile(file: ThemeFile): boolean {
  return typeof file.content === 'string' && file.type === 'liquid';
}
