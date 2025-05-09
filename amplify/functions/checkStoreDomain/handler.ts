import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/checkStoreDomain'
import { type Schema } from '../../data/resource'

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
Amplify.configure(resourceConfig, libraryOptions)

const clientSchema = generateClient<Schema>()

export const handler = async (event: any) => {
  const domainName = event.queryStringParameters?.domainName

  if (!domainName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Domain name is required' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  }

  try {
    const { data: stores } = await clientSchema.models.UserStore.list({
      filter: {
        customDomain: { eq: domainName },
      },
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        available: !(stores && stores.length > 0),
        exists: stores && stores.length > 0,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  } catch (error) {
    console.error('Error checking domain availability:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error checking domain availability' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
}
