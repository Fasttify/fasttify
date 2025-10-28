export function formatFileSize(bytes?: number): string {
  if (!bytes) return 'N/A';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export function formatDate(date?: Date): string {
  if (!date) return 'N/A';

  try {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const hours = Math.abs(Math.floor(diffTime / (1000 * 60 * 60)));
      const minutes = Math.abs(Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60)));

      if (hours > 0) {
        return `Hoy a las ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
      } else {
        return `Hoy a las ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
      }
    } else if (diffDays === -1) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  } catch {
    return 'Fecha inválida';
  }
}

export function getFileType(filename: string): string {
  const extension = filename.split('.').pop()?.toUpperCase();
  return extension || 'FILE';
}

export function getFileName(key: string): string {
  return key.split('/').pop() || 'unnamed';
}

export function getFileIcon(type?: string): string {
  const iconMap: Record<string, string> = {
    'image/jpeg': 'Image',
    'image/png': 'Image',
    'image/gif': 'Image',
    'image/webp': 'Image',
    'image/svg+xml': 'Image',
    'application/pdf': 'Document',
    'text/plain': 'Document',
  };
  return iconMap[type || ''] || 'Document';
}
