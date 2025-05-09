import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/getStoreProducts'
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
  const storeId = event.queryStringParameters?.storeId

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
    const { data: products } = await client.models.Product.list({
      filter: {
        storeId: { eq: storeId },
        status: { eq: 'active' }, // Opcional: filtrar solo productos activos
      },
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        products: products,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  } catch (error) {
    console.error('Error fetching store products:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching store products' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
}
