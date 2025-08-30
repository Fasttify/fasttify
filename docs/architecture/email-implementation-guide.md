# Guía de Implementación del Sistema de Emails

## Resumen

Esta guía práctica te ayudará a implementar y usar el sistema de emails de Fasttify en tu aplicación. El sistema está diseñado para ser simple de usar pero robusto en producción.

## Configuración Inicial

### 1. Variables de Entorno Requeridas

```bash
# En tu archivo .env
SES_FROM_EMAIL=noreply@tudominio.com
SES_REPLY_TO_EMAIL=support@tudominio.com
LAMBDA_EMAIL_BULK=bulk-email-api-dev
```

### 2. Dependencias del Frontend

```bash
npm install @aws-sdk/client-lambda @aws-crypto/sha256-js @smithy/signature-v4
```

## Implementación Básica

### 1. Envío de Email de Confirmación de Orden

```typescript
import { EmailNotificationService } from '@renderer-engine/services/notifications/email-notification-service';

// En tu función de checkout
async function handleOrderCompletion(order: Order, checkoutSession: any) {
  try {
    // Enviar email de confirmación
    await EmailNotificationService.sendOrderConfirmation({
      order,
      storeName: 'Mi Tienda',
      customerName: checkoutSession.customerInfo?.name || 'Cliente',
      shippingAddress: checkoutSession.shippingAddress,
      billingAddress: checkoutSession.billingAddress,
    });

    console.log('✅ Email de confirmación enviado');
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    // No fallar el checkout por un error de email
  }
}
```

### 2. Integración con el Sistema de Carrito

```typescript
// En cart-ui.js o similar
setupCheckoutButtons() {
  const checkoutButton = this.sidebar.querySelector('[data-checkout-direct]');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        // Procesar checkout
        const order = await this.processCheckout();

        // Enviar email de confirmación
        await EmailNotificationService.sendOrderConfirmation({
          order,
          storeName: window.STORE_NAME,
          customerName: this.getCustomerName(),
          shippingAddress: this.getShippingAddress(),
          billingAddress: this.getBillingAddress(),
        });

        // Redirigir a página de éxito
        window.location.href = '/checkout/success';
      } catch (error) {
        console.error('Error en checkout:', error);
        this.showError('Error procesando el pedido');
      }
    });
  }
}
```

## Templates de Email Disponibles

### 1. Confirmación de Orden (`order-confirmation`)

**Variables Requeridas**:

```typescript
interface OrderConfirmationVariables {
  customerName: string; // Nombre del cliente
  orderId: string; // ID de la orden
  total: string; // Total formateado
  orderDate: string; // Fecha de la orden
  storeName: string; // Nombre de la tienda
  shippingAddress?: string; // Dirección de envío (opcional)
  billingAddress?: string; // Dirección de facturación (opcional)
}
```

**Ejemplo de Uso**:

```typescript
const templateVariables = {
  customerName: 'Juan Pérez',
  orderId: 'ORD-12345',
  total: '$99.99',
  orderDate: '15 de Enero, 2025',
  storeName: 'Mi Tienda Online',
  shippingAddress: 'Calle 123 #45-67\nBogotá, Colombia',
  billingAddress: 'Calle 123 #45-67\nBogotá, Colombia',
};
```

### 2. Actualización de Envío (`shipping-update`)

**Variables Requeridas**:

```typescript
interface ShippingUpdateVariables {
  customerName: string; // Nombre del cliente
  orderId: string; // ID de la orden
  trackingNumber: string; // Número de seguimiento
  carrier: string; // Empresa de transporte
  storeName: string; // Nombre de la tienda
}
```

### 3. Promociones (`promotion`)

**Variables Requeridas**:

```typescript
interface PromotionVariables {
  customerName: string; // Nombre del cliente
  title: string; // Título de la promoción
  content: string; // Contenido de la promoción
  storeName: string; // Nombre de la tienda
}
```

## Manejo de Direcciones

### 1. Extracción de Direcciones del Checkout

```typescript
import { EmailOrderService } from '@renderer-engine/services/notifications/email-order-service';

// Extraer dirección de envío
const shippingAddress = EmailOrderService.extractAddress(checkoutSession.shippingAddress);

// Extraer dirección de facturación
const billingAddress = EmailOrderService.extractAddress(checkoutSession.billingAddress);

// Formatear para el template
const formattedShippingAddress = EmailOrderService.formatAddressForTemplate(shippingAddress);
const formattedBillingAddress = EmailOrderService.formatAddressForTemplate(billingAddress);
```

### 2. Estructura de Dirección Esperada

