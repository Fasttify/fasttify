export class FileUtils {
  private static readonly MIME_TYPES: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };

  /**
   * Genera un UUID v4 simple sin dependencias externas
   */
  public static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Genera un ID único corto para evitar nombres muy largos
   */
  public static generateShortId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Determina el tipo MIME basado en la extensión del archivo
   */
  public static getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return this.MIME_TYPES[extension] || 'application/octet-stream';
  }

  /**
   * Extrae el nombre del archivo de una clave S3
   */
  public static extractFilename(s3Key: string): string {
    const keyParts = s3Key.split('/');
    return keyParts[keyParts.length - 1];
  }

  /**
   * Genera una clave S3 única con timestamp y UUID para garantizar unicidad
   */
  public static generateS3Key(storeId: string, filename: string): string {
    const timestamp = new Date().getTime();
    const uniqueId = this.generateShortId();
    // Formato: products/storeId/timestamp-uniqueId-filename
    return `products/${storeId}/${timestamp}-${uniqueId}-${filename}`;
  }

  /**
   * Genera el prefijo para búsquedas en S3
   */
  public static generateStorePrefix(storeId: string, prefix?: string): string {
    return prefix ? `products/${storeId}/${prefix}` : `products/${storeId}/`;
  }
}

export class ValidationUtils {
  /**
   * Valida que el storeId esté presente
   */
  public static validateStoreId(storeId?: string): void {
    if (!storeId) {
      throw new Error('Store ID is required');
    }
  }

  /**
   * Valida que la acción sea válida
   */
  public static validateAction(action?: string): void {
    const validActions = ['list', 'upload', 'delete', 'batchUpload', 'batchDelete'];
    if (!action || !validActions.includes(action)) {
      throw new Error('Invalid action');
    }
  }

  /**
   * Valida los parámetros requeridos para upload
   */
  public static validateUploadParams(filename?: string, contentType?: string, fileContent?: string): void {
    if (!filename || !contentType || !fileContent) {
      throw new Error('filename, contentType, and fileContent are required for upload');
    }
  }

  /**
   * Valida los parámetros requeridos para batch upload
   */
  public static validateBatchUploadParams(
    files?: { filename: string; contentType: string; fileContent: string }[]
  ): void {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('At least one file is required for batch upload');
    }

    // Reducir límite a 25 archivos para evitar problemas de payload con API Gateway
    if (files.length > 25) {
      throw new Error('Maximum of 25 files can be uploaded in a single batch');
    }

    // Validar cada archivo en el lote
    files.forEach((file, index) => {
      if (!file.filename || !file.contentType || !file.fileContent) {
        throw new Error(`Invalid file data at index ${index}: filename, contentType, and fileContent are required`);
      }
    });
  }

  /**
   * Valida los parámetros requeridos para delete
   */
  public static validateDeleteParams(key?: string): void {
    if (!key) {
      throw new Error('key is required for delete');
    }
  }

  /**
   * Valida los parámetros requeridos para batch delete
   */
  public static validateBatchDeleteParams(keys?: string[]): void {
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      throw new Error('At least one key is required for batch delete');
    }

    // Mantener límite de 50 para delete ya que los keys son pequeños
    if (keys.length > 50) {
      throw new Error('Maximum of 50 keys can be deleted in a single batch');
    }

    // Validar cada clave en el lote
    keys.forEach((key, index) => {
      if (!key) {
        throw new Error(`Invalid key at index ${index}: key cannot be empty`);
      }
    });
  }
}
