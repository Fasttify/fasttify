import { CustomerPortal } from '@polar-sh/nextjs';
import { NextRequest } from 'next/server';
import { PolarService } from '@/app/api/_lib/polar/services/polar.service';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { AuthGetCurrentUserServer } from '@/utils/client/AmplifyUtils';

/**
 * API Route para customer portal usando adaptador de Polar
 * Requiere autenticación para acceder al portal del cliente
 */

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN || '',
  getCustomerId: async (_req: NextRequest) => {
    try {
      // Verificar autenticación directamente
      const session = await AuthGetCurrentUserServer();
      if (!session) {
        throw new Error('Authentication required');
      }

      const externalId = session.username;

      if (!externalId) {
        throw new Error('User ID not found in session');
      }

      // Obtener el customer ID real de Polar usando external ID
      const accessToken = process.env.POLAR_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('POLAR_ACCESS_TOKEN not configured');
      }

      const polarService = new PolarService(accessToken);
      const customer = await polarService.getCustomerByExternalId(externalId);

      if (!customer) {
        throw new Error(`Customer not found in Polar for external ID: ${externalId}`);
      }

      // Retornar el customer ID real (UUID) de Polar
      return customer.id;
    } catch (error) {
      console.error('Error getting customer ID:', error);
      throw new Error('Error getting customer ID');
    }
  },
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});
