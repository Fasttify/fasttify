/**
 * Constantes para el módulo de tiendas
 */

/**
 * Configuración de dominios
 */
export const DOMAIN_CONFIG = {
  BASE_DOMAIN: 'fasttify.com',
  WWW_DOMAIN: 'www.fasttify.com',
  LOCALHOST: 'localhost',
} as const;

/**
 * Header names para extracción de hostname
 */
export const HEADER_NAMES = {
  X_ORIGINAL_HOST: 'x-original-host',
  X_FORWARDED_HOST: 'x-forwarded-host',
  HOST: 'host',
  CF_CONNECTING_IP: 'cf-connecting-ip',
} as const;

/**
 * Protocolos y separadores
 */
export const URL_CONFIG = {
  PROTOCOL: 'https://',
  PORT_SEPARATOR: ':',
} as const;

/**
 * Tipos de errores
 */
export const ERROR_TYPES = {
  STORE_NOT_FOUND: 'STORE_NOT_FOUND',
} as const;

/**
 * Códigos de estado HTTP
 */
export const HTTP_STATUS = {
  NOT_FOUND: 404,
} as const;

/**
 * Assets comunes que los navegadores solicitan automáticamente
 */
export const COMMON_ASSETS = [
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'apple-touch-icon.png',
  'manifest.json',
] as const;

/**
 * Extensiones de archivos consideradas como assets estáticos
 */
export const ASSET_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.ico',
  '.css',
  '.js',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.json',
  '.xml',
  '.txt',
] as const;

/**
 * Patrones de paths que indican assets
 */
export const ASSET_PATH_PATTERNS = {
  ASSETS_FOLDER: '/assets/',
  NEXT_FOLDER: '/_next/',
  ICONS_FOLDER: '/icons/',
} as const;
