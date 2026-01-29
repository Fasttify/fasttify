/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { dataFetcher } from '@/liquid-forge';

export async function completeCheckout(request: NextRequest, _storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);

  // Obtener el host original de la tienda para las redirecciones
  const storeHost =
    request.headers.get('origin') ||
    request.headers.get('referer')?.split('/')[0] + '//' + request.headers.get('referer')?.split('/')[2];

  try {
    const formData = await request.formData();

    // Obtener token del query string
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${storeHost}/cart?error=invalid_token`, { status: 303, headers: corsHeaders });
    }

    // Extraer datos del formulario
    const customerInfo = {
      email: formData.get('customer[email]') as string,
      firstName: formData.get('customer[firstName]') as string,
      lastName: formData.get('customer[lastName]') as string,
      phone: formData.get('customer[phone]') as string,
    };

    const shippingAddress = {
      address1: formData.get('shipping_address[address1]') as string,
      address2: formData.get('shipping_address[address2]') as string,
      city: formData.get('shipping_address[city]') as string,
      province: formData.get('shipping_address[state]') as string,
      zip: formData.get('shipping_address[zip]') as string,
      country: formData.get('shipping_address[country]') as string,
    };

    const notes = formData.get('notes') as string;

    // Actualizar información del cliente
    const updateResponse = await dataFetcher.updateCustomerInfo({
      token,
      customerInfo,
      shippingAddress,
      billingAddress: shippingAddress, // Por ahora usamos la misma dirección
      notes,
    });

    if (!updateResponse.success) {
      return NextResponse.redirect(`${storeHost}/checkouts/cn/${token}?error=update_failed`, {
        status: 303,
        headers: corsHeaders,
      });
    }

    // Completar el checkout
    const completeResponse = await dataFetcher.completeCheckout(token);

    if (!completeResponse.success) {
      return NextResponse.redirect(`${storeHost}/checkouts/cn/${token}?error=complete_failed`, {
        status: 303,
        headers: corsHeaders,
      });
    }

    // Redirigir a página de confirmación en el dominio de la tienda
    return NextResponse.redirect(`${storeHost}/checkouts/cn/${token}/confirmation`, {
      status: 303,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error completing checkout:', error);
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    return NextResponse.redirect(`${storeHost}/checkouts/cn/${token || 'error'}?error=checkout_error`, {
      status: 303,
      headers: corsHeaders,
    });
  }
}
