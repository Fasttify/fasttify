import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';
import { EmailAdminService } from '@/app/store/services';
import { sendOrderStatusUpdateSchema } from '@/lib/zod-schemas/notification-api';

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
    const validatedData = sendOrderStatusUpdateSchema.parse(body);

    // Verificar que el usuario tenga acceso a la tienda
    const { data: userStore } = await cookiesClient.models.UserStore.get({
      storeId: validatedData.storeId,
    });

    if (!userStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
    }

    if (userStore.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    // Preparar la solicitud para el servicio de email
    const emailRequest = {
      orderId: validatedData.orderId,
      storeId: validatedData.storeId,
      customerEmail: validatedData.customerEmail,
      customerName: validatedData.customerName,
      storeName: validatedData.storeName,
      previousOrderStatus: validatedData.previousOrderStatus,
      newOrderStatus: validatedData.newOrderStatus,
      previousPaymentStatus: validatedData.previousPaymentStatus,
      newPaymentStatus: validatedData.newPaymentStatus,
      orderTotal: validatedData.orderTotal,
      orderDate: validatedData.orderDate,
      shippingAddress: validatedData.shippingAddress,
      billingAddress: validatedData.billingAddress,
      updateNotes: validatedData.updateNotes,
    };

    // Enviar email usando el servicio de admin
    const emailSent = await EmailAdminService.sendOrderStatusUpdate(emailRequest);

    if (!emailSent) {
      return NextResponse.json({ error: 'Error sending email status update' }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email status update sent successfully',
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
    console.error('Error sending email status update:', error);

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
