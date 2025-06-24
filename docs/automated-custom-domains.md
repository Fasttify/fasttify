# Sistema Automatizado de Dominios Personalizados

## Resumen del Sistema

Hemos implementado un **sistema completamente automatizado** para la configuración de dominios personalizados que permite a los usuarios configurar sus propios dominios (como `mitienda.com`) de forma sencilla a través del panel de administración.

### Características Principales

- **Configuración automática**: Creación automatizada de tenants de CloudFront Multi-Tenant
- **SSL automático**: Certificados SSL generados automáticamente
- **Verificación en tiempo real**: Monitoreo automático del estado DNS y del tenant
- **Verificación periódica**: Sistema que verifica estados cada hora automáticamente
- **Interfaz intuitiva**: Wizard paso a paso con instrucciones detalladas
- **Instrucciones DNS**: Guías específicas por proveedor (Cloudflare, GoDaddy, etc.)

## Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Panel Admin   │    │   Next.js API   │    │  CloudFront MT  │
│                 │───▶│                 │───▶│                 │
│ (Configuración) │    │ (Gestión CRUD)  │    │ (Tenant + SSL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │  Base de Datos  │              │
         │              │                 │              │
         │              │ (Estado Domain) │              │
         │              └─────────────────┘              │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DNS Usuario   │    │ Lambda Verifier │    │  DNS Resolver   │
│                 │    │                 │    │                 │
│ (CNAME Config)  │    │(Verificación)   │    │ (Validación)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       ▲
         │                       │
         │              ┌─────────────────┐
         │              │ EventBridge     │
         │              │                 │
         └──────────────│ (Cada 1 hora)   │
                        └─────────────────┘
```

## Flujo de Configuración para el Usuario

### 1. Paso Inicial - Configuración

- Usuario ingresa su dominio (ej: `mitienda.com`)
- Validación automática del formato del dominio
- Verificación de disponibilidad (no duplicados)

### 2. Creación Automática del Tenant

- Creación automática del tenant en CloudFront Multi-Tenant
- Configuración del origen (`fasttify.com`)
- Asignación automática de certificado SSL
- Configuración de Lambda@Edge para reescritura de headers

### 3. Instrucciones DNS

- Generación automática de instrucciones DNS específicas
- Información del CNAME que debe configurar el usuario
- Guías detalladas por proveedor (Cloudflare, GoDaddy, Namecheap, Route53)
- Botones de "copiar al portapapeles" para facilitar la configuración

### 4. Verificación y Activación

- Verificación automática del estado del tenant
- Validación de la configuración DNS
- Actualización automática del estado en base de datos
- Notificación cuando el dominio esté activo

## Componentes del Sistema

### Frontend

#### `AutomatedCustomDomainDialog.tsx`

Wizard completamente automatizado con 5 pasos:

1. **Input**: Ingreso y validación del dominio
2. **Creating**: Spinner mientras se crea el tenant
3. **DNS Setup**: Instrucciones detalladas de configuración DNS
4. **Verification**: Verificación del estado con botón de "verificar nuevamente"
5. **Complete**: Confirmación de éxito

**Características:**

- Progress bar visual con iconos de estado
- Instrucciones específicas por proveedor DNS
- Copy-to-clipboard para valores DNS
- Verificación en tiempo real
- Manejo de errores con mensajes descriptivos

### Backend

#### API REST: `/api/stores/[storeId]/custom-domain`

**GET** - Obtener estado del dominio

```typescript
{
  hasCustomDomain: boolean
  domain: string | null
  status: 'pending' | 'active' | 'failed' | null
  verifiedAt: string | null
  cloudFrontTenantId: string | null
  cloudFrontStatus: TenantStatus | null
}
```

**POST** - Configurar nuevo dominio

```typescript
// Request
{
  customDomain: string
}

// Response
{
  success: boolean
  domain: string
  status: string
  tenantId: string
  endpoint: string
  verificationInfo: {
    type: 'CNAME'
    name: string
    value: string
    instructions: string
  }
}
```

**PATCH** - Verificar estado del dominio

```typescript
{
  status: 'pending' | 'active' | 'failed'
  verifiedAt: string | null
  tenantStatus: TenantStatus
  dnsStatus: DNSStatus
  isActive: boolean
}
```

**DELETE** - Eliminar dominio personalizado

```typescript
{
  success: boolean
  message: string
}
```

#### Servicio: `CloudFrontMultiTenantService`

Encapsula toda la lógica de gestión de CloudFront Multi-Tenant:

- `createTenant()`: Crear nuevo tenant con SSL automático
- `getTenantStatus()`: Obtener estado del tenant
- `deleteTenant()`: Eliminar tenant
- `verifyDNS()`: Verificar configuración DNS
- `listTenants()`: Listar todos los tenants

### Funciones Lambda

#### `customDomainVerifier`

Función para verificación individual o masiva de dominios:

```typescript
// Verificar dominio específico
{
  action: 'verify-domain'
  storeId: string
}

// Verificar todos los dominios pendientes
{
  action: 'verify-all'
}
```

**Responsabilidades:**

- Verificar estado del tenant en CloudFront
- Validar configuración DNS
- Actualizar estado en base de datos
- Detectar cambios de estado automáticamente

#### `customDomainScheduler`

Función programada que se ejecuta cada hora:

- Invoca `customDomainVerifier` con `action: 'verify-all'`
- Mantiene actualizado el estado de todos los dominios
- Logs detallados para monitoreo

### Base de Datos

Campos agregados al modelo `UserStore`:

```typescript
{
  customDomain?: string
  customDomainStatus?: 'pending' | 'active' | 'failed' | 'inactive'
  customDomainVerifiedAt?: string
  cloudFrontTenantId?: string        // ID del tenant en CloudFront MT
  cloudFrontEndpoint?: string        // Endpoint del tenant
  cloudflareHostnameId?: string      // Legacy - ya no se usa
}
```

## Ventajas del Sistema Automatizado

### Para los Usuarios

- **Simplicidad**: Solo necesitan configurar un CNAME
- **Rapidez**: Configuración en minutos vs horas/días
- **Confiabilidad**: SSL automático y verificación continua
- **Transparencia**: Estado visible en tiempo real

### Para el Negocio

- **Escalabilidad**: Manejo ilimitado de dominios
- **Eficiencia**: Proceso completamente automatizado
- **Costo-efectivo**: ~$3-7/mes por dominio vs soluciones más caras
- **Mantenimiento**: Sistema auto-gestionado

### Técnicas

- **Robustez**: Verificación automática cada hora
- **Monitoring**: Logs detallados para troubleshooting
- **Flexibilidad**: Soporte para múltiples proveedores DNS
- **Performance**: CDN global con Lambda@Edge

## Configuración de Producción

### Variables de Entorno Requeridas

```bash
CLOUDFRONT_MULTI_TENANT_DISTRIBUTION_ID=E2S54QFYG78KRA
CUSTOM_DOMAIN_VERIFIER_FUNCTION_NAME=customDomainVerifier
AWS_REGION=us-east-1
```

### Permisos AWS Necesarios

#### Para `customDomainVerifier`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateDistributionTenant",
        "cloudfront:DeleteDistributionTenant",
        "cloudfront:GetDistributionTenant",
        "cloudfront:ListDistributionTenants",
        "cloudfront:UpdateDistributionTenant"
      ],
      "Resource": "*"
    }
  ]
}
```

#### Para `customDomainScheduler`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["lambda:InvokeFunction"],
      "Resource": "arn:aws:lambda:REGION:ACCOUNT:function:customDomainVerifier"
    }
  ]
}
```

## Monitoreo y Troubleshooting

### Logs de CloudWatch

- **customDomainVerifier**: Verificaciones individuales y masivas
- **customDomainScheduler**: Ejecuciones programadas cada hora
- **API Requests**: Logs de todas las operaciones CRUD

### Estados de Dominio

- **pending**: Tenant creado, esperando configuración DNS
- **active**: Dominio funcionando correctamente
- **failed**: Error en tenant o configuración DNS
- **inactive**: Dominio desactivado temporalmente

### Verificaciones Manuales

```bash
# Verificar estado de un dominio específico
aws lambda invoke \
  --function-name customDomainVerifier \
  --payload '{"action":"verify-domain","storeId":"STORE_ID"}' \
  response.json

# Verificar todos los dominios
aws lambda invoke \
  --function-name customDomainVerifier \
  --payload '{"action":"verify-all"}' \
  response.json
```

## Próximas Mejoras

### Corto Plazo

- [ ] Notificaciones por email cuando un dominio se active
- [ ] Dashboard de estadísticas de dominios
- [ ] Validación avanzada de configuración DNS

### Mediano Plazo

- [ ] Soporte para subdominios personalizados
- [ ] Integración con proveedores DNS para configuración automática
- [ ] Métricas de rendimiento por dominio

### Largo Plazo

- [ ] Soporte para certificados SSL personalizados
- [ ] CDN edge locations personalizadas
- [ ] Configuraciones avanzadas de cache por dominio

---

**Implementado exitosamente el 23 de junio de 2025**

El sistema está completamente funcional y automatizado, proporcionando una experiencia fluida tanto para usuarios como para administradores.
