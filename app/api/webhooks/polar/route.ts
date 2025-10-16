import { Webhooks } from '@polar-sh/nextjs';
import { NextRequest } from 'next/server';
import { UserRepository } from '@/app/api/_lib/polar/repositories/user.repository';
import { SubscriptionRepository } from '@/app/api/_lib/polar/repositories/subscription.repository';
import { PolarService } from '@/app/api/_lib/polar/services/polar.service';
import { SubscriptionService } from '@/app/api/_lib/polar/services/subscription.service';
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
    console.log('Subscription created:', payload.id);
    await processSubscriptionEvent(payload.id);
  },

  onSubscriptionUpdated: async (payload) => {
    console.log('Subscription updated:', payload.id);
    await processSubscriptionEvent(payload.id);
  },

  onSubscriptionActive: async (payload) => {
    console.log('Subscription active:', payload.id);
    await processSubscriptionEvent(payload.id);
  },

  onSubscriptionCanceled: async (payload) => {
    console.log('Subscription canceled:', payload.id);
    await processSubscriptionEvent(payload.id);
  },

  onSubscriptionRevoked: async (payload) => {
    console.log('Subscription revoked:', payload.id);
    await processSubscriptionEvent(payload.id);
  },

  onOrderCreated: async (payload) => {
    console.log('Order created:', payload.id);

    // Si el pago está asociado a una suscripción, procesar la suscripción
    if (payload.subscription_id) {
      await processSubscriptionEvent(payload.subscription_id);
    }
  },
});

/**
 * Procesa un evento de suscripción usando los servicios de la aplicación
 */
async function processSubscriptionEvent(subscriptionId: string): Promise<void> {
  try {
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
    const result = await subscriptionService.processSubscriptionUpdate(subscriptionId);

    if (result.success) {
      console.log(`Successfully processed subscription ${subscriptionId}:`, result.message);
    } else {
      console.error(`Failed to process subscription ${subscriptionId}:`, result.message);
    }
  } catch (error) {
    console.error(`Error processing subscription event ${subscriptionId}:`, error);
  }
}
