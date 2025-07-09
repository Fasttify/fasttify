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
