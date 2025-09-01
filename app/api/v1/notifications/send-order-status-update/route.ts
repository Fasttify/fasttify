import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';
import { EmailAdminService } from '@/app/store/services';

// Schema de validación para la solicitud
const sendOrderStatusUpdateSchema = z.object({
  orderId: z.string().min(1, 'ID del pedido requerido'),
  customerEmail: z.string().email('Email del cliente inválido'),
  customerName: z.string().min(1, 'Nombre del cliente requerido'),
  storeName: z.string().min(1, 'Nombre de la tienda requerido'),
  previousOrderStatus: z.string().min(1, 'Estado anterior del pedido requerido'),
  newOrderStatus: z.string().min(1, 'Nuevo estado del pedido requerido'),
  previousPaymentStatus: z.string().min(1, 'Estado anterior de pago requerido'),
  newPaymentStatus: z.string().min(1, 'Nuevo estado de pago requerido'),
  orderTotal: z.string().min(1, 'Total del pedido requerido'),
  orderDate: z.string().min(1, 'Fecha del pedido requerida'),
  shippingAddress: z.string().optional(),
  billingAddress: z.string().optional(),
  updateNotes: z.string().optional(),
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
      return NextResponse.json(
        { error: 'Error enviando email de actualización de estado' },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('📧 Email de actualización de estado enviado exitosamente:', {
      orderId: validatedData.orderId,
      customerEmail: validatedData.customerEmail,
      statusChange: `${validatedData.previousOrderStatus} → ${validatedData.newOrderStatus}`,
      paymentChange: `${validatedData.previousPaymentStatus} → ${validatedData.newPaymentStatus}`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Email de actualización de estado enviado exitosamente',
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
    console.error('Error enviando email de actualización de estado:', error);

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
