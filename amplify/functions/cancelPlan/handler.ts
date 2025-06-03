import axios from 'axios'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getCorsHeaders } from '../shared/cors'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/hookPlan'
import { type Schema } from '../../data/resource'

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
Amplify.configure(resourceConfig, libraryOptions)

const clientSchema = generateClient<Schema>()

export const handler = async (event: any) => {
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
    // 1. Extraer parámetros necesarios
    const { preapproval_id, user_id } = JSON.parse(event.body)
    if (!preapproval_id || !user_id) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(origin),
        body: JSON.stringify({ message: 'Faltan parámetros' }),
      }
    }

    // 2. Realizar la solicitud PUT a Mercado Pago para cancelar la suscripción
    const mercadoPagoUrl = `https://api.mercadopago.com/preapproval/${preapproval_id}`
    let response
    try {
      response = await axios.put(
        mercadoPagoUrl,
        { status: 'cancelled' },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      )
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        typeof error.response.data.message === 'string' &&
        error.response.data.message.toLowerCase().includes('cancelled preapproval')
      ) {
        response = error.response
      } else {
        throw error
      }
    }

    const data = response.data
    if (response.status !== 200 && response.status !== 400) {
      return {
        statusCode: response.status,
        headers: getCorsHeaders(origin),
        body: JSON.stringify({
          message: data.message || 'Error at cancel plan',
        }),
      }
    }

    // 3. Obtener la fecha de finalización (endDate) que indica cuándo finaliza el periodo de facturación
    const endDate = data.next_payment_date
    if (!endDate) {
      return {
        statusCode: 500,
        headers: getCorsHeaders(origin),
        body: JSON.stringify({
          message: 'Error at get end date',
        }),
      }
    }

    // 4. Actualizar el registro en DynamoDB para la suscripción
    // Se actualiza el registro para programar el cambio a "free" al finalizar el periodo
    const existingSubscription = await clientSchema.models.UserSubscription.get({
      id: user_id,
    })

    if (existingSubscription.data) {
      await clientSchema.models.UserSubscription.update({
        id: user_id,
        subscriptionId: preapproval_id,
        pendingPlan: 'free',
        pendingStartDate: new Date(endDate).toISOString(),
      })
    }

    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({
        message: 'Plan cancelled, pending change',
        endDate,
      }),
    }
  } catch (error: any) {
    console.error('❌ Error at cancel plan:', error)
    return {
      statusCode: 500,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({
        message: 'Internal error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}
