# Troubleshooting del Sistema de Emails

## Resumen

Esta guía te ayudará a resolver los problemas más comunes del sistema de emails de Fasttify. Cada problema incluye síntomas, causas y soluciones específicas.

## Problemas de Autenticación y Permisos

### 1. Error 403 - MissingAuthenticationTokenException

**Síntomas**:

```
Error llamando a la API de bulk-email: Error: HTTP error! status: 403
```

**Causa**: La API requiere autenticación IAM pero no se están enviando las credenciales correctas.

**Solución**:

```typescript
// Usar direct Lambda invocation en lugar de API Gateway
private static async sendBulkEmail(emailData: any): Promise<boolean> {
  try {
    const lambdaClient = new LambdaClient({ region: 'us-east-2' });

    const command = new InvokeCommand({
      FunctionName: process.env.LAMBDA_EMAIL_BULK,
      InvocationType: 'Event',
      Payload: JSON.stringify({
        httpMethod: 'POST',
        path: '/send-bulk',
        body: JSON.stringify(emailData),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        requestContext: {
          path: '/send-bulk',
        },
      }),
    });

    const response = await lambdaClient.send(command);
    return response.StatusCode === 202;
  } catch (error) {
    console.error('Error request to lambda bulk-email:', error);
    return false;
  }
}
```

### 2. Error 403 - ForbiddenException

**Síntomas**:

```
API Error: 403 - Forbidden
Error response body: {"message":"Forbidden"}
```

**Causa**: Permisos IAM insuficientes para la función Lambda.

**Solución**:
Verificar que el rol de ejecución tenga estos permisos:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["lambda:InvokeFunction"],
      "Resource": "arn:aws:lambda:us-east-2:*:function:bulk-email-api-*"
    }
  ]
}
```

### 3. Error 404 - No method found matching route

**Síntomas**:

```
API Error: 404 - Not Found
Error response body: {"message":"No method found matching route send-bulk for http method POST."}
```

**Causa**: Ruta de API incorrecta o función Lambda no configurada.

**Solución**:

- Verificar que la función `bulk-email-api` esté desplegada
- Usar la ruta correcta: `/send-bulk`
- Verificar configuración de API Gateway

## Problemas de Direcciones

### 4. Direcciones aparecen como "[object Object]"

**Síntomas**:

```
Envío a: Stiven

[object Object]

Facturación:

[object Object]
```

**Causa**: Las direcciones se están pasando como objetos en lugar de strings formateados.

**Solución**:

```typescript
// En EmailOrderService, formatear direcciones antes de enviar
const formattedShippingAddress = shippingAddress ?
  this.formatAddressForTemplate(shippingAddress) : undefined;
const formattedBillingAddress = billingAddress ?
  this.formatAddressForTemplate(billingAddress) : undefined;

// Método formatAddressForTemplate
private static formatAddressForTemplate(address: any): string {
  if (!address) return '';

  const lines: string[] = [];

  if (address.address1) lines.push(address.address1);
  if (address.address2) lines.push(address.address2);

  if (address.city) {
    const cityLine = address.province ?
      `${address.city}, ${address.province}` : address.city;
    lines.push(cityLine);
  }

  if (address.zip || address.country) {
    const zipCountry = [address.zip, address.country].filter(Boolean).join(', ');
    if (zipCountry) lines.push(zipCountry);
  }

  return lines.join('\n');
}
```

### 5. Direcciones aparecen como "Address not specified"

**Síntomas**:

```
Envío a: Stiven

Address not specified

Facturación:

