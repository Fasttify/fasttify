import { APIGatewayProxyHandler } from 'aws-lambda'
import { getCorsHeaders } from '../shared/cors'
import { env } from '$amplify/env/createSubscription'
import { Polar } from '@polar-sh/sdk'

export const handler: APIGatewayProxyHandler = async event => {
  const origin = event.headers?.origin || event.headers?.Origin

  // Manejar peticiones OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { userId, plan, email, name } = body

    // Inicializar el cliente de Polar
    const polar = new Polar({
      accessToken: env.POLAR_ACCESS_TOKEN,
    })

    // Buscar o crear el cliente en Polar
    let customer
    let checkoutUrl = ''

    try {
      // Intentar obtener el cliente por external_id
      customer = await polar.customers.getExternal({
        externalId: userId,
      })

      // Si el cliente existe, crear una sesión para gestionar su suscripción
      const result = await polar.customerSessions.create({
        customerId: customer.id,
      })

      checkoutUrl = result.customerPortalUrl
    } catch (error) {
      // Si no existe, crear un nuevo cliente
      customer = await polar.customers.create({
        email: email,
        name: name,
        externalId: userId,
        billingAddress: {
          country: 'CO',
        },
      })

      // Crear checkout para la suscripción
      const checkout = await polar.checkouts.create({
        customerBillingAddress: {
          country: 'CO',
        },
        customerId: customer.id,
        successUrl: 'https://fasttify.com/first-steps',
        products: [plan.polarId],
      })

      checkoutUrl = checkout.url
    }

    // Siempre devolver código 200 con la URL correspondiente
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({
        checkoutUrl: checkoutUrl,
      }),
    }
  } catch (error) {
    console.error('Error in Lambda function:', error)

    return {
      statusCode: 500,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({
        error: 'Error creating subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}
