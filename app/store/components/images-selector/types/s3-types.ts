export interface S3Image {
  key: string;
  url: string;
  filename: string;
  lastModified?: Date;
  size?: number;
  type?: string;
  id?: string;
}

// Resultado de la operación de carga por lotes
export interface BatchUploadResult {
  successfulImages: S3Image[];
  failedUploads: { filename: string; error: string }[];
  totalProcessed: number;
}

// Resultado de la operación de eliminación por lotes
export interface BatchDeleteResult {
  successCount: number;
  failedDeletes: { key: string; error: string }[];
  totalProcessed: number;
}

// Respuesta del API para operaciones por lotes
export interface S3BatchResponse {
  images?: S3Image[];
  success?: boolean;
  image?: S3Image;
  nextContinuationToken?: string;
  // Para operaciones por lotes
  failed?: {
    filename: string;
    error: string;
  }[];
  successCount?: number;
  failedKeys?: {
    key: string;
    error: string;
  }[];
}

// Configuración para chunking
export const UPLOAD_CHUNK_SIZE = 10; // Máximo 10 imágenes por chunk para evitar límite de API Gateway
export const DELETE_CHUNK_SIZE = 20; // Para delete podemos usar chunks más grandes

// Archivo preparado para upload
export interface FileForUpload {
  filename: string;
  contentType: string;
  fileContent: string;
}
