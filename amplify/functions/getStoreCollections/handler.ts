import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/getStoreCollections'
import { getCorsHeaders } from '../shared/cors'
import { type Schema } from '../../data/resource'

let clientSchema: ReturnType<typeof generateClient<Schema>> | null = null

const initializeClient = async () => {
  if (!clientSchema) {
    const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
    Amplify.configure(resourceConfig, libraryOptions)
    clientSchema = generateClient<Schema>()
  }
  return clientSchema
}

export const handler = async (event: any) => {
  const origin = event.headers?.origin || event.headers?.Origin

  // Manejar peticiones OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    }
  }
  const storeId = event.queryStringParameters?.storeId
  const collectionId = event.queryStringParameters?.collectionId
  const slug = event.queryStringParameters?.slug

  // Verificar si se proporcionó un ID de tienda
  if (!storeId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Store ID is required' }),
      headers: getCorsHeaders(origin),
    }
  }

  try {
    const client = await initializeClient()

    // Caso 1: Obtener una colección específica por ID
    if (collectionId) {
      const { data: collection } = await client.models.Collection.get({ id: collectionId })

      if (!collection || collection.storeId !== storeId) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Collection not found' }),
          headers: getCorsHeaders(origin),
        }
      }

      // Obtener productos asociados a esta colección
      const { data: products } = await client.models.Product.listProductByCollectionId(
        {
          collectionId: collectionId,
        },
        {
          filter: {
            status: { eq: 'active' },
          },
        }
      )

      return {
        statusCode: 200,
        body: JSON.stringify({
          collection: {
            ...collection,
            products: products || [],
          },
        }),
        headers: getCorsHeaders(origin),
      }
    }

    // Caso 2: Obtener una colección por slug
    if (slug) {
      const { data: collections } = await client.models.Collection.list({
        filter: {
          storeId: { eq: storeId },
          slug: { eq: slug },
          isActive: { eq: true },
        },
      })

      if (!collections || collections.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Collection not found' }),
          headers: getCorsHeaders(origin),
        }
      }

      const collection = collections[0]

      // Obtener productos asociados a esta colección
      const { data: products } = await client.models.Product.list({
        filter: {
          collectionId: { eq: collection.id },
          status: { eq: 'active' },
        },
      })

      return {
        statusCode: 200,
        body: JSON.stringify({
          collection: {
            ...collection,
            products: products || [],
          },
        }),
        headers: getCorsHeaders(origin),
      }
    }

    // Caso 3: Obtener todas las colecciones de la tienda
    const { data: collections } = await client.models.Collection.list({
      filter: {
        storeId: { eq: storeId },
        isActive: { eq: true },
      },
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        collections: collections || [],
      }),
      headers: getCorsHeaders(origin),
    }
  } catch (error) {
    console.error('Error fetching collections data:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching collections data' }),
      headers: getCorsHeaders(origin),
    }
  }
}
