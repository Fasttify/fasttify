import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '$amplify/env/storeImages'

// Inicializar el cliente S3
const s3Client = new S3Client()

const bucketName = env.BUCKET_NAME
// URL base de CloudFront
const cloudFrontDomain = 'https://d1etr7t5j9fzio.cloudfront.net'

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

      // Omitir objetos de carpeta
      if (item.Key.endsWith('/')) return null

      // Construir la URL de CloudFront
      const cloudFrontUrl = `${cloudFrontDomain}/${item.Key}`

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
        url: cloudFrontUrl,
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

    // Construir la URL de CloudFront
    const cloudFrontUrl = `${cloudFrontDomain}/${key}`

    // Crear un objeto de imagen para devolver
    const image = {
      key,
      url: cloudFrontUrl,
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