```typescript
interface Address {
  address1?: string; // Dirección principal
  address2?: string; // Apartamento, suite, etc.
  city?: string; // Ciudad
  province?: string; // Estado/Provincia
  zip?: string; // Código postal
  country?: string; // País
}
```

### 3. Formateo Automático

El sistema automáticamente formatea las direcciones en múltiples líneas:

```typescript
// Input: Objeto Address
{
  address1: "Calle 123 #45-67",
  city: "Bogotá",
  province: "Cundinamarca",
  zip: "110111",
  country: "Colombia"
}

// Output: String formateado
"Calle 123 #45-67
Bogotá, Cundinamarca
110111, Colombia"
```

## Configuración de Prioridades

### 1. Prioridades Disponibles

```typescript
type EmailPriority = 'low' | 'normal' | 'high';
```

### 2. Uso por Tipo de Email

```typescript
// Alta prioridad - Confirmaciones de orden
const orderConfirmationData = {
  templateId: 'order-confirmation',
  recipients: [...],
  templateVariables: {...},
  priority: 'high' as const,  // Procesamiento inmediato
  metadata: {...},
};

// Prioridad normal - Promociones
const promotionalData = {
  templateId: 'promotion',
  recipients: [...],
  templateVariables: {...},
  priority: 'normal' as const,  // Procesamiento estándar
  metadata: {...},
};

// Baja prioridad - Newsletters
const newsletterData = {
  templateId: 'promotion',
  recipients: [...],
  templateVariables: {...},
  priority: 'low' as const,  // Procesamiento en horarios de baja demanda
  metadata: {...},
};
```

## Manejo de Errores

### 1. Try-Catch Básico

```typescript
try {
  await EmailNotificationService.sendOrderConfirmation({
    order,
    storeName: 'Mi Tienda',
    customerName: customerName,
  });
  console.log('✅ Email enviado exitosamente');
} catch (error) {
  console.error('❌ Error enviando email:', error);

  // No fallar el flujo principal por un error de email
  // El email se puede reintentar más tarde
}
```

### 2. Validación de Datos

```typescript
// Verificar que el cliente tenga email
if (!order.customerEmail) {
  console.warn('Cliente sin email, saltando envío de email');
  return;
}

// Verificar que la orden esté completa
if (!order.id || !order.totalAmount) {
  console.error('Orden incompleta, no se puede enviar email');
  return;
}
```

### 3. Fallbacks

```typescript
async function sendOrderEmail(order: Order) {
  try {
    // Intentar envío principal
    await EmailNotificationService.sendOrderConfirmation({
      order,
      storeName: 'Mi Tienda',
      customerName: order.customerName || 'Cliente',
    });
  } catch (error) {
    console.error('Error en envío principal:', error);

    try {
      // Fallback: Envío simple sin direcciones
      await EmailNotificationService.sendOrderConfirmation({
        order,
        storeName: 'Mi Tienda',
        customerName: order.customerName || 'Cliente',
        // Sin direcciones para simplificar
      });
    } catch (fallbackError) {
      console.error('Error en fallback:', fallbackError);
      // Log del error pero no fallar la aplicación
    }
  }
}
```

## Testing y Desarrollo

### 1. Email de Prueba

```typescript
// En desarrollo, puedes usar el endpoint de test
const testEmailData = {
  templateId: 'order-confirmation',
  recipients: [
    {
      email: 'test@example.com',
      name: 'Usuario de Prueba',
    },
  ],
  templateVariables: {
    customerName: 'Usuario de Prueba',
    orderId: 'TEST-123',
    total: '$50.00',
    orderDate: '15 de Enero, 2025',
    storeName: 'Tienda de Prueba',
    shippingAddress: 'Dirección de Prueba\nCiudad, País',
    billingAddress: 'Dirección de Prueba\nCiudad, País',
  },
  priority: 'high',
  metadata: {
    test: true,
    environment: 'development',
  },
};
```

### 2. Logging en Desarrollo

```typescript
// Habilitar logs detallados en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('📧 Enviando email:', {
    templateId: emailData.templateId,
    recipient: emailData.recipients[0].email,
    variables: emailData.templateVariables,
  });
}
```

### 3. Mock para Testing

```typescript
// En tests, puedes mockear el servicio
jest.mock('@renderer-engine/services/notifications/email-notification-service', () => ({
  EmailNotificationService: {
    sendOrderConfirmation: jest.fn().mockResolvedValue(true),
  },
}));
```

## Monitoreo y Métricas

### 1. Logs Importantes

