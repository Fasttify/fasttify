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
 * Funciones de utilidad para operaciones relacionadas con tiendas
 */

/**
 * Extrae el ID de la tienda desde los parámetros de URL o la ruta
 * @param params - El objeto de parámetros de URL
 * @param pathname - La ruta actual
 * @returns El ID de la tienda extraído
 */
export function getStoreId(params: any, pathname: string): string {
  // Intenta obtener el storeId de los parámetros (podría estar bajo la clave storeId o slug)
  const storeId = params.storeId || params.slug || extractStoreIdFromPath(pathname);
  return storeId || '';
}

/**
 * Extrae el ID de la tienda desde una ruta URL
 * @param path - La ruta URL
 * @returns El ID de la tienda extraído
 */
export function extractStoreIdFromPath(path: string): string {
  const matches = path.match(/\/store\/([^\/]+)/);
  return matches ? matches[1] : '';
}
