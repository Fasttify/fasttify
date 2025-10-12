import type { S3Image } from '@/app/store/hooks/storage/useS3Images';
import type { FilterState } from '../hooks/useImageFilters';

/**
 * Obtiene la extensión del archivo para determinar el tipo
 */
function getFileType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  // Imágenes
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
    return 'images';
  }

  // Videos
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
    return 'videos';
  }

  // Videos externos (URLs de YouTube, Vimeo, etc.)
  if (filename.includes('youtube') || filename.includes('vimeo') || filename.includes('youtu.be')) {
    return 'external-videos';
  }

  // Modelos 3D
  if (['obj', 'fbx', 'gltf', 'glb', '3ds', 'dae'].includes(extension)) {
    return '3d';
  }

  return 'other';
}

/**
 * Determina el tamaño del archivo basado en el tamaño en bytes
 */
function getFileSizeCategory(sizeInBytes: number): string {
  const sizeInMB = sizeInBytes / (1024 * 1024);

  if (sizeInMB < 1) return 'small';
  if (sizeInMB <= 5) return 'medium';
  return 'large';
}

/**
 * Filtra imágenes por término de búsqueda
 */
function filterBySearchTerm(images: S3Image[], searchTerm: string): S3Image[] {
  if (!searchTerm.trim()) return images;

  const lowerSearchTerm = searchTerm.toLowerCase().trim();

  return images.filter((image) => {
    const filename = image.filename.toLowerCase();

    // Búsqueda exacta
    if (filename.includes(lowerSearchTerm)) return true;

    // Búsqueda por palabras
    const searchWords = lowerSearchTerm.split(/\s+/);
    return searchWords.every((word) => filename.includes(word));
  });
}

/**
 * Filtra imágenes por tipos de archivo
 */
function filterByFileTypes(images: S3Image[], fileTypes: string[]): S3Image[] {
  if (fileTypes.length === 0) return images;

  return images.filter((image) => {
    const imageType = getFileType(image.filename);
    return fileTypes.includes(imageType);
  });
}

/**
 * Filtra imágenes por tamaño de archivo
 */
function filterByFileSizes(images: S3Image[], fileSizes: string[]): S3Image[] {
  if (fileSizes.length === 0) return images;

  return images.filter((image) => {
    const sizeCategory = getFileSizeCategory(image.size || 0);
    return fileSizes.includes(sizeCategory);
  });
}

/**
 * Filtra imágenes por dónde se usan (placeholder para futura implementación)
 */
function filterByUsedIn(images: S3Image[], _usedIn: string[]): S3Image[] {
  // TODO: Implementar cuando tengamos la relación de uso
  // Por ahora retorna todas las imágenes
  return images;
}

/**
 * Filtra imágenes por productos (placeholder para futura implementación)
 */
function filterByProducts(images: S3Image[], _products: string[]): S3Image[] {
  // TODO: Implementar cuando tengamos la relación con productos
  // Por ahora retorna todas las imágenes
  return images;
}

/**
 * Ordena imágenes según el criterio especificado
 */
function sortImages(images: S3Image[], sortBy: string): S3Image[] {
  const sortedImages = [...images];

  switch (sortBy) {
    case 'date-asc':
      return sortedImages.sort((a, b) => {
        const dateA = new Date(a.lastModified || 0).getTime();
        const dateB = new Date(b.lastModified || 0).getTime();
        return dateA - dateB;
      });

    case 'date-desc':
      return sortedImages.sort((a, b) => {
        const dateA = new Date(a.lastModified || 0).getTime();
        const dateB = new Date(b.lastModified || 0).getTime();
        return dateB - dateA;
      });

    case 'name-asc':
      return sortedImages.sort((a, b) => a.filename.localeCompare(b.filename));

    case 'name-desc':
      return sortedImages.sort((a, b) => b.filename.localeCompare(a.filename));

    case 'size-asc':
      return sortedImages.sort((a, b) => (a.size || 0) - (b.size || 0));

    case 'size-desc':
      return sortedImages.sort((a, b) => (b.size || 0) - (a.size || 0));

    default:
      return sortedImages;
  }
}

/**
 * Función principal para filtrar y ordenar imágenes
 */
export function filterAndSortImages(images: S3Image[], filters: FilterState): S3Image[] {
  let filteredImages = images;

  // Aplicar filtros en orden de eficiencia (menos restrictivos primero)
  filteredImages = filterBySearchTerm(filteredImages, filters.searchTerm);
  filteredImages = filterByFileTypes(filteredImages, filters.fileTypes);
  filteredImages = filterByFileSizes(filteredImages, filters.fileSizes);
  filteredImages = filterByUsedIn(filteredImages, filters.usedIn);
  filteredImages = filterByProducts(filteredImages, filters.products);

  // Ordenar al final
  filteredImages = sortImages(filteredImages, filters.sortBy);

  return filteredImages;
}

/**
 * Hook para obtener estadísticas de filtrado
 */
export function getFilterStats(images: S3Image[], filteredImages: S3Image[]) {
  const totalImages = images.length;
  const filteredCount = filteredImages.length;
  const filteredOut = totalImages - filteredCount;

  return {
    totalImages,
    filteredCount,
    filteredOut,
    isFiltered: filteredCount < totalImages,
    filterEfficiency: totalImages > 0 ? (filteredCount / totalImages) * 100 : 100,
  };
}
