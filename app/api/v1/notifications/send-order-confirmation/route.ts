import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';
import {
  EmailNotificationService,
  EmailFormattingUtils,
  getOrderStatus,
  getPaymentStatus,
} from '@/packages/renderer-engine/services/notifications';
import { sendOrderConfirmationSchema } from '@/lib/zod-schemas/notification-api';

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  const session = await AuthGetCurrentUserServer();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }
  try {
    const body = await request.json();
    const validatedData = sendOrderConfirmationSchema.parse(body);
    const { data: userStore } = await cookiesClient.models.UserStore.get({
      storeId: validatedData.storeId,
    });
    if (!userStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
    }
    if (userStore.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    // Crear un objeto Order simulado para el servicio de email
    const mockOrder = {
      id: validatedData.orderId,
      orderNumber: validatedData.orderId,
      customerEmail: validatedData.customerEmail,
      customerId: 'admin-generated',
      customerType: 'guest' as const,
      storeId: validatedData.storeId,
      subtotal: EmailFormattingUtils.parseCurrencyAmount(validatedData.orderTotal),
      shippingCost: 0,
      taxAmount: 0,
      totalAmount: EmailFormattingUtils.parseCurrencyAmount(validatedData.orderTotal),
      currency: 'COP',
      status: validatedData.orderStatus as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
      paymentStatus: validatedData.paymentStatus as 'pending' | 'paid' | 'failed' | 'refunded',
      storeOwner: session.username,
      createdAt: validatedData.orderDate,
    };

    // Preparar la solicitud para el servicio de email
    const emailRequest = {
      order: mockOrder,
      storeName: validatedData.storeName,
      customerName: validatedData.customerName,
      shippingAddress: validatedData.shippingAddress,
      billingAddress: validatedData.billingAddress,
    };

    // Enviar email usando el servicio existente
    const emailSent = await EmailNotificationService.sendOrderConfirmation(emailRequest);

    if (!emailSent) {
      return NextResponse.json({ error: 'Error sending email confirmation' }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email confirmation sent successfully',
        data: {
          orderId: validatedData.orderId,
          customerEmail: validatedData.customerEmail,
          emailSent: true,
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Error sending email confirmation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid data',
          details: error.errors,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
