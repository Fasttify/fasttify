'use client';

import { useMemo } from 'react';

export function useContentFormatting() {
  const formatFileSize = useMemo(
    () => (bytes?: number) => {
      if (!bytes) return 'N/A';

      const units = ['B', 'KB', 'MB', 'GB'];
      let size = bytes;
      let unitIndex = 0;

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      return `${size.toFixed(2)} ${units[unitIndex]}`;
    },
    []
  );

  const formatDate = useMemo(
    () => (date?: Date) => {
      if (!date) return 'N/A';

      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return `Today at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
      } else if (diffDays === -1) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    },
    []
  );

  return {
    formatFileSize,
    formatDate,
  };
}