Address not specified
```

**Causa**: La función `formatAddress` está siendo demasiado estricta en la validación.

**Solución**:

```typescript
private static formatAddress(address: Address | string): string {
  // Si ya es un string, devolverlo directamente
  if (typeof address === 'string') {
    return address;
  }

  if (!address) return 'Address not specified';

  const addressParts = [
    address.address1,
    address.address2,
    address.city,
    address.province,
    address.zip,
    address.country,
  ].filter(Boolean); // Remover valores undefined/null

  // Si no hay ninguna parte de dirección válida
  if (addressParts.length === 0) {
    return 'Address not specified';
  }

  return addressParts.join(', ');
}
```

## Problemas de CORS

### 6. Error de CORS en desarrollo local

**Síntomas**:

```
Access to fetch at 'http://localhost:3000/api/...' from origin 'http://palo-alto.localhost:3000' has been blocked by CORS policy
```

**Causa**: Configuración de CORS no incluye subdominios de localhost.

**Solución**:

```typescript
// En amplify/functions/shared/cors.ts
export const getCorsHeaders = (origin?: string) => {
  const exactOrigins = [
    'http://localhost:3000',
    'http://palo-alto.localhost:3000', // Agregar tu subdominio
    // ... otros orígenes
  ];

  const wildcardRegexes = [
    /^[a-zA-Z0-9-]+\.localhost:\d+$/, // Regex para subdominios de localhost
    // ... otros patrones
  ];

  // ... resto de la lógica
};
```

### 7. Error de CORS en producción

**Síntomas**:

```
Access to fetch at 'https://api.fasttify.com/...' from origin 'https://mitienda.com' has been blocked by CORS policy
```

**Causa**: Dominios de producción no incluidos en la configuración CORS.

**Solución**:

```typescript
// En amplify/config/environment.ts
export const corsConfig = {
  allowOrigins: [
    'https://fasttify.com',
    'https://www.fasttify.com',
    'https://*.fasttify.com', // Permitir subdominios
  ],
  // ... resto de la configuración
};
```

## Problemas de Templates

### 8. Variables de template no se reemplazan

**Síntomas**:

```
Email recibido con: {{customerName}} en lugar de "Juan Pérez"
```

**Causa**: Variables no incluidas en `requiredVariables` del template.

**Solución**:

```typescript
// En scripts/compile-email-templates.ts
function getRequiredVariables(templateId: keyof TemplateVariables): string[] {
  const variables = {
    'order-confirmation': [
      'customerName',
      'orderId',
      'total',
      'orderDate',
      'storeName',
      'shippingAddress', // Agregar si no está
      'billingAddress', // Agregar si no está
    ],
    // ... otros templates
  };
  return variables[templateId];
}
```

### 9. Template no encontrado

**Síntomas**:

```
Error: Template 'order-confirmation' not found
```

**Causa**: Template no compilado o archivo `templates.json` corrupto.

**Solución**:

```bash
# Recompilar templates
npm run compile-email-templates

# Verificar que se generó el archivo
ls amplify/functions/bulk-email/compiled-templates/templates.json
```

## Problemas de Rate Limiting

### 10. Emails se envían muy lento

**Síntomas**:

```
Emails tardan varios minutos en enviarse
```

**Causa**: Rate limiting configurado muy bajo o colas SQS saturadas.

**Solución**:

```typescript
// En amplify/functions/bulk-email/resource.ts
environment: {
  RATE_LIMIT_PER_SECOND: '14',  // Aumentar si es necesario
  EMAIL_BATCH_SIZE: '20',        // Aumentar tamaño de lote
  // ... otras variables
}
```

### 11. Cola SQS se llena

**Síntomas**:

```
Mensajes en cola SQS pero no se procesan
```

**Causa**: `bulk-email-processor` no está funcionando o está fallando.

**Solución**:

```bash
# Verificar estado de la función
aws lambda get-function --function-name bulk-email-processor

# Ver logs de errores
aws logs tail /aws/lambda/bulk-email-processor --follow

# Verificar métricas de SQS
aws sqs get-queue-attributes --queue-url [URL_COLA]
```

## Problemas de Moneda y Formateo

### 12. Moneda no se formatea correctamente

**Síntomas**:

```
Email muestra: 99.99 en lugar de $99.99
```

**Causa**: Función `formatCurrency` no configurada correctamente.

**Solución**:

```typescript
// En email-notification-service.ts
private static formatCurrency(amount: number, currency: string): string {
  try {
    if (typeof amount !== 'number') return 'N/A';

    const config = getCurrencyConfig(currency);

    const formattedAmount = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    }).format(amount);

    return config.format.replace('{{amount}}', formattedAmount);
  } catch (error) {
    console.warn('Error formatting currency:', error);
    return `${amount} ${currency}`;
  }
}
```

### 13. Fechas no se formatean correctamente

**Síntomas**:

```
Email muestra: 2025-01-15T10:30:00Z en lugar de "15 de Enero, 2025"
```

**Causa**: Función `formatDate` no implementada o configurada.

**Solución**:

```typescript
private static formatDate(dateString?: string): string {
  try {
    if (!dateString) {
      return new Date().toLocaleDateString('es-ES');
    }

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return new Date().toLocaleDateString('es-ES');
  }
}
```

## Problemas de Logging y Debugging

### 14. No hay logs de email

**Síntomas**:

```
No se ven logs de envío de emails en CloudWatch
```

**Causa**: Logging deshabilitado o nivel de log muy alto.

**Solución**:

```typescript
// Agregar logs detallados
console.log('📧 Sending order confirmation email for order:', request.order.id);
console.log('📧 Email data:', JSON.stringify(emailData, null, 2));

