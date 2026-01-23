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
 * Utilidades para manejo de archivos y tipos MIME
 */

/**
 * Determina el Content-Type basado en la extensión del archivo
 * @param filename - Nombre del archivo o clave S3
 * @returns Content-Type MIME string
 */
export function getContentType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    // Documentos web
    case 'html':
    case 'htm':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'js':
    case 'mjs':
      return 'application/javascript';
    case 'json':
      return 'application/json';
    case 'jsonld':
      return 'application/ld+json';
    case 'xml':
      return 'application/xml';
    case 'rss':
      return 'application/rss+xml';
    case 'atom':
      return 'application/atom+xml';
    case 'txt':
      return 'text/plain';
    case 'md':
    case 'markdown':
      return 'text/markdown';
    case 'liquid':
      return 'text/plain';
    case 'scss':
    case 'sass':
      return 'text/scss';
    case 'less':
      return 'text/less';
    case 'styl':
      return 'text/stylus';
    case 'ts':
    case 'typescript':
      return 'application/typescript';
    case 'tsx':
      return 'application/typescript';
    case 'jsx':
      return 'application/javascript';
    case 'vue':
      return 'text/vue';
    case 'svelte':
      return 'text/svelte';

    // Imágenes
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    case 'ico':
      return 'image/x-icon';
    case 'bmp':
      return 'image/bmp';
    case 'tiff':
    case 'tif':
      return 'image/tiff';
    case 'avif':
      return 'image/avif';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';

    // Fuentes
    case 'woff':
      return 'font/woff';
    case 'woff2':
      return 'font/woff2';
    case 'ttf':
      return 'font/ttf';
    case 'otf':
      return 'font/otf';
    case 'eot':
      return 'application/vnd.ms-fontobject';

    // Audio
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'ogg':
      return 'audio/ogg';
    case 'aac':
      return 'audio/aac';
    case 'flac':
      return 'audio/flac';
    case 'm4a':
      return 'audio/mp4';

    // Video
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'avi':
      return 'video/x-msvideo';
    case 'mov':
      return 'video/quicktime';
    case 'wmv':
      return 'video/x-ms-wmv';
    case 'flv':
      return 'video/x-flv';
    case 'mkv':
      return 'video/x-matroska';

    // Documentos
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'odt':
      return 'application/vnd.oasis.opendocument.text';
    case 'ods':
      return 'application/vnd.oasis.opendocument.spreadsheet';
    case 'odp':
      return 'application/vnd.oasis.opendocument.presentation';

    // Archivos comprimidos
    case 'zip':
      return 'application/zip';
    case 'rar':
      return 'application/vnd.rar';
    case '7z':
      return 'application/x-7z-compressed';
    case 'tar':
      return 'application/x-tar';
    case 'gz':
      return 'application/gzip';
    case 'bz2':
      return 'application/x-bzip2';
    case 'xz':
      return 'application/x-xz';

    // Archivos de código
    case 'py':
      return 'text/x-python';
    case 'java':
      return 'text/x-java-source';
    case 'c':
      return 'text/x-c';
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'text/x-c++';
    case 'h':
    case 'hpp':
      return 'text/x-c++';
    case 'cs':
      return 'text/x-csharp';
    case 'php':
      return 'text/x-php';
    case 'rb':
      return 'text/x-ruby';
    case 'go':
      return 'text/x-go';
    case 'rs':
      return 'text/x-rust';
    case 'swift':
      return 'text/x-swift';
    case 'kt':
      return 'text/x-kotlin';
    case 'scala':
      return 'text/x-scala';
    case 'clj':
      return 'text/x-clojure';
    case 'hs':
      return 'text/x-haskell';
    case 'elm':
      return 'text/x-elm';
    case 'erl':
      return 'text/x-erlang';
    case 'ex':
    case 'exs':
      return 'text/x-elixir';
    case 'lua':
      return 'text/x-lua';
    case 'pl':
      return 'text/x-perl';
    case 'sh':
    case 'bash':
      return 'text/x-shellscript';
    case 'ps1':
      return 'text/x-powershell';
    case 'bat':
    case 'cmd':
      return 'text/x-msdos-batch';
    case 'dockerfile':
      return 'text/x-dockerfile';
    case 'yaml':
    case 'yml':
      return 'application/x-yaml';
    case 'toml':
      return 'application/toml';
    case 'ini':
      return 'text/x-ini';
    case 'conf':
      return 'text/x-config';
    case 'env':
      return 'text/x-env';
    case 'log':
      return 'text/x-log';

    // Archivos de datos
    case 'csv':
      return 'text/csv';
    case 'sql':
      return 'text/x-sql';
    case 'db':
      return 'application/x-sqlite3';
    case 'sqlite':
      return 'application/x-sqlite3';

    // Archivos de configuración web
    case 'htaccess':
      return 'text/x-apache';
    case 'nginx':
      return 'text/x-nginx';
    case 'robots':
      return 'text/plain';
    case 'sitemap':
      return 'application/xml';
    case 'manifest':
      return 'application/manifest+json';

    // Archivos 3D y CAD
    case 'obj':
      return 'model/obj';
    case 'mtl':
      return 'model/mtl';
    case 'gltf':
      return 'model/gltf+json';
    case 'glb':
      return 'model/gltf-binary';
    case 'stl':
      return 'model/stl';
    case 'ply':
      return 'model/ply';
    case 'dae':
      return 'model/vnd.collada+xml';

    // Archivos de mapas y geodatos
    case 'kml':
      return 'application/vnd.google-earth.kml+xml';
    case 'kmz':
      return 'application/vnd.google-earth.kmz';
    case 'gpx':
      return 'application/gpx+xml';
    case 'geojson':
      return 'application/geo+json';

    // Archivos de seguridad
    case 'pem':
      return 'application/x-pem-file';
    case 'key':
      return 'application/x-pem-file';
    case 'crt':
      return 'application/x-x509-ca-cert';
    case 'cer':
      return 'application/x-x509-ca-cert';
    case 'p12':
      return 'application/x-pkcs12';
    case 'pfx':
      return 'application/x-pkcs12';

    // Archivos de sistema
    case 'iso':
      return 'application/x-iso9660-image';
    case 'dmg':
      return 'application/x-apple-diskimage';
    case 'deb':
      return 'application/vnd.debian.binary-package';
    case 'rpm':
      return 'application/x-rpm';
    case 'msi':
      return 'application/x-msi';
    case 'exe':
      return 'application/x-msdownload';
    case 'dll':
      return 'application/x-msdownload';
    case 'so':
      return 'application/x-sharedlib';
    case 'dylib':
      return 'application/x-mach-binary';

    default:
      return 'application/octet-stream';
  }
}

