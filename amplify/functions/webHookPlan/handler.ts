import { APIGatewayProxyHandler } from 'aws-lambda';
import { env } from '$amplify/env/hookPlan';
import { LambdaHandler, WebhookResponse, PolarWebhookEvent } from './types';
import { PolarApiService } from './services/polar-api';
import { CognitoUserService } from './services/user-service';
import { PolarPaymentProcessor } from './services/polar-payment-processor';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';

/**
 * Enhanced Polar Webhook Handler with TypeScript support
 * Handles subscription updates and payment notifications
 *
 * Follows Polar best practices:
 * - Webhook signature validation
 * - Proper error handling
 * - Modular service architecture
 */
export const handler: LambdaHandler = async (event) => {
  // Initialize services
  const polarApiService = new PolarApiService(env.POLAR_ACCESS_TOKEN);
  const userService = new CognitoUserService(env.USER_POOL_ID);
  const paymentProcessor = new PolarPaymentProcessor(polarApiService, userService);

  // Preparar la respuesta
  const response: WebhookResponse = {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok' }),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    // Validar que sea un POST
    if (event.httpMethod !== 'POST') {
      console.warn(`Method not allowed: ${event.httpMethod}`);
      return {
        ...response,
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Validar la firma del webhook usando el SDK de Polar
    try {
      const payload = event.body || '{}';

      // Extraer los headers necesarios para la validación
      const webhookSignature = event.headers['webhook-signature'] || '';
      const webhookId = event.headers['webhook-id'] || '';
      const webhookTimestamp = event.headers['webhook-timestamp'] || '';

      if (!webhookSignature) {
        return {
          ...response,
          statusCode: 403,
          body: JSON.stringify({ error: 'Missing webhook-signature header' }),
        };
      }

      const webhookEvent = validateEvent(
        payload,
        {
          'webhook-signature': webhookSignature,
          'webhook-id': webhookId,
          'webhook-timestamp': webhookTimestamp,
        },
        env.POLAR_WEBHOOK_SECRET
      ) as PolarWebhookEvent;

      // Procesar el evento según su tipo
      const eventType = webhookEvent.type;
      const eventData = webhookEvent.data;

      if (eventType && eventType.startsWith('subscription.')) {
        // Eventos de suscripción
        if (eventType === 'subscription.created' || eventType === 'subscription.updated') {
          await paymentProcessor.processSubscriptionUpdate(eventData.id);
        } else if (eventType === 'subscription.canceled' || eventType === 'subscription.revoked') {
          await paymentProcessor.processSubscriptionUpdate(eventData.id);
        }
      } else if (eventType && eventType.startsWith('order.')) {
        // Eventos de orden/pago
        if (eventType === 'order.created') {
          // Si el pago está asociado a una suscripción, actualizamos la suscripción
          if (eventData.subscription_id) {
            await paymentProcessor.processSubscriptionUpdate(eventData.subscription_id);
          }
        }
      }

      return response;
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        console.error('Webhook verification error:', error.message);
        return {
          ...response,
          statusCode: 403,
          body: JSON.stringify({ error: 'Invalid webhook signature: ' + error.message }),
        };
      }

      throw error;
    }
  } catch (error) {
    console.error('Error processing webhook:', error);

    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

/**
 * Health check endpoint for webhook monitoring
 */
export const healthCheck: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'polar-webhook',
    }),
  };
};
