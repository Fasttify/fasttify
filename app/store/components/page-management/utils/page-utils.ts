import { IPage } from '../types/page-types'

export function getStatusText(status: IPage['status']) {
  switch (status) {
    case 'active':
      return 'Activa'
    case 'draft':
      return 'Borrador'
    case 'inactive':
      return 'Inactiva'
    default:
      return 'Desconocido'
  }
}

export function getStatusTone(status: IPage['status']) {
  switch (status) {
    case 'active':
      return 'success'
    case 'draft':
      return 'info'
    case 'inactive':
      return 'critical'
    default:
      return 'info'
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .trim()
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-'

  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatVisibility(isVisible: boolean): string {
  return isVisible ? 'Visible' : 'Oculta'
}

export function getVisibilityTone(isVisible: boolean) {
  return isVisible ? 'success' : 'critical'
}

export function truncateContent(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}