/**
 * Verifica si un archivo es una imagen basándose en su extensión
 * @param filename - Nombre del archivo
 * @returns true si es una imagen
 */
export function isImageFile(filename: string): boolean {
  const contentType = getContentType(filename);
  return contentType.startsWith('image/');
}

/**
 * Verifica si un archivo es un video basándose en su extensión
 * @param filename - Nombre del archivo
 * @returns true si es un video
 */
export function isVideoFile(filename: string): boolean {
  const contentType = getContentType(filename);
  return contentType.startsWith('video/');
}

/**
 * Verifica si un archivo es audio basándose en su extensión
 * @param filename - Nombre del archivo
 * @returns true si es audio
 */
export function isAudioFile(filename: string): boolean {
  const contentType = getContentType(filename);
  return contentType.startsWith('audio/');
}

/**
 * Verifica si un archivo es una fuente basándose en su extensión
 * @param filename - Nombre del archivo
 * @returns true si es una fuente
 */
export function isFontFile(filename: string): boolean {
  const contentType = getContentType(filename);
  return contentType.startsWith('font/') || contentType === 'application/vnd.ms-fontobject';
}

/**
 * Verifica si un archivo es texto basándose en su extensión
 * @param filename - Nombre del archivo
 * @returns true si es texto
 */
export function isTextFile(filename: string): boolean {
  const contentType = getContentType(filename);
  return (
    contentType.startsWith('text/') ||
    contentType === 'application/json' ||
    contentType === 'application/xml' ||
    contentType === 'application/javascript' ||
    contentType === 'application/typescript'
  );
}

/**
 * Verifica si un archivo es binario basándose en su extensión
 * @param filename - Nombre del archivo
 * @returns true si es binario
 */
export function isBinaryFile(filename: string): boolean {
  const contentType = getContentType(filename);
  return (
    contentType === 'application/octet-stream' ||
    contentType.startsWith('image/') ||
    contentType.startsWith('video/') ||
    contentType.startsWith('audio/') ||
    contentType.startsWith('font/') ||
    contentType === 'application/vnd.ms-fontobject' ||
    contentType === 'application/pdf' ||
    contentType === 'application/zip' ||
    contentType.startsWith('application/vnd.')
  );
}

/**
 * Obtiene la extensión de un archivo
 * @param filename - Nombre del archivo
 * @returns La extensión sin el punto, o cadena vacía si no tiene extensión
 */
export function getFileExtension(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension || '';
}

/**
 * Obtiene el nombre del archivo sin la extensión
 * @param filename - Nombre del archivo
 * @returns El nombre sin extensión
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
}

/**
 * Verifica si una extensión está en la lista de extensiones permitidas
 * @param filename - Nombre del archivo
 * @param allowedExtensions - Array de extensiones permitidas (con o sin punto)
 * @returns true si la extensión está permitida
 */
export function isExtensionAllowed(filename: string, allowedExtensions: string[]): boolean {
  const extension = getFileExtension(filename);
  return allowedExtensions.some((ext) => ext.toLowerCase().replace('.', '') === extension);
}

/**
 * Obtiene el tamaño de archivo en formato legible
 * @param bytes - Tamaño en bytes
 * @returns String con el tamaño formateado
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
