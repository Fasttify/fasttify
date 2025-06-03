export class FileUtils {
  private static readonly MIME_TYPES: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  }

  /**
   * Genera un UUID v4 simple sin dependencias externas
   */
  public static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  /**
   * Genera un ID único corto para evitar nombres muy largos
   */
  public static generateShortId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  /**
   * Determina el tipo MIME basado en la extensión del archivo
   */
  public static getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || ''
    return this.MIME_TYPES[extension] || 'application/octet-stream'
  }

  /**
   * Extrae el nombre del archivo de una clave S3
   */
  public static extractFilename(s3Key: string): string {
    const keyParts = s3Key.split('/')
    return keyParts[keyParts.length - 1]
  }

  /**
   * Genera una clave S3 única con timestamp y UUID para garantizar unicidad
   */
  public static generateS3Key(storeId: string, filename: string): string {
    const timestamp = new Date().getTime()
    const uniqueId = this.generateShortId()
    // Formato: products/storeId/timestamp-uniqueId-filename
    return `products/${storeId}/${timestamp}-${uniqueId}-${filename}`
  }

  /**
   * Genera el prefijo para búsquedas en S3
   */
  public static generateStorePrefix(storeId: string, prefix?: string): string {
    return prefix ? `products/${storeId}/${prefix}` : `products/${storeId}/`
  }
}

export class ValidationUtils {
  /**
   * Valida que el storeId esté presente
   */
  public static validateStoreId(storeId?: string): void {
    if (!storeId) {
      throw new Error('Store ID is required')
    }
  }

  /**
   * Valida que la acción sea válida
   */
  public static validateAction(action?: string): void {
    const validActions = ['list', 'upload', 'delete']
    if (!action || !validActions.includes(action)) {
      throw new Error('Invalid action')
    }
  }

  /**
   * Valida los parámetros requeridos para upload
   */
  public static validateUploadParams(
    filename?: string,
    contentType?: string,
    fileContent?: string
  ): void {
    if (!filename || !contentType || !fileContent) {
      throw new Error('filename, contentType, and fileContent are required for upload')
    }
  }

  /**
   * Valida los parámetros requeridos para delete
   */
  public static validateDeleteParams(key?: string): void {
    if (!key) {
      throw new Error('key is required for delete')
    }
  }
}
