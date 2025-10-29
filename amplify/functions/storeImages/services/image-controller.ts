import {
  APIGatewayEvent,
  APIGatewayResponse,
  RequestBody,
  ListImagesResponse,
  UploadImageResponse,
  DeleteImageResponse,
  BatchUploadResponse,
  BatchDeleteResponse,
  BatchPresignedUrlsResponse,
  PresignedUrlResponse,
  ErrorResponse,
} from '../types/types';
import { S3Service } from './s3-service';
import { ValidationUtils } from './utils';
import { getCorsHeaders } from '../../shared/cors';

export class ImageController {
  private readonly s3Service: S3Service;

  constructor() {
    this.s3Service = S3Service.getInstance();
  }

  /**
   * Maneja las solicitudes OPTIONS para CORS
   */
  public handleOptions(origin?: string): APIGatewayResponse {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    };
  }

  /**
   * Procesa la solicitud principal y delega a la acción correspondiente
   */
  public async processRequest(event: APIGatewayEvent): Promise<APIGatewayResponse> {
    const origin = event.headers?.origin || event.headers?.Origin;

    try {
      const body: RequestBody = event.body ? JSON.parse(event.body) : {};

      // Validaciones tempranas
      ValidationUtils.validateStoreId(body.storeId);
      ValidationUtils.validateAction(body.action);

      // Delegar a la acción correspondiente
      switch (body.action) {
        case 'list':
          return await this.handleListImages(body, origin);
        case 'upload':
          return await this.handleUploadImage(body, origin);
        case 'delete':
          return await this.handleDeleteImage(body, origin);
        case 'batchUpload':
          return await this.handleBatchUploadImages(body, origin);
        case 'batchDelete':
          return await this.handleBatchDeleteImages(body, origin);
        case 'generatePresignedUrl':
          return await this.handleGeneratePresignedUrl(body, origin);
        case 'generateBatchPresignedUrls':
          return await this.handleGenerateBatchPresignedUrls(body, origin);
        default:
          return this.createErrorResponse(400, 'Invalid action', origin);
      }
    } catch (error) {
      console.error('Error processing request:', error);
      const message = error instanceof Error ? error.message : 'Error processing request';
      return this.createErrorResponse(500, message, origin);
    }
  }

  /**
   * Maneja la operación de listar imágenes
   */
  private async handleListImages(body: RequestBody, origin?: string): Promise<APIGatewayResponse> {
    try {
      const result: ListImagesResponse = await this.s3Service.listImages(
        body.storeId,
        body.limit || 18,
        body.prefix || '',
        body.continuationToken
      );

      return this.createSuccessResponse(result, origin);
    } catch (error) {
      console.error('Error listing images:', error);
      return this.createErrorResponse(500, 'Error listing images', origin);
    }
  }

  /**
   * Maneja la operación de subir imagen
   */
  private async handleUploadImage(body: RequestBody, origin?: string): Promise<APIGatewayResponse> {
    try {
      ValidationUtils.validateUploadParams(body.filename, body.contentType, body.fileContent);

      const result: UploadImageResponse = await this.s3Service.uploadImage(
        body.storeId,
        body.filename!,
        body.contentType!,
        body.fileContent!
      );

      return this.createSuccessResponse(result, origin);
    } catch (error) {
      console.error('Error uploading image:', error);
      const message = error instanceof Error ? error.message : 'Error uploading image';
      return this.createErrorResponse(500, message, origin);
    }
  }

  /**
   * Maneja la operación de subida de múltiples imágenes en lote
   */
  private async handleBatchUploadImages(body: RequestBody, origin?: string): Promise<APIGatewayResponse> {
    try {
      ValidationUtils.validateBatchUploadParams(body.files);

      console.log(`Starting batch upload of ${body.files!.length} images for store ${body.storeId}`);

      const result: BatchUploadResponse = await this.s3Service.batchUploadImages(body.storeId, body.files!);

      // Log de estadísticas para monitoreo de rendimiento
      console.log(`Batch upload completed: ${result.images.length} successful, ${result.failed?.length || 0} failed`);

      return this.createSuccessResponse(result, origin);
    } catch (error) {
      console.error('Error in batch upload:', error);
      const message = error instanceof Error ? error.message : 'Error processing batch upload';
      return this.createErrorResponse(500, message, origin);
    }
  }

  /**
   * Maneja la operación de eliminar imagen
   */
  private async handleDeleteImage(body: RequestBody, origin?: string): Promise<APIGatewayResponse> {
    try {
      ValidationUtils.validateDeleteParams(body.key);

      const result: DeleteImageResponse = await this.s3Service.deleteImage(body.key!);

      return this.createSuccessResponse(result, origin);
    } catch (error) {
      console.error('Error deleting image:', error);
      const message = error instanceof Error ? error.message : 'Error deleting image';
      return this.createErrorResponse(500, message, origin);
    }
  }

  /**
   * Maneja la operación de eliminación de múltiples imágenes en lote
   */
  private async handleBatchDeleteImages(body: RequestBody, origin?: string): Promise<APIGatewayResponse> {
    try {
      ValidationUtils.validateBatchDeleteParams(body.keys);

      console.log(`Starting batch delete of ${body.keys!.length} images`);

      const result: BatchDeleteResponse = await this.s3Service.batchDeleteImages(body.keys!);

      console.log(
        `Batch delete completed: ${result.successCount} successful, ${result.failedKeys?.length || 0} failed`
      );

      return this.createSuccessResponse(result, origin);
    } catch (error) {
      console.error('Error in batch delete:', error);
      const message = error instanceof Error ? error.message : 'Error processing batch delete';
      return this.createErrorResponse(500, message, origin);
    }
  }

  /**
   * Maneja la operación de generar URL presignada para subir imagen directamente a S3
   */
  private async handleGeneratePresignedUrl(body: RequestBody, origin?: string): Promise<APIGatewayResponse> {
    try {
      ValidationUtils.validatePresignedUrlParams(body.filename, body.contentType);

      const expiresIn = body.expiresIn || 900; // 15 minutos por defecto

      console.log(`Generating presigned URL for ${body.filename} (expires in ${expiresIn}s)`);

      const result: PresignedUrlResponse = await this.s3Service.generatePresignedUrl(
        body.storeId,
        body.filename!,
        body.contentType!,
        expiresIn
      );

      console.log(`Presigned URL generated successfully for ${body.filename}`);

      return this.createSuccessResponse(result, origin);
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      const message = error instanceof Error ? error.message : 'Error generating presigned URL';
      return this.createErrorResponse(500, message, origin);
    }
  }

  /**
   * Maneja la operación de generar múltiples URLs presignadas en lote
   */
  private async handleGenerateBatchPresignedUrls(body: RequestBody, origin?: string): Promise<APIGatewayResponse> {
    try {
      ValidationUtils.validateBatchPresignedUrlsParams(body.filesInfo);

      const expiresIn = body.expiresIn || 900; // 15 minutos por defecto

      console.log(`Generating batch presigned URLs for ${body.filesInfo!.length} files (expires in ${expiresIn}s)`);

      const result: BatchPresignedUrlsResponse = await this.s3Service.generateBatchPresignedUrls(
        body.storeId,
        body.filesInfo!,
        expiresIn
      );

      console.log(`Batch presigned URLs generated successfully for ${body.filesInfo!.length} files`);

      return this.createSuccessResponse(result, origin);
    } catch (error) {
      console.error('Error generating batch presigned URLs:', error);
      const message = error instanceof Error ? error.message : 'Error generating batch presigned URLs';
      return this.createErrorResponse(500, message, origin);
    }
  }

  /**
   * Crea una respuesta de éxito estandarizada
   */
  private createSuccessResponse(data: any, origin?: string): APIGatewayResponse {
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: getCorsHeaders(origin),
    };
  }

  /**
   * Crea una respuesta de error estandarizada
   */
  private createErrorResponse(statusCode: number, message: string, origin?: string): APIGatewayResponse {
    const errorResponse: ErrorResponse = { message };

    return {
      statusCode,
      body: JSON.stringify(errorResponse),
      headers: getCorsHeaders(origin),
    };
  }
}
