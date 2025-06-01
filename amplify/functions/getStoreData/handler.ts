import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/getStoreData'
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
  const storeName = event.queryStringParameters?.storeName

  // Manejar peticiones OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    }
  }

  if (!storeName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Store ID is required' }),
      headers: getCorsHeaders(origin),
    }
  }

  try {
    const client = await initializeClient()
    const { data: store } = await client.models.UserStore.listUserStoreByStoreName({
      storeName: storeName,
    })

    if (!store) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Store not found' }),
        headers: getCorsHeaders(origin),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        store: store,
      }),
      headers: getCorsHeaders(origin),
    }
  } catch (error) {
    console.error('Error fetching store data:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching store data' }),
      headers: getCorsHeaders(origin),
    }
  }
}
