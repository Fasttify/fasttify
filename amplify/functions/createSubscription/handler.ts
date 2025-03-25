import { APIGatewayProxyHandler } from 'aws-lambda'
import { env } from '../../../.amplify/generated/env/createSubscription'

const MERCADOPAGO_API_URL = 'https://api.mercadopago.com/preapproval'

export const handler: APIGatewayProxyHandler = async event => {
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

    // Capture the full response details for better error handling
    const responseData = await response.json()

    if (!response.ok) {
      console.error('MercadoPago API error:', {
        status: response.status,
        statusText: response.statusText,
        responseData,
      })

      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({
          error: 'Error from MercadoPago API',
          status: response.status,
          statusText: response.statusText,
          details: responseData,
        }),
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        checkoutUrl: responseData.init_point,
      }),
    }
  } catch (error) {
    console.error('Error en la función Lambda:', error)

    // Capture more detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      toString: error instanceof Error ? error.toString() : String(error),
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        error: 'Error creating subscription',
        details: errorDetails,
      }),
    }
  }
}
