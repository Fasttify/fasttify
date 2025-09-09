import { ThemeFile } from '../types/editor-types';

// Generar ID único para archivo
export function generateFileId(path: string): string {
  return `file_${path.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
}

// Obtener nombre del archivo desde la ruta
export function getFileName(path: string): string {
  return path.split('/').pop() || path;
}

// Determinar tipo de archivo basado en la extensión
export function getFileType(path: string): ThemeFile['type'] {
  const extension = path.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'liquid':
      return 'liquid';
    case 'css':
      return 'css';
    case 'js':
      return 'js';
    case 'json':
      return 'json';
    case 'html':
    case 'htm':
      return 'html';
    default:
      return 'other';
  }
}

// Crear objeto ThemeFile desde datos del servidor
export function createThemeFileFromServer(file: any): ThemeFile {
  return {
    id: file.id || generateFileId(file.path),
    path: file.path,
    name: getFileName(file.path),
    content: file.content || '',
    type: getFileType(file.path),
    size: file.size || 0,
    lastModified: new Date(file.lastModified || Date.now()),
    isModified: false,
    isOpen: false,
  };
}

// Crear objeto ThemeFile para nuevo archivo
export function createNewThemeFile(filePath: string, content: string, id?: string): ThemeFile {
  return {
    id: id || generateFileId(filePath),
    path: filePath,
    name: getFileName(filePath),
    content,
    type: getFileType(filePath),
    size: content.length,
    lastModified: new Date(),
    isModified: false,
    isOpen: false,
  };
}
