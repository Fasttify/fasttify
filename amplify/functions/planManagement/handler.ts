import axios from 'axios'
import { APIGatewayProxyHandler } from 'aws-lambda'
import { env } from '$amplify/env/planManagement'
import { getCorsHeaders } from '../shared/cors'

/**
 * Función auxiliar que calcula la fecha de finalización exactamente un mes después de la fecha de inicio.
 * Se utiliza el método setMonth(), teniendo en cuenta que en JavaScript puede ajustar automáticamente
 * el día si el mes siguiente tiene menos días.
 */
function calcularEndDate(startDate: Date): Date {
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + 1)
  return endDate
}

export const handler: APIGatewayProxyHandler = async event => {
  const origin = event.headers?.origin || event.headers?.Origin

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    }
  }
  try {
    // 1. Extraer parámetros del body de la solicitud.
    // Se espera recibir:
    // - subscriptionId: ID de la suscripción en Mercado Pago.
    // - newAmount: Nuevo monto a cobrar.
    // - currencyId: Moneda (ej. "ARS").
    // - newPlanName: Nombre del nuevo plan.
    const { subscriptionId, newAmount, currencyId, newPlanName, cognitoUsername } = JSON.parse(
      event.body || '{}'
    )

    if (!subscriptionId || !newAmount || !currencyId || !newPlanName) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(origin),
        body: JSON.stringify({
          message:
            'Faltan parámetros requeridos: subscriptionId, newAmount, currencyId y newPlanName.',
        }),
      }
    }

    // 2. Definir la fecha de inicio y calcular la fecha de finalización.
    // La start_date es la fecha actual (el momento de la actualización).
    // La end_date será exactamente un mes después.
    const startDate = new Date()
    const endDate = calcularEndDate(startDate)

    // 3. Construir el payload para actualizar la suscripción en Mercado Pago.
    // De acuerdo con la documentación, se debe enviar:
    // {
    //   "reason": "Nuevo nombre del plan",
    //   "auto_recurring": {
    //     "transaction_amount": <nuevo monto>,
    //     "currency_id": "<moneda>",
    //     "start_date": "<start_date>",
    //     "end_date": "<end_date>"
    //   }
    // }
    const payload = {
      reason: newPlanName,

      auto_recurring: {
        external_reference: cognitoUsername,
        transaction_amount: newAmount,
        currency_id: currencyId,
      },
    }
    // 4. Realizar la solicitud PUT a Mercado Pago para actualizar la suscripción.
    const url = `https://api.mercadopago.com/preapproval/${subscriptionId}`

    const response = await axios.put(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    })

    // 5. Extraer la URL de confirmación de la respuesta.
    // Se asume que Mercado Pago devuelve la URL en el campo 'init_point'.
    const confirmationUrl = response.data?.init_point
    if (confirmationUrl) {
    } else {
      console.warn('⚠️ No se recibió URL de confirmación en la respuesta.')
    }

    // 6. Retornar respuesta exitosa con la URL de confirmación para que el cliente pueda redirigir al usuario.
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({
        message:
          'La suscripción se actualizó exitosamente. Confirme el pago en la URL proporcionada.',
        data: response.data,
        confirmationUrl, // Esta URL debe ser abierta por el cliente para proceder con el pago.
      }),
    }
  } catch (error: any) {
    console.error('❌ Error actualizando la suscripción:', error)
    return {
      statusCode: 500,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({
        message: 'Error actualizando la suscripción.',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}
