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
 * Native Filters Bridge
 *
 * Este módulo proporciona un puente entre los filtros JavaScript y nativos (Rust).
 * Intenta usar la versión nativa si está disponible, con fallback a JavaScript.
 */

import { logger } from './logger';

type NativeFilters = {
  append: (input: string | null | undefined, value: string | null | undefined) => string;
  prepend: (input: string | null | undefined, value: string | null | undefined) => string;
  handleize: (text: string | null | undefined) => string;
  truncate: (text: string | null | undefined, length?: number, truncateString?: string) => string;
  pluralize: (count: number, singular: string, plural?: string) => string;
  defaultValue: (value: string | null | undefined, defaultValue: string) => string;
  escape: (text: string | null | undefined) => string;
  stripHtml: (text: string | null | undefined) => string;
  stripNewlines: (text: string | null | undefined) => string;
  newlineToBr: (text: string | null | undefined) => string;
};

let nativeFilters: NativeFilters | null = null;
let usingNative = false;

/**
 * Intenta cargar los filtros nativos.
 * Si falla, registra un warning y continúa con los filtros JavaScript.
 */
function loadNativeFilters(): void {
  try {
    nativeFilters = require('@fasttify/liquid-forge-native') as NativeFilters;
    usingNative = true;
    logger.info('Native filters loaded successfully');
  } catch (error) {
    logger.info('Native filters not available, using JavaScript implementation', {
      reason: error instanceof Error ? error.message : 'Unknown',
    });
    usingNative = false;
    nativeFilters = null;
  }
}

// Intentar cargar al importar el módulo
loadNativeFilters();

/**
 * Verifica si los filtros nativos están siendo usados.
 */
export function isUsingNativeFilters(): boolean {
  return usingNative;
}

/**
 * Fuerza la recarga de filtros nativos.
 * Útil en desarrollo cuando se recompila el módulo nativo.
 */
export function reloadNativeFilters(): void {
  loadNativeFilters();
}

/**
 * Exporta los filtros nativos si están disponibles, null si no.
 */
export { nativeFilters };

/**
 * Helper type para crear filtros híbridos (nativo + fallback JS)
 */
export type HybridFilter<T extends (...args: any[]) => any> = T & {
  native: boolean;
};

/**
 * Crea un filtro híbrido que usa la versión nativa si está disponible.
 *
 * @param nativeKey - Nombre del filtro en el módulo nativo
 * @param jsImplementation - Implementación JavaScript de fallback
 * @returns Filtro híbrido
 */
export function createHybridFilter<T extends (...args: any[]) => any>(
  nativeKey: keyof NativeFilters,
  jsImplementation: T
): HybridFilter<T> {
  const hybridFilter = ((...args: Parameters<T>): ReturnType<T> => {
    if (nativeFilters && nativeKey in nativeFilters) {
      try {
        return (nativeFilters[nativeKey] as any)(...args);
      } catch (error) {
        logger.warn(`Error en filtro nativo ${nativeKey}, fallback a JS`, { error });
        return jsImplementation(...args);
      }
    }
    return jsImplementation(...args);
  }) as HybridFilter<T>;

  // Marcar si está usando implementación nativa
  Object.defineProperty(hybridFilter, 'native', {
    get: () => usingNative && nativeFilters !== null,
    enumerable: false,
  });

  return hybridFilter;
}