// En el método sendBulkEmail
console.log('✅ Lambda invoked successfully:', { response });
```

### 15. Logs confusos o poco claros

**Síntomas**:

```
Logs no muestran información útil para debugging
```

**Causa**: Logs genéricos sin contexto específico.

**Solución**:

```typescript
// Logs estructurados y claros
console.log('📧 [EmailService] Starting email send', {
  templateId: emailData.templateId,
  recipientCount: emailData.recipients.length,
  orderId: emailData.metadata?.orderId,
  timestamp: new Date().toISOString(),
});

console.log('📧 [EmailService] Email sent successfully', {
  templateId: emailData.templateId,
  orderId: emailData.metadata?.orderId,
  timestamp: new Date().toISOString(),
});
```

## Problemas de Integración

### 16. Email se envía pero no se recibe

**Síntomas**:

```
Logs muestran éxito pero cliente no recibe email
```

**Causa**: Problema con SES, spam filters, o email incorrecto.

**Solución**:

```bash
# Verificar estado de SES
aws ses get-send-statistics

# Verificar que el dominio esté verificado
aws ses list-verified-email-addresses

# Verificar logs de bounces
aws ses list-bounced-recipients
```

### 17. Email se envía múltiples veces

**Síntomas**:

```
Cliente recibe el mismo email varias veces
```

**Causa**: Múltiples llamadas al servicio o duplicación en cola SQS.

**Solución**:

```typescript
// Implementar deduplicación
const emailKey = `${order.id}-${Date.now()}`;

// Verificar si ya se envió
if (this.sentEmails.has(emailKey)) {
  console.log('Email already sent, skipping:', emailKey);
  return;
}

// Marcar como enviado
this.sentEmails.add(emailKey);

// Enviar email
await this.sendBulkEmail(emailData);
```

## Comandos de Debugging Útiles

### Verificar Estado del Sistema

```bash
# Estado de las funciones Lambda
aws lambda get-function --function-name bulk-email-api
aws lambda get-function --function-name bulk-email-processor

# Logs en tiempo real
aws logs tail /aws/lambda/bulk-email-api --follow
aws logs tail /aws/lambda/bulk-email-processor --follow

# Estado de las colas SQS
aws sqs get-queue-attributes --queue-url [URL_COLA]

# Métricas de CloudWatch
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=bulk-email-api \
  --start-time 2025-01-15T00:00:00Z \
  --end-time 2025-01-15T23:59:59Z \
  --period 3600 \
  --statistics Average
```

### Testing de Endpoints

```bash
# Test de email directo
curl -X POST https://[API_ID].execute-api.us-east-2.amazonaws.com/dev/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "order-confirmation",
    "recipients": [{"email": "test@example.com"}],
    "templateVariables": {
      "customerName": "Test User",
      "orderId": "TEST-123",
      "total": "$50.00",
      "orderDate": "15 de Enero, 2025",
      "storeName": "Test Store"
    }
  }'
```

## Checklist de Verificación

### Antes de Reportar un Problema

- [ ] Verificar logs de CloudWatch
- [ ] Confirmar configuración de variables de entorno
- [ ] Verificar permisos IAM
- [ ] Probar con email de test
- [ ] Verificar estado de las funciones Lambda
- [ ] Confirmar que las colas SQS están funcionando

### Información Necesaria para Reportar

- **Error específico**: Mensaje de error completo
- **Timestamp**: Cuándo ocurrió el problema
- **Contexto**: Qué acción estaba realizando el usuario
- **Logs**: Logs relevantes de CloudWatch
- **Configuración**: Variables de entorno y configuración
- **Pasos para reproducir**: Cómo replicar el problema

## Recursos Adicionales

- [Documentación del Sistema de Emails](./email-queue-system.md)
- [Guía de Implementación](./email-implementation-guide.md)
- [Logs de CloudWatch](https://console.aws.amazon.com/cloudwatch/)
- [Documentación de SES](https://docs.aws.amazon.com/ses/)
- [Documentación de SQS](https://docs.aws.amazon.com/sqs/)

---

**¿Sigues teniendo problemas?** Si ninguna de estas soluciones funciona, revisa los logs de CloudWatch para obtener más detalles sobre el error específico.
