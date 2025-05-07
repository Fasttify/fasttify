import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/getStoreCollections'
import { type Schema } from '../../data/resource'

// Lazy-load del cliente para evitar reconfiguración en cada invocación
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
  // Obtener parámetros de la consulta
  const storeId = event.queryStringParameters?.storeId
  const collectionId = event.queryStringParameters?.collectionId
  const slug = event.queryStringParameters?.slug

  // Verificar si se proporcionó un ID de tienda
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

  try {
    const client = await initializeClient()

    // Caso 1: Obtener una colección específica por ID
    if (collectionId) {
      const { data: collection } = await client.models.Collection.get({ id: collectionId })

      if (!collection || collection.storeId !== storeId) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Collection not found' }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      }

      // Obtener productos asociados a esta colección
      const { data: products } = await client.models.Product.list({
        filter: {
          collectionId: { eq: collectionId },
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
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
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  } catch (error) {
    console.error('Error fetching collections data:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching collections data' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
}
