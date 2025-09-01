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

// Schema de validación para la solicitud
const sendOrderConfirmationSchema = z.object({
  orderId: z.string().min(1, 'ID del pedido requerido'),
  customerEmail: z.string().email('Email del cliente inválido'),
  customerName: z.string().min(1, 'Nombre del cliente requerido'),
  storeName: z.string().min(1, 'Nombre de la tienda requerido'),
  orderStatus: z.string().min(1, 'Estado del pedido requerido'),
  paymentStatus: z.string().min(1, 'Estado de pago requerido'),
  orderTotal: z.string().min(1, 'Total del pedido requerido'),
  orderDate: z.string().min(1, 'Fecha del pedido requerida'),
  shippingAddress: z.string().optional(),
  billingAddress: z.string().optional(),
  storeId: z.string().min(1, 'ID de la tienda requerido'),
});

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
      storeId: validatedData.storeId,
      totalAmount: EmailFormattingUtils.parseCurrencyAmount(validatedData.orderTotal),
      currency: 'COP',
      status: validatedData.orderStatus,
      paymentStatus: validatedData.paymentStatus,
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
      return NextResponse.json(
        { error: 'Error enviando email de confirmación' },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('📧 Email de confirmación de pedido enviado exitosamente:', {
      orderId: validatedData.orderId,
      customerEmail: validatedData.customerEmail,
      orderStatus: validatedData.orderStatus,
      paymentStatus: validatedData.paymentStatus,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Email de confirmación de pedido enviado exitosamente',
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
    console.error('Error enviando email de confirmación de pedido:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: error.errors,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders });
  }
}
