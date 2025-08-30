# Sistema de Emails con Colas - Arquitectura y Implementación

## Resumen del Sistema

El sistema de emails con colas de Fasttify proporciona una infraestructura robusta y escalable para el envío automático de emails transaccionales y de marketing. El sistema utiliza AWS Lambda, SQS (Simple Queue Service) y SES (Simple Email Service) para garantizar la entrega confiable de emails con manejo de reintentos y métricas detalladas.

## Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │  Lambda API     │
│   (Next.js)     │───▶│                 │───▶│  (bulk-email-api)│
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │  SQS Queue      │    │  Lambda Processor│
         │              │                 │    │  (bulk-email-   │
         │              │ (Email Jobs)    │◄───│  processor)     │
         └──────────────└─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  SES Service    │    │  CloudWatch     │
                       │                 │    │                 │
                       │ (Email Delivery)│    │ (Metrics & Logs)│
                       └─────────────────┘    └─────────────────┘
```

## Componentes del Sistema

### 1. Lambda Functions

#### `bulk-email-api` (API HTTP)

**Propósito**: Endpoint HTTP para recibir solicitudes de envío de emails.

**Características**:

- **Timeout**: 30 segundos
- **Memoria**: 512 MB
- **Endpoints**:
  - `POST /send-bulk` - Envío masivo de emails
  - `POST /test-email` - Email de prueba

**Funcionalidades**:

- Validación de requests
- Generación de IDs de campaña
- Envío a cola SQS
- Manejo de CORS
- Logging de métricas

#### `bulk-email-processor` (Consumidor SQS)

**Propósito**: Procesa emails desde la cola SQS y los envía a través de SES.

**Características**:

- **Timeout**: 900 segundos (15 minutos)
- **Memoria**: 1024 MB
- **Procesamiento por lotes**: 10 emails por lote
- **Reintentos**: Máximo 3 intentos
- **Rate limiting**: 14 emails por segundo

### 2. Colas SQS

#### Cola Principal de Emails

- **Propósito**: Almacena trabajos de email para procesamiento
- **Prioridad**: Normal
- **Retención**: 14 días
- **Visibilidad**: 30 segundos

#### Cola de Alta Prioridad

- **Propósito**: Emails urgentes (confirmaciones de orden)
- **Prioridad**: Alta
- **Procesamiento**: Inmediato
- **Retención**: 7 días

### 3. Servicios de Email

#### EmailService

Maneja la comunicación directa con AWS SES:

- Envío de emails individuales
- Validación de direcciones
- Manejo de respuestas de SES
- Logging de entregas

#### EmailQueueService

Gestiona las operaciones de cola:

- Envío de mensajes a SQS
- Recepción de mensajes
- Manejo de reintentos
- Limpieza de mensajes procesados

## Flujo de Envío de Emails

### 1. Solicitud de Envío

```typescript
// Ejemplo: Envío de confirmación de orden
const emailData = {
  templateId: 'order-confirmation',
  recipients: [
    {
      email: 'cliente@email.com',
      name: 'Nombre del Cliente',
      userId: 'user_123',
      storeId: 'store_456',
    },
  ],
  templateVariables: {
    customerName: 'Nombre del Cliente',
    orderId: 'ORD-123',
    total: '$99.99',
    orderDate: '2024-01-15',
    storeName: 'Mi Tienda',
    shippingAddress: 'Dirección de envío...',
    billingAddress: 'Dirección de facturación...',
  },
  priority: 'high',
  metadata: {
    orderId: 'ORD-123',
    storeId: 'store_456',
    notificationType: 'customer_confirmation',
  },
};
```

### 2. Validación y Procesamiento

1. **Validación del Request**:
   - Verificación de campos requeridos
   - Validación de formato de email
   - Sanitización de variables del template

2. **Generación de Campaña**:
   - ID único de campaña (UUID v4)
   - Timestamp de creación
   - Metadatos de tracking

3. **Envío a Cola SQS**:
   - Mensaje serializado
   - Prioridad configurada
   - Metadatos adjuntos

### 3. Procesamiento por Lotes

1. **Consumo de Cola**:
   - Polling de mensajes SQS
   - Procesamiento en lotes de 10
   - Rate limiting de 14 emails/segundo

2. **Preparación de Emails**:
   - Compilación de templates
   - Sustitución de variables
   - Validación de contenido

3. **Envío a SES**:
   - Llamadas a AWS SES API
   - Manejo de respuestas
   - Logging de resultados

## Tipos de Email Soportados

### 1. Confirmación de Orden

**Template ID**: `order-confirmation`

**Variables Requeridas**:

- `customerName` - Nombre del cliente
- `orderId` - ID de la orden
- `total` - Total de la orden
- `orderDate` - Fecha de la orden
- `storeName` - Nombre de la tienda
- `shippingAddress` - Dirección de envío (opcional)
- `billingAddress` - Dirección de facturación (opcional)

**Uso**:

```typescript
await EmailNotificationService.sendOrderConfirmation({
  order: orderData,
  storeName: 'Mi Tienda',
  customerName: 'Cliente',
  shippingAddress: formattedShippingAddress,
  billingAddress: formattedBillingAddress,
});
```

### 2. Actualización de Envío

**Template ID**: `shipping-update`

**Variables Requeridas**:

- `customerName` - Nombre del cliente
- `orderId` - ID de la orden
- `trackingNumber` - Número de seguimiento
- `carrier` - Empresa de transporte
- `storeName` - Nombre de la tienda

### 3. Promociones

**Template ID**: `promotion`

**Variables Requeridas**:

- `customerName` - Nombre del cliente
- `title` - Título de la promoción
- `content` - Contenido de la promoción
- `storeName` - Nombre de la tienda

## Configuración del Sistema

### Variables de Entorno

#### Para `bulk-email-api`:

```bash
SES_FROM_EMAIL=secret('SES_FROM_EMAIL')
EMAIL_BATCH_SIZE=10
EMAIL_QUEUE_URL=placeholder
HIGH_PRIORITY_QUEUE_URL=placeholder
```

#### Para `bulk-email-processor`:

```bash
SES_FROM_EMAIL=secret('SES_FROM_EMAIL')
SES_REPLY_TO_EMAIL=secret('SES_REPLY_TO_EMAIL')
EMAIL_BATCH_SIZE=10
MAX_RETRIES=3
RATE_LIMIT_PER_SECOND=14
EMAIL_QUEUE_URL=placeholder
HIGH_PRIORITY_QUEUE_URL=placeholder
```

### Configuración de SES

```typescript
// amplify/functions/bulk-email/config/email-config.ts
export const getEmailConfig = () => ({
  defaultFromEmail: env.SES_FROM_EMAIL,
  defaultReplyToEmail: env.SES_REPLY_TO_EMAIL,
  region: 'us-east-2',
  maxRetries: 3,
  batchSize: 10,
  rateLimitPerSecond: 14,
});
```

## Integración con Frontend

### EmailNotificationService

Servicio intermediario que prepara y envía emails desde el frontend:

```typescript
export class EmailNotificationService {
  static async sendOrderConfirmation(request: OrderConfirmationEmailRequest): Promise<boolean>;
  static async sendShippingUpdate(request: ShippingUpdateRequest): Promise<boolean>;
  static async sendPromotionalEmail(request: PromotionalEmailRequest): Promise<boolean>;
}
```

### EmailOrderService

Servicio específico para emails relacionados con órdenes:

```typescript
export class EmailOrderService {
  static async sendOrderConfirmationEmail(order: Order, checkoutSession: any): Promise<void>;
  static getStoreInfo(storeId: string): Promise<StoreInfo>;
  static extractCustomerName(customerInfo: any): string;
  static extractAddress(addressData: any): Address;
  static normalizeAddress(address: any): Address;
  static formatAddressForTemplate(address: Address): string;
}
```

## Manejo de Errores y Reintentos

### Estrategia de Reintentos

1. **Primer intento**: Inmediato
2. **Segundo intento**: Después de 1 minuto
3. **Tercer intento**: Después de 5 minutos
4. **Fallback**: Email marcado como fallido

### Tipos de Errores

- **Errores temporales**: Reintentos automáticos
- **Errores permanentes**: Marcado como fallido
- **Rate limiting**: Backoff exponencial
- **Errores de SES**: Logging detallado

### Logging y Monitoreo

```typescript
// Métricas recolectadas
interface EmailMetrics {
  campaignId?: string;
  templateId: string;
  totalSent: number;
  deliveryRate: number;
  bounceRate: number;
  complaintRate: number;
  openRate?: number;
  clickRate?: number;
  lastUpdated: Date;
}
```

## Performance y Escalabilidad

### Optimizaciones Implementadas

1. **Procesamiento por lotes**: 10 emails por lote
2. **Rate limiting**: 14 emails por segundo
3. **Timeout configurable**: 15 minutos para lotes grandes
4. **Memoria optimizada**: 1GB para procesamiento
5. **Concurrencia**: Múltiples instancias Lambda

### Límites del Sistema

- **Emails por lote**: 10 (configurable)
- **Rate limit**: 14 emails/segundo
- **Timeout máximo**: 15 minutos
- **Reintentos**: 3 por email
- **Retención SQS**: 14 días

## Seguridad

### Autenticación y Autorización

- **API Gateway**: Protección con IAM
- **Lambda**: Roles de ejecución con permisos mínimos
- **SES**: Verificación de dominios
- **SQS**: Encriptación en tránsito y en reposo

### Validación de Datos

- **Sanitización**: Variables del template
- **Validación**: Formato de emails
- **Rate limiting**: Por IP y por usuario
- **Logging**: Auditoría completa

## Troubleshooting

### Problemas Comunes

#### 1. Emails no se envían

**Verificar**:

- Configuración de SES
- Permisos de IAM
- Estado de las colas SQS
- Logs de CloudWatch

#### 2. Emails en cola pero no procesados

**Verificar**:

- Estado de `bulk-email-processor`
- Configuración de SQS
- Límites de rate limiting
- Timeout de Lambda

#### 3. Errores de template

**Verificar**:

- Variables requeridas
- Formato de templates
- Validación de datos
- Logs de compilación

### Debugging

```bash
# Ver logs de la API
aws logs tail /aws/lambda/bulk-email-api --follow

