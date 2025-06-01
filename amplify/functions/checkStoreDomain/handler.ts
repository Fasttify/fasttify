import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/checkStoreDomain'
import { getCorsHeaders } from '../shared/cors'
import { type Schema } from '../../data/resource'

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
Amplify.configure(resourceConfig, libraryOptions)

const clientSchema = generateClient<Schema>()

export const handler = async (event: any) => {
  const origin = event.headers?.origin || event.headers?.Origin
  const domainName = event.queryStringParameters?.domainName

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    }
  }

  if (!domainName) {
    return {
      statusCode: 400,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({ message: 'Domain name is required' }),
    }
  }

  try {
    const { data: stores } = await clientSchema.models.UserStore.listUserStoreByCustomDomain({
      customDomain: domainName,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        available: !(stores && stores.length > 0),
        exists: stores && stores.length > 0,
      }),
      headers: getCorsHeaders(origin),
    }
  } catch (error) {
    console.error('Error checking domain availability:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error checking domain availability' }),
      headers: getCorsHeaders(origin),
    }
  }
}
