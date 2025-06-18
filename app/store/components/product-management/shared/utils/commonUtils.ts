import { IProduct } from '@/app/store/hooks/data/useProducts'

export function isEmpty(value: string[] | undefined | null): boolean {
  if (!value) {
    return true
  }
  return value.length === 0
}

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return '$0'
  }
  return `$${Number(price).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

export function getStatusText(status: IProduct['status']) {
  switch (status) {
    case 'active':
      return 'Activo'
    case 'draft':
      return 'Borrador'
    case 'archived':
      return 'Archivado'
    case 'pending':
      return 'Pendiente'
    case 'inactive':
      return 'Inactivo'
    default:
      return 'Desconocido'
  }
}

export function getStatusTone(status: IProduct['status']) {
  switch (status) {
    case 'active':
      return 'success'
    case 'draft':
      return 'info'
    case 'archived':
      return 'critical'
    case 'pending':
      return 'warning'
    default:
      return 'info'
  }
}
