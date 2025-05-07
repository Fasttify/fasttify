import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/getStoreData'
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
    const { data: store } = await client.models.UserStore.list({
      filter: {
        storeId: {
          eq: storeId,
        },
      },
    })

    if (!store) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Store not found' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        store: store,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  } catch (error) {
    console.error('Error fetching store data:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching store data' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
}
