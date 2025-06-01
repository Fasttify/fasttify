import { APIGatewayProxyHandler } from 'aws-lambda'
import { getCorsHeaders } from '../shared/cors'
import { env } from '$amplify/env/createSubscription'

const MERCADOPAGO_API_URL = 'https://api.mercadopago.com/preapproval'

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
    const { userId, plan } = body

    // Crear la solicitud directamente al API
    const response = await fetch(MERCADOPAGO_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: plan.name,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: plan.price,
          currency_id: 'COP',
        },
        external_reference: userId,
        payer_email: 'test_user_122149942@testuser.com',
        back_url: 'https://dev.d705ckpcaa3mv.amplifyapp.com/subscription-success',
        status: 'pending',
      }),
    })

    if (!response.ok) {
      throw new Error(`Error de MercadoPago: ${response.statusText}`)
    }

    const subscription = await response.json()

    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({
        checkoutUrl: subscription.init_point,
      }),
    }
  } catch (error) {
    console.error('Error en la función Lambda:', error)

    return {
      statusCode: 500,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({
        error: 'Error creando suscripción',
        details: error instanceof Error ? error.message : 'Error desconocido',
      }),
    }
  }
}
