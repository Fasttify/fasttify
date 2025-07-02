import type { Page } from '@/app/store/hooks/data/usePage';

export function getStatusText(status: Page['status']) {
  switch (status) {
    case 'published':
      return 'Publicada';
    case 'draft':
      return 'Borrador';
    default:
      return status || 'Desconocido';
  }
}

export function getStatusTone(status: Page['status']) {
  switch (status) {
    case 'published':
      return 'success';
    case 'draft':
      return 'info';
    default:
      return 'info';
  }
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatVisibility(isVisible: boolean): string {
  return isVisible ? 'Visible' : 'Oculta';
}

export function getVisibilityTone(isVisible: boolean) {
  return isVisible ? 'success' : 'critical';
}

export function truncateContent(content: string, maxLength: number = 150): string {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}
