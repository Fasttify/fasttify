/**
 * Utilidades compartidas para operaciones de S3
 */

/**
 * Función auxiliar para dividir arrays en chunks
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * Convierte un archivo a base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = error => reject(error)
  })
}

/**
 * Genera un ID único para compatibilidad hacia atrás cuando las imágenes
 * existentes no tienen el campo id
 */
export function generateFallbackId(key: string, filename: string): string {
  // Crear hash simple del key
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Extraer timestamp del key si está disponible
  const timestampMatch = key.match(/\/(\d+)-/)
  const timestamp = timestampMatch ? timestampMatch[1] : Date.now().toString()

  return `fallback_${Math.abs(hash)}_${timestamp}`
}

/**
 * Formatea el tamaño de archivo en bytes a formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Valida si un archivo es una imagen válida
 */
export function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Obtiene la extensión de un archivo
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Calcula el tamaño total de un array de archivos
 */
export function getTotalFileSize(files: File[]): number {
  return files.reduce((total, file) => total + file.size, 0)
}
