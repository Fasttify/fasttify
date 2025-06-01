import { APIGatewayProxyHandler } from 'aws-lambda'
import { env } from '$amplify/env/hookPlan'
import { WebhookBody, LambdaHandler, WebhookResponse } from './types'
import { MercadoPagoWebhookValidator } from './services/webhook-validator'
import { MercadoPagoApiService } from './services/mercadopago-api'
import { CognitoUserService } from './services/user-service'
import { MercadoPagoPaymentProcessor } from './services/payment-processor'

/**
 * Enhanced MercadoPago Webhook Handler with TypeScript support
 * Handles subscription updates and payment notifications
 *
 * Follows MercadoPago best practices:
 * - Webhook signature validation
 * - Proper error handling
 * - Modular service architecture
 */
export const handler: LambdaHandler = async event => {
  // Initialize services
  const webhookValidator = new MercadoPagoWebhookValidator(env.MERCADO_PAGO_WEBHOOK_SECRET)
  const mpApiService = new MercadoPagoApiService(env.MERCADOPAGO_ACCESS_TOKEN)
  const userService = new CognitoUserService(env.USER_POOL_ID)
  const paymentProcessor = new MercadoPagoPaymentProcessor(mpApiService, userService)

  try {
    console.log('🚀 Starting webhook processing')

    // 1. Parse and validate request
    const body: WebhookBody = JSON.parse(event.body || '{}')
    const signature = event.headers['x-signature'] || event.headers['X-Signature']
    const dataId = event.queryStringParameters?.['data.id']
    const requestId = event.headers['x-request-id'] || event.headers['X-Request-Id']

    if (!signature || !dataId || !requestId) {
      console.error('❌ Missing required webhook parameters')
      return createResponse(400, { error: 'Missing required parameters' })
    }

    // 2. Validate webhook signature
    const timestamp = webhookValidator.extractTimestamp(signature) || ''
    const isValidSignature = webhookValidator.validateSignature(
      signature,
      dataId,
      requestId,
      timestamp
    )

    if (!isValidSignature) {
      console.error('❌ Invalid webhook signature')
      return createResponse(401, { error: 'Invalid signature' })
    }

    // 3. Determine event type and validate if supported
    const eventType = body.type
    const eventAction = body.action

    console.log(`🔍 Processing event: ${eventType}.${eventAction}`)

    if (!paymentProcessor.shouldProcessEvent(eventType, eventAction)) {
      console.log('ℹ️ Event type not supported, returning OK')
      return createResponse(200, { message: 'Event type not supported but acknowledged' })
    }

    // 4. Route to appropriate processor
    await routeEvent(eventType, eventAction, body.data.id, paymentProcessor)

    console.log('✅ Webhook processed successfully')
    return createResponse(200, { message: 'Webhook processed successfully' })
  } catch (error) {
    console.error('🔥 Webhook processing error:', error)

    // Return 500 to trigger MercadoPago retry mechanism
    return createResponse(500, {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Routes events to the appropriate processor based on type
 */
async function routeEvent(
  eventType: string,
  eventAction: string,
  dataId: string,
  processor: MercadoPagoPaymentProcessor
): Promise<void> {
  switch (eventType) {
    case 'subscription_preapproval':
      if (eventAction === 'updated') {
        await processor.processSubscriptionUpdate(dataId)
      }
      break

    case 'subscription_authorized_payment':
    case 'payment':
      await processor.processPayment(dataId, eventType)
      break

    default:
      console.warn(`⚠️ Unhandled event type: ${eventType}.${eventAction}`)
  }
}

/**
 * Creates standardized API Gateway response
 */
function createResponse(statusCode: number, body: any): WebhookResponse {
  return {
    statusCode,
    body: JSON.stringify(body),
  }
}

/**
 * Health check endpoint for webhook monitoring
 */
export const healthCheck: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'mercadopago-webhook',
    }),
  }
}