# Ver logs del procesador
aws logs tail /aws/lambda/bulk-email-processor --follow

# Ver estado de las colas SQS
aws sqs get-queue-attributes --queue-url [URL_COLA]
```

## Métricas y Monitoreo

### CloudWatch Metrics

- **Emails enviados**: Por minuto/hora/día
- **Tasa de entrega**: Porcentaje de éxito
- **Tiempo de procesamiento**: Latencia por lote
- **Errores**: Por tipo y frecuencia

### Dashboards Recomendados

1. **Overview del Sistema**: Emails totales, tasa de éxito
2. **Performance**: Latencia, throughput
3. **Errores**: Tipos, frecuencia, tendencias
4. **Costos**: Uso de SES, Lambda, SQS

## Costos Estimados

### Componentes de Costo

- **Lambda**: ~$0.20 por millón de invocaciones
- **SQS**: ~$0.40 por millón de mensajes
- **SES**: ~$0.10 por 1000 emails
- **CloudWatch**: ~$0.50 por millón de métricas

### Optimización de Costos

1. **Batch processing**: Reducir invocaciones Lambda
2. **Rate limiting**: Evitar picos de tráfico
3. **Retención SQS**: Configurar límites apropiados
4. **Logging**: Nivel de detalle configurable

## Próximas Mejoras

### Corto Plazo

- [ ] Templates de email personalizables
- [ ] Scheduling de emails
- [ ] A/B testing de templates
- [ ] Analytics de engagement

### Mediano Plazo

- [ ] Integración con proveedores de email alternativos
- [ ] Sistema de suscripciones
- [ ] Personalización dinámica
- [ ] Machine learning para optimización

### Largo Plazo

- [ ] Email marketing automation
- [ ] Segmentación avanzada
- [ ] Integración con CRM
- [ ] Predictive analytics

---

**Implementado exitosamente en Enero 2025**

El sistema está completamente funcional y optimizado para producción, proporcionando una infraestructura robusta para el envío de emails transaccionales y de marketing en Fasttify.
