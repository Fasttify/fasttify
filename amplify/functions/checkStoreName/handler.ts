import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/checkStoreName'
import { getCorsHeaders } from '../shared/cors'
import { type Schema } from '../../data/resource'

// Configurar Amplify para acceso a datos
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
Amplify.configure(resourceConfig, libraryOptions)

// Inicializar el cliente para DynamoDB (Amplify Data)
const clientSchema = generateClient<Schema>()

export const handler = async (event: any) => {
  const origin = event.headers?.origin || event.headers?.Origin
  const storeName = event.queryStringParameters?.storeName

  if (!storeName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Store name is required' }),
      headers: getCorsHeaders(origin),
    }
  }

  try {
    const { data: stores } = await clientSchema.models.UserStore.listUserStoreByStoreName({
      storeName: storeName,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ exists: stores && stores.length > 0 }),
      headers: getCorsHeaders(origin),
    }
  } catch (error) {
    console.error('Error checking store name:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error checking store name' }),
      headers: getCorsHeaders(origin),
    }
  }
}
