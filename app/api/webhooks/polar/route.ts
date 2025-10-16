import { Webhooks } from '@polar-sh/nextjs';
import { NextRequest } from 'next/server';
import { UserRepository } from '@/app/api/_lib/polar/repositories/user.repository';
import { SubscriptionRepository } from '@/app/api/_lib/polar/repositories/subscription.repository';
import { PolarService } from '@/app/api/_lib/polar/services/polar.service';
import { SubscriptionService } from '@/app/api/_lib/polar/services/subscription.service';
import { PolarWebhookProcessorService } from '@/app/api/_lib/polar/services/polar-webhook-processor.service';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';

/**
 * API Route para webhooks de Polar
 * Procesa eventos de suscripciones y órdenes automáticamente
 */
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || '',

  onSubscriptionCreated: async (payload) => {
    if (payload.data?.id) {
      await processSubscriptionEvent(payload.data.id);
    } else {
      console.error('Subscription created payload missing id:', payload);
    }
  },

  onSubscriptionUpdated: async (payload) => {
    if (payload.data?.id) {
      await processSubscriptionEvent(payload.data.id);
    } else {
      console.error('Subscription updated payload missing id:', payload);
    }
  },

  onSubscriptionActive: async (payload) => {
    if (payload.data?.id) {
      await processSubscriptionEvent(payload.data.id);
    } else {
      console.error('Subscription active payload missing id:', payload);
    }
  },

  onSubscriptionCanceled: async (payload) => {
    if (payload.data?.id) {
      await processSubscriptionEvent(payload.data.id);
    } else {
      console.error('Subscription canceled payload missing id:', payload);
    }
  },

  onSubscriptionRevoked: async (payload) => {
    if (payload.data?.id) {
      await processSubscriptionEvent(payload.data.id);
    } else {
      console.error('Subscription revoked payload missing id:', payload);
    }
  },

  onOrderCreated: async (payload) => {
    // Si el pago está asociado a una suscripción, procesar la suscripción
    if (payload.data?.subscription_id) {
      await processSubscriptionEvent(payload.data.subscription_id);
    }
  },
});

/**
 * Procesa un evento de suscripción usando los servicios de la aplicación
 */
async function processSubscriptionEvent(subscriptionId: string, payloadData?: any): Promise<void> {
  try {
    // Validar que tenemos un subscriptionId válido
    if (!subscriptionId || subscriptionId === 'undefined') {
      console.error('Invalid subscription ID provided:', subscriptionId);
      return;
    }

    // Validar variables de entorno
    const userPoolId = process.env.USER_POOL_ID;
    const accessToken = process.env.POLAR_ACCESS_TOKEN;

    if (!userPoolId || !accessToken) {
      console.error('Missing required environment variables: USER_POOL_ID or POLAR_ACCESS_TOKEN');
      return;
    }

    // Inicializar servicios
    const userRepository = new UserRepository(userPoolId);
    const subscriptionRepository = new SubscriptionRepository();
    const polarService = new PolarService(accessToken);
    const subscriptionService = new SubscriptionService(userRepository, subscriptionRepository, polarService);

    // Procesar actualización de suscripción
    let result;
    if (payloadData) {
      const webhookProcessor = new PolarWebhookProcessorService(
        userRepository,
        subscriptionRepository,
        subscriptionService.mapProductIdToPlan.bind(subscriptionService)
      );
      result = await webhookProcessor.processSubscriptionWithData(subscriptionId, payloadData);
    } else {
      result = await subscriptionService.processSubscriptionUpdate(subscriptionId);
    }

    if (result.success) {
      console.log(`Successfully processed subscription ${subscriptionId}:`, result.message);
    } else {
      console.error(`Failed to process subscription ${subscriptionId}:`, result.message);
    }
  } catch (error) {
    console.error(`Error processing subscription event ${subscriptionId}:`, error);
  }
}
