import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { env } from '$amplify/env/storeImages'

const s3Client = new S3Client()

const bucketName = env.BUCKET_NAME
const awsRegion = env.AWS_REGION_BUCKET

// Determinar el dominio de CloudFront a usar, si aplica.
// cloudFrontDomainBase contendrá solo el nombre de host (ej: d123.cloudfront.net) si está en producción y configurado.
// De lo contrario, permanecerá vacío, y se usará la URL directa de S3.
let cloudFrontDomainBase = ''
if (
  env.APP_ENV === 'production' &&
  env.CLOUDFRONT_DOMAIN_NAME &&
  env.CLOUDFRONT_DOMAIN_NAME.trim() !== ''
) {
  cloudFrontDomainBase = env.CLOUDFRONT_DOMAIN_NAME
}

if (!bucketName) {
  console.error(
    'Error: BUCKET_NAME is not defined in the environment variables of the storeImages function.'
  )
}
// AWS_REGION_BUCKET es necesario si no se usa CloudFront (no producción o CloudFront no configurado)
if (!awsRegion && (!cloudFrontDomainBase || cloudFrontDomainBase.trim() === '')) {
  console.warn(
    "Warning: AWS_REGION_BUCKET is not defined. S3 URLs may default to 'us-east-2' if CloudFront is not used or not configured."
  )
}

// Advertencia específica si es producción pero CLOUDFRONT_DOMAIN_NAME no está configurado
if (
  env.APP_ENV === 'production' &&
  (!env.CLOUDFRONT_DOMAIN_NAME || env.CLOUDFRONT_DOMAIN_NAME.trim() === '')
) {
  console.warn(
    'Warning: APP_ENV is "production" but CLOUDFRONT_DOMAIN_NAME is not set. Image URLs will use S3 direct links.'
  )
}

export const handler = async (event: any) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const { action, storeId } = body

    if (!storeId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Store ID is required' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    }

    // Manejar diferentes acciones
    switch (action) {
      case 'list':
        return await listImages(storeId, body.limit, body.prefix)
      case 'upload':
        return await uploadImage(storeId, body.filename, body.contentType, body.fileContent)
      case 'delete':
        return await deleteImage(body.key)
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Invalid action' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing request' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
}

// Función para listar imágenes
async function listImages(storeId: string, limit: number = 1000, prefix: string = '') {
  try {
    // Configurar el prefijo para las imágenes de la tienda
    const storePrefix = prefix ? `products/${storeId}/${prefix}` : `products/${storeId}/`

    // Listar objetos en el bucket con el prefijo de la tienda
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: storePrefix,
      MaxKeys: limit,
    })

    const listResponse = await s3Client.send(listCommand)

    if (!listResponse.Contents) {
      return {
        statusCode: 200,
        body: JSON.stringify({ images: [] }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    }

    // Generar URLs para cada objeto usando CloudFront
    const imagePromises = listResponse.Contents.map(async item => {
      if (!item.Key) return null
      if (item.Key.endsWith('/')) return null

      let imageUrl: string
      const s3Key = item.Key

      if (cloudFrontDomainBase && cloudFrontDomainBase.trim() !== '') {
        // Usar CloudFront para producción
        imageUrl = `https://${cloudFrontDomainBase}/${s3Key}`
      } else {
        // Fallback a la URL de S3 para otros entornos o si CloudFront no está configurado
        const regionForS3Url = awsRegion || 'us-east-2'
        imageUrl = `https://${bucketName}.s3.${regionForS3Url}.amazonaws.com/${s3Key}`
      }

      // Extraer el nombre del archivo de la clave
      const keyParts = item.Key.split('/')
      const filename = keyParts[keyParts.length - 1]

      // Determinar el tipo de archivo a partir de la extensión
      const fileExtension = filename.split('.').pop()?.toLowerCase() || ''
      let fileType = 'application/octet-stream'

      if (fileExtension === 'jpg' || fileExtension === 'jpeg') fileType = 'image/jpeg'
      else if (fileExtension === 'png') fileType = 'image/png'
      else if (fileExtension === 'gif') fileType = 'image/gif'
      else if (fileExtension === 'webp') fileType = 'image/webp'

      return {
        key: item.Key,
        url: imageUrl, // Usar la URL construida dinámicamente
        filename,
        lastModified: item.LastModified,
        size: item.Size,
        type: fileType,
      }
    })

    const imageResults = await Promise.all(imagePromises)
    const validImages = imageResults.filter((img): img is NonNullable<typeof img> => img !== null)

    return {
      statusCode: 200,
      body: JSON.stringify({ images: validImages }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  } catch (error) {
    console.error('Error listing images:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error listing images' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
}

// Función para subir una imagen
async function uploadImage(
  storeId: string,
  filename: string,
  contentType: string,
  fileContent: string
) {
  try {
    // Decodificar el contenido del archivo de base64
    const buffer = Buffer.from(fileContent, 'base64')
    const timestamp = new Date().getTime()
    const key = `products/${storeId}/${timestamp}-${filename}`

    // Subir el archivo a S3
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })

    await s3Client.send(putCommand)

    let imageUrl: string
    const s3Key = key

    if (cloudFrontDomainBase && cloudFrontDomainBase.trim() !== '') {
      // Usar CloudFront para producción
      imageUrl = `https://${cloudFrontDomainBase}/${s3Key}`
    } else {
      // Fallback a la URL de S3 para otros entornos o si CloudFront no está configurado
      const regionForS3Url = awsRegion || 'us-east-2'
      imageUrl = `https://${bucketName}.s3.${regionForS3Url}.amazonaws.com/${s3Key}`
    }

    const image = {
      key,
      url: imageUrl, // Usar la URL construida dinámicamente
      filename,
      lastModified: new Date(),
      size: buffer.length,
      type: contentType,
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ image }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error uploading image' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
}

// Función para eliminar una imagen
async function deleteImage(key: string) {
  try {
    // Eliminar el objeto de S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    await s3Client.send(deleteCommand)

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  } catch (error) {
    console.error('Error deleting image:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error deleting image' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
}
