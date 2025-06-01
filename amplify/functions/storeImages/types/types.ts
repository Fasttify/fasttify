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
  action: 'list' | 'upload' | 'delete'
  storeId: string
  // Lista
  limit?: number
  prefix?: string
  continuationToken?: string
  // Upload
  filename?: string
  contentType?: string
  fileContent?: string
  // Delete
  key?: string
}

export interface ImageItem {
  key: string
  url: string
  filename: string
  lastModified: Date
  size: number
  type: string
}

export interface ListImagesResponse {
  images: ImageItem[]
  nextContinuationToken?: string
}

export interface UploadImageResponse {
  image: ImageItem
}

export interface DeleteImageResponse {
  success: boolean
}

export interface S3Config {
  bucketName: string
  awsRegion: string
  cloudFrontDomainBase: string
}

export interface ErrorResponse {
  message: string
}
