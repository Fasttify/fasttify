import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/getStoreProducts'
import { type Schema } from '../../data/resource'
import { getCorsHeaders } from '../shared/cors'
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
  const storeId = event.queryStringParameters?.storeId

  // Manejar peticiones OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    }
  }

  if (!storeId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Store ID is required' }),
      headers: getCorsHeaders(origin),
    }
  }

  try {
    const client = await initializeClient()
    const { data: products } = await client.models.Product.listProductByStoreId(
      {
        storeId: storeId,
      },
      {
        filter: {
          status: { eq: 'active' }, // Opcional: filtrar solo productos activos
        },
      }
    )

    return {
      statusCode: 200,
      body: JSON.stringify({
        products: products,
      }),
      headers: getCorsHeaders(origin),
    }
  } catch (error) {
    console.error('Error fetching store products:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching store products' }),
      headers: getCorsHeaders(origin),
    }
  }
}