```typescript
// Logs que deberías ver en producción
console.log('📧 Sending order confirmation email for order:', order.id);
console.log('✅ Order confirmation email sent successfully for order', order.id);
console.log('❌ Error sending order confirmation email for order', order.id);
```

### 2. Métricas de CloudWatch

- **Emails enviados por minuto**
- **Tasa de entrega**
- **Tiempo de procesamiento**
- **Errores por tipo**

### 3. Alertas Recomendadas

- **Tasa de error > 5%**
- **Latencia > 30 segundos**
- **Cola SQS > 1000 mensajes**

## Optimizaciones de Performance

### 1. Envío Asíncrono

```typescript
// Usar setImmediate para no bloquear la respuesta
setImmediate(async () => {
  try {
    await EmailNotificationService.sendOrderConfirmation({
      order,
      storeName: 'Mi Tienda',
      customerName: customerName,
    });
  } catch (error) {
    console.error('Error en envío asíncrono:', error);
  }
});
```

### 2. Batch de Emails

```typescript
// Para múltiples emails, usar el sistema de colas
const batchEmails = orders.map((order) => ({
  templateId: 'order-confirmation',
  recipients: [{ email: order.customerEmail, name: order.customerName }],
  templateVariables: {
    /* ... */
  },
  priority: 'normal',
}));

// El sistema procesará en lotes automáticamente
```

### 3. Cache de Templates

Los templates se compilan una vez y se cachean automáticamente. No necesitas hacer nada especial.

## Troubleshooting Común

### 1. Email no se envía

**Verificar**:

- Variables de entorno configuradas
- Permisos de IAM correctos
- Logs de CloudWatch
- Estado de las colas SQS

### 2. Direcciones aparecen como "Address not specified"

**Verificar**:

- Estructura del objeto de dirección
- Campos requeridos presentes
- Formato de datos del checkout

### 3. Error 403 Forbidden

**Verificar**:

- Configuración de CORS
- Permisos de Lambda
- Variables de entorno

### 4. Timeout en envío

**Verificar**:

- Tamaño del lote de emails
- Configuración de timeout de Lambda
- Rate limiting configurado

## Ejemplos Completos

### 1. Integración Completa en Checkout

```typescript
// En tu función de checkout
export async function completeCheckout(orderData: OrderData, sessionData: any) {
  try {
    // 1. Crear la orden
    const order = await createOrder(orderData);

    // 2. Enviar email de confirmación (asíncrono)
    setImmediate(async () => {
      try {
        const storeInfo = await getStoreInfo(sessionData.storeId);
        const customerName = extractCustomerName(sessionData.customerInfo);
        const shippingAddress = extractAddress(sessionData.shippingAddress);
        const billingAddress = extractAddress(sessionData.billingAddress);

        await EmailNotificationService.sendOrderConfirmation({
          order,
          storeName: storeInfo.name,
          customerName,
          shippingAddress,
          billingAddress,
        });

        console.log('✅ Email de confirmación enviado para orden:', order.id);
      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError);
        // No fallar el checkout por un error de email
      }
    });

    // 3. Retornar respuesta exitosa
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Error en checkout:', error);
    throw error;
  }
}
```

### 2. Servicio de Notificaciones

```typescript
export class NotificationService {
  static async sendOrderNotifications(order: Order, sessionData: any) {
    try {
      // Email al cliente
      await this.sendCustomerConfirmation(order, sessionData);

      // Email al dueño de la tienda (futuro)
      // await this.sendStoreNotification(order, sessionData);

      console.log('✅ Notificaciones enviadas para orden:', order.id);
    } catch (error) {
      console.error('❌ Error enviando notificaciones:', error);
      // No fallar por errores de notificación
    }
  }

  private static async sendCustomerConfirmation(order: Order, sessionData: any) {
    const storeInfo = await this.getStoreInfo(sessionData.storeId);
    const customerName = this.extractCustomerName(sessionData.customerInfo);
    const shippingAddress = this.extractAddress(sessionData.shippingAddress);
    const billingAddress = this.extractAddress(sessionData.billingAddress);

    await EmailNotificationService.sendOrderConfirmation({
      order,
      storeName: storeInfo.name,
      customerName,
      shippingAddress,
      billingAddress,
    });
  }
}
```

## Próximos Pasos

1. **Implementar en tu checkout** siguiendo los ejemplos
2. **Configurar variables de entorno** para producción
3. **Monitorear logs** en CloudWatch
4. **Configurar alertas** para errores críticos
5. **Personalizar templates** según tu marca

---

**¿Necesitas ayuda?** El sistema está diseñado para ser simple de usar. Si tienes problemas específicos, revisa los logs de CloudWatch o consulta la documentación de troubleshooting.
