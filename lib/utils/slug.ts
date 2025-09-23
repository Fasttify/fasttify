/**
 * Utilidades para generar slugs a partir de texto
 */

/**
 * Genera un slug a partir de un texto
 * @param text - El texto a convertir en slug
 * @param options - Opciones de configuración
 * @returns El slug generado
 */
export function generateSlug(
  text: string,
  options: {
    /** Separador entre palabras (por defecto: '-') */
    separator?: string;
    /** Longitud máxima del slug (por defecto: 50) */
    maxLength?: number;
    /** Si debe convertir a minúsculas (por defecto: true) */
    toLowerCase?: boolean;
    /** Si debe remover caracteres especiales (por defecto: true) */
    removeSpecialChars?: boolean;
    /** Si debe remover acentos (por defecto: true) */
    removeAccents?: boolean;
  } = {}
): string {
  const {
    separator = '-',
    maxLength = 50,
    toLowerCase = true,
    removeSpecialChars = true,
    removeAccents = true,
  } = options;

  if (!text || typeof text !== 'string') {
    return '';
  }

  let slug = text.trim();

  // Remover acentos
  if (removeAccents) {
    slug = removeAccentsFromText(slug);
  }

  // Convertir a minúsculas
  if (toLowerCase) {
    slug = slug.toLowerCase();
  }

  // Remover caracteres especiales y reemplazar espacios
  if (removeSpecialChars) {
    // Mantener solo letras, números, espacios y guiones
    slug = slug.replace(/[^a-z0-9\s-]/g, '');
    // Reemplazar múltiples espacios o guiones con el separador
    slug = slug.replace(/[\s-]+/g, separator);
  } else {
    // Solo reemplazar espacios con el separador
    slug = slug.replace(/\s+/g, separator);
  }

  // Remover separadores al inicio y final
  slug = slug.replace(new RegExp(`^${escapeRegExp(separator)}+|${escapeRegExp(separator)}+$`, 'g'), '');

  // Limitar longitud
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Asegurar que no termine con separador
    slug = slug.replace(new RegExp(`${escapeRegExp(separator)}+$`, 'g'), '');
  }

  return slug;
}

/**
 * Genera un slug único agregando un sufijo numérico si es necesario
 * @param text - El texto base para el slug
 * @param existingSlugs - Array de slugs existentes
 * @param options - Opciones de configuración
 * @returns El slug único generado
 */
export function generateUniqueSlug(
  text: string,
  existingSlugs: string[] = [],
  options: Parameters<typeof generateSlug>[1] = {}
): string {
  const baseSlug = generateSlug(text, options);

  if (!baseSlug) {
    return '';
  }

  // Si el slug base no existe, devolverlo
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Buscar un slug único agregando números
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Valida si un slug es válido
 * @param slug - El slug a validar
 * @param options - Opciones de validación
 * @returns true si el slug es válido
 */
export function isValidSlug(
  slug: string,
  options: {
    /** Longitud mínima (por defecto: 1) */
    minLength?: number;
    /** Longitud máxima (por defecto: 100) */
    maxLength?: number;
    /** Patrón de caracteres permitidos */
    allowedPattern?: RegExp;
  } = {}
): boolean {
  const { minLength = 1, maxLength = 100, allowedPattern = /^[a-z0-9-]+$/ } = options;

  if (!slug || typeof slug !== 'string') {
    return false;
  }

  return slug.length >= minLength && slug.length <= maxLength && allowedPattern.test(slug);
}

/**
 * Normaliza un slug existente
 * @param slug - El slug a normalizar
 * @param options - Opciones de normalización
 * @returns El slug normalizado
 */
export function normalizeSlug(slug: string, options: Parameters<typeof generateSlug>[1] = {}): string {
  return generateSlug(slug, options);
}

/**
 * Remueve acentos de un texto
 * @param text - El texto a procesar
 * @returns El texto sin acentos
 */
function removeAccentsFromText(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Escapa caracteres especiales para usar en expresiones regulares
 * @param string - La cadena a escapar
 * @returns La cadena escapada
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Genera un slug para un producto
 * @param productName - El nombre del producto
 * @returns El slug del producto
 */
export function generateProductSlug(productName: string): string {
  return generateSlug(productName, {
    maxLength: 60,
    separator: '-',
  });
}

/**
 * Genera un slug para una colección
 * @param collectionName - El nombre de la colección
 * @returns El slug de la colección
 */
export function generateCollectionSlug(collectionName: string): string {
  return generateSlug(collectionName, {
    maxLength: 50,
    separator: '-',
  });
}

/**
 * Genera un slug para una página
 * @param pageTitle - El título de la página
 * @returns El slug de la página
 */
export function generatePageSlug(pageTitle: string): string {
  return generateSlug(pageTitle, {
    maxLength: 50,
    separator: '-',
  });
}
