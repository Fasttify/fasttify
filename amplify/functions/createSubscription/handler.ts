import { APIGatewayProxyHandler } from 'aws-lambda';
import { getCorsHeaders } from '../shared/cors';
import { env } from '$amplify/env/createSubscription';
import { Polar } from '@polar-sh/sdk';

export const handler: APIGatewayProxyHandler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin;

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, plan, email, name } = body;

    // Inicializar el cliente de Polar
    const polar = new Polar({
      accessToken: env.POLAR_ACCESS_TOKEN,
      server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    });

    // Validación temprana del plan y producto
    if (!plan || !plan.polarId || typeof plan.polarId !== 'string') {
      return {
        statusCode: 400,
        headers: getCorsHeaders(origin),
        body: JSON.stringify({
          error: 'Invalid request',
          details: 'plan.polarId is required',
        }),
      };
    }

    // Verificar que el producto exista en el entorno actual (sandbox/production)
    try {
      await polar.products.get({ id: plan.polarId });
    } catch (productErr) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(origin),
        body: JSON.stringify({
          error: 'Invalid product',
          details:
            `The product ${plan.polarId} does not exist in the environment ` +
            (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') +
            '. Verify that the ID corresponds to the correct environment.',
        }),
      };
    }

    // Buscar o crear el cliente en Polar
    let customer;
    let checkoutUrl = '';

    try {
      // Intentar obtener el cliente por external_id
      customer = await polar.customers.getExternal({
        externalId: userId,
      });

      //si el cliente existe pero no tiene una suscripcion activa, crear una nueva
      if (customer) {
        // Obtener el estado completo del cliente que incluye información sobre suscripciones activas
        const customerState = await polar.customers.getState({
          id: customer.id,
        });

        // Verificar si hay suscripciones activas
        // activeSubscriptions contendrá un array con las suscripciones activas
        const hasActiveSubscription = customerState.activeSubscriptions && customerState.activeSubscriptions.length > 0;

        if (!hasActiveSubscription) {
          // Si no hay suscripciones activas, crear un nuevo checkout
          const customerCheckout = await polar.checkouts.create({
            customerBillingAddress: {
              country: 'CO',
            },
            customerId: customer.id,
            products: [plan.polarId],
            successUrl: 'https://fasttify.com/first-steps',
          });

          checkoutUrl = customerCheckout.url;
        } else {
          // Si el cliente existe y tiene una suscripción activa, crear una sesión para gestionar su suscripción
          const result = await polar.customerSessions.create({
            customerId: customer.id,
          });
          checkoutUrl = result.customerPortalUrl;
        }
      }
    } catch (error) {
      // Si no existe, intentar crear un nuevo cliente
      try {
        customer = await polar.customers.create({
          email: email,
          name: name,
          externalId: userId,
          billingAddress: {
            country: 'CO',
          },
        });

        // Crear checkout para la suscripción
        const checkout = await polar.checkouts.create({
          customerBillingAddress: {
            country: 'CO',
          },
          customerId: customer.id,
          successUrl: 'https://fasttify.com/first-steps',
          products: [plan.polarId],
        });

        checkoutUrl = checkout.url;
      } catch (createErr) {
        const message = createErr instanceof Error ? createErr.message : String(createErr);
        const isDuplicate =
          message.includes('already exists') ||
          message.includes('value_error') ||
          message.includes('PolarRequestValidationError');

        if (!isDuplicate) {
          throw createErr;
        }

        // Si ya existe (email/externalId duplicados), recuperar el cliente existente
        customer = await polar.customers.getExternal({
          externalId: userId,
        });

        // Igual que en el caso de cliente existente: verificar suscripción activa
        const customerState = await polar.customers.getState({ id: customer.id });
        const hasActiveSubscription = customerState.activeSubscriptions && customerState.activeSubscriptions.length > 0;

        if (!hasActiveSubscription) {
          const customerCheckout = await polar.checkouts.create({
            customerBillingAddress: { country: 'CO' },
            customerId: customer.id,
            products: [plan.polarId],
            successUrl: 'https://fasttify.com/first-steps',
          });
          checkoutUrl = customerCheckout.url;
        } else {
          const result = await polar.customerSessions.create({ customerId: customer.id });
          checkoutUrl = result.customerPortalUrl;
        }
      }
    }

    // Siempre devolver código 200 con la URL correspondiente
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({
        checkoutUrl: checkoutUrl,
      }),
    };
  } catch (error) {
    console.error('Error in Lambda function:', error);

    return {
      statusCode: 500,
      headers: getCorsHeaders(origin),
      body: JSON.stringify({
        error: 'Error creating subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
