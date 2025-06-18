export interface APIGatewayEvent {
  httpMethod: string
  headers?: { [key: string]: string }
  body?: string
}

export interface APIGatewayResponse {
  statusCode: number
  body: string
  headers: { [key: string]: string }
}

export interface RequestBody {
  action: 'list' | 'upload' | 'delete' | 'batchUpload' | 'batchDelete'
  storeId: string
  // Lista
  limit?: number
  prefix?: string
  continuationToken?: string
  // Single Upload
  filename?: string
  contentType?: string
  fileContent?: string
  // Batch Upload
  files?: {
    filename: string
    contentType: string
    fileContent: string
  }[]
  // Delete
  key?: string
  // Batch Delete
  keys?: string[]
}

export interface ImageItem {
  key: string
  url: string
  filename: string
  lastModified: Date
  size: number
  type: string
  id: string
}

export interface ListImagesResponse {
  images: ImageItem[]
  nextContinuationToken?: string
}

export interface UploadImageResponse {
  image: ImageItem
}

export interface BatchUploadResponse {
  images: ImageItem[]
  failed?: {
    filename: string
    error: string
  }[]
  success: boolean
}

export interface DeleteImageResponse {
  success: boolean
}

export interface BatchDeleteResponse {
  success: boolean
  successCount: number
  failedKeys?: {
    key: string
    error: string
  }[]
}

export interface S3Config {
  bucketName: string
  awsRegion: string
  cloudFrontDomainBase: string
}

export interface ErrorResponse {
  message: string
}
