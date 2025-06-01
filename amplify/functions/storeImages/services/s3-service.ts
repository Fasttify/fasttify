import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2CommandOutput,
  _Object,
} from '@aws-sdk/client-s3'
import {
  ImageItem,
  ListImagesResponse,
  UploadImageResponse,
  DeleteImageResponse,
} from '../types/types'
import { ConfigService } from '../config/config'
import { FileUtils } from './utils'

export class S3Service {
  private static instance: S3Service
  private readonly s3Client: S3Client
  private readonly configService: ConfigService

  private constructor() {
    this.s3Client = new S3Client()
    this.configService = ConfigService.getInstance()
  }

  public static getInstance(): S3Service {
    if (!S3Service.instance) {
      S3Service.instance = new S3Service()
    }
    return S3Service.instance
  }

  /**
   * Lista imágenes de una tienda con paginación optimizada
   */
  public async listImages(
    storeId: string,
    limit: number = 18,
    prefix: string = '',
    continuationToken?: string
  ): Promise<ListImagesResponse> {
    try {
      const config = this.configService.getConfig()
      const storePrefix = FileUtils.generateStorePrefix(storeId, prefix)

      const listCommand = new ListObjectsV2Command({
        Bucket: config.bucketName,
        Prefix: storePrefix,
        MaxKeys: limit,
        ContinuationToken: continuationToken,
      })

      const listResponse: ListObjectsV2CommandOutput = await this.s3Client.send(listCommand)

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        return { images: [] }
      }

      // Procesamiento optimizado con filtrado temprano
      const validContents = listResponse.Contents.filter(
        item => item.Key && !item.Key.endsWith('/')
      )

      const images: ImageItem[] = validContents.map(item => this.createImageItemFromS3Object(item))

      return {
        images,
        nextContinuationToken: listResponse.NextContinuationToken,
      }
    } catch (error) {
      console.error('Error listing images:', error)
      throw new Error('Failed to list images')
    }
  }

  /**
   * Sube una imagen optimizada con validación previa
   */
  public async uploadImage(
    storeId: string,
    filename: string,
    contentType: string,
    fileContent: string
  ): Promise<UploadImageResponse> {
    try {
      const config = this.configService.getConfig()

      // Validación temprana del contenido base64
      if (!this.isValidBase64(fileContent)) {
        throw new Error('Invalid file content format')
      }

      const buffer = Buffer.from(fileContent, 'base64')
      const key = FileUtils.generateS3Key(storeId, filename)

      const putCommand = new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'max-age=31536000', // 1 año de cache
        Metadata: {
          storeId,
          originalFilename: filename,
          uploadDate: new Date().toISOString(),
        },
      })

      await this.s3Client.send(putCommand)

      const image = this.createImageItem(key, {
        filename,
        lastModified: new Date(),
        size: buffer.length,
        type: contentType,
      })

      return { image }
    } catch (error) {
      console.error('Error uploading image:', error)
      throw new Error('Failed to upload image')
    }
  }

  /**
   * Elimina una imagen con validación de seguridad
   */
  public async deleteImage(key: string): Promise<DeleteImageResponse> {
    try {
      const config = this.configService.getConfig()

      // Validación de seguridad: asegurar que la clave pertenece a productos
      if (!key.startsWith('products/')) {
        throw new Error('Invalid key: can only delete product images')
      }

      const deleteCommand = new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      })

      await this.s3Client.send(deleteCommand)

      return { success: true }
    } catch (error) {
      console.error('Error deleting image:', error)
      throw new Error('Failed to delete image')
    }
  }

  /**
   * Crea un objeto ImageItem desde un objeto S3 con metadatos completos
   */
  private createImageItemFromS3Object(s3Object: _Object): ImageItem {
    const key = s3Object.Key!
    const filename = FileUtils.extractFilename(key)
    const url = this.configService.generateImageUrl(key)
    const fileType = FileUtils.getFileType(filename)

    return {
      key,
      url,
      filename,
      lastModified: s3Object.LastModified || new Date(),
      size: s3Object.Size || 0,
      type: fileType,
    }
  }

  /**
   * Crea un objeto ImageItem optimizado para nuevas subidas
   */
  private createImageItem(key: string, override?: Partial<ImageItem>): ImageItem {
    const filename = FileUtils.extractFilename(key)
    const url = this.configService.generateImageUrl(key)
    const fileType = FileUtils.getFileType(filename)

    return {
      key,
      url,
      filename,
      lastModified: override?.lastModified || new Date(),
      size: override?.size || 0,
      type: override?.type || fileType,
    }
  }

  /**
   * Valida si el contenido es base64 válido
   */
  private isValidBase64(str: string): boolean {
    try {
      return Buffer.from(str, 'base64').toString('base64') === str
    } catch (error) {
      return false
    }
  }
}
