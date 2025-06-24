# Sistema de Dominios Personalizados con CloudFront Multi-Tenant

Este sistema permite que las tiendas de usuarios usen dominios personalizados (como `mitienda.com`) manteniendo toda la funcionalidad de la aplicación Next.js.

## Resumen

El sistema implementa una arquitectura de **CloudFront Multi-Tenant** que permite:

- **Subdominios**: `tienda.fasttify.com`
- **Dominios personalizados**: `mitienda.com`
- **SSL automático** para ambos tipos
- **Escalabilidad** para múltiples tenants
- **Resolución automática** en base de datos

## Arquitectura

```
Cliente (mitienda.com)
    ↓
CloudFront Multi-Tenant Distribution
    ↓
Distribution Tenant (específico por dominio)
    ↓
Lambda@Edge (Origin Request)
    ↓
Amplify Gen 2 (fasttify.com)
    ↓
Next.js App + Middleware
    ↓
Base de datos (Amplify Data)
```

## Componentes del Sistema

### 1. CloudFront Multi-Tenant Distribution

**Distribución principal** que actúa como template para todos los tenants:

- **ID**: `E2S54QFYG78KRA`
- **Función**: Template base para crear tenants
- **Estado**: No puede servir tráfico directamente

### 2. Distribution Tenants

**Instancias específicas** que heredan configuración del template:

- **Ejemplo**: `test-tenant` para `kingsdev.tech`
- **Endpoint**: `d3qt0kqv4ik0re.cloudfront.net`
- **Función**: Servir tráfico para dominios específicos
- **SSL**: Certificados automáticos por dominio

### 3. Lambda@Edge (Host Rewriter)

**Función crítica** que permite compatibilidad con Amplify:

- **Tipo**: Origin Request
- **Región**: us-east-1 (requerido)
- **ARN**: `arn:aws:lambda:us-east-1:626635400208:function:cloudfront-host-rewriter:1`

**Función**:

```javascript
exports.handler = async event => {
  const request = event.Records[0].cf.request
  const headers = request.headers

  // Preservar el dominio original
  headers['x-original-host'] = [
    {
      key: 'x-original-host',
      value: headers.host[0].value,
    },
  ]

  // Reemplazar con dominio de Amplify
  headers.host = [
    {
      key: 'Host',
      value: 'fasttify.com',
    },
  ]

  return request
}
```

### 4. Middleware Next.js

**Middleware actualizado** para manejar dominios personalizados:

```typescript
// Priorizar x-original-host para dominios personalizados
const xOriginalHost = request.headers.get('x-original-host')
const hostname = xOriginalHost ||
  (/* lógica existente para subdominios */)
```

### 5. Domain Resolver

**Servicio** que resuelve dominios a tiendas en base de datos:

```typescript
const { data: stores } = await cookiesClient.models.UserStore.listUserStoreByCustomDomain({
  customDomain: domain,
})
```

## Configuración Paso a Paso

### 1. Crear Multi-Tenant Distribution

```bash
# Ya creada: E2S54QFYG78KRA
aws cloudfront create-multi-tenant-distribution \
  --distribution-config file://config.json
```

### 2. Crear Lambda@Edge

```bash
# 1. Crear rol IAM
aws iam create-role \
  --role-name lambda-edge-execution-role \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Principal":{"Service":["lambda.amazonaws.com","edgelambda.amazonaws.com"]},
      "Action":"sts:AssumeRole"
    }]
  }'

# 2. Adjuntar política básica
aws iam attach-role-policy \
  --role-name lambda-edge-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# 3. Crear función (archivo ZIP con código)
aws lambda create-function \
  --region us-east-1 \
  --function-name cloudfront-host-rewriter \
  --runtime nodejs18.x \
  --role arn:aws:iam::626635400208:role/lambda-edge-execution-role \
  --handler lambda-edge-host-rewriter.handler \
  --zip-file fileb://lambda-edge.zip

# 4. Publicar versión (requerido para Lambda@Edge)
aws lambda publish-version \
  --region us-east-1 \
  --function-name cloudfront-host-rewriter
```

### 3. Crear Distribution Tenant

**En la consola de AWS:**

1. **CloudFront** → **Multi-Tenant Distributions** → `E2S54QFYG78KRA`
2. **Domains & tenants** → **Create tenant**
3. **Configurar**:
   - **Tenant name**: `test-tenant`
   - **Domain**: `kingsdev.tech`
   - **Origin**: `fasttify.com`

### 4. Configurar Cache Behavior

**En el tenant:**

1. **Cache behaviors** → **Edit behavior**
2. **Origin request policy**: `Managed-AllViewer`
3. **Function associations**:
   - **Origin request**: `arn:aws:lambda:us-east-1:626635400208:function:cloudfront-host-rewriter:1`

### 5. Configurar DNS

**En el proveedor de DNS del dominio personalizado:**

```
Tipo: ALIAS/CNAME
Nombre: kingsdev.tech (o @)
Valor: d3qt0kqv4ik0re.cloudfront.net
TTL: 300
```

### 6. Agregar en Base de Datos

**Configurar tienda con dominio personalizado:**

```typescript
await client.models.UserStore.update({
  storeId: 'tu-store-id',
  customDomain: 'kingsdev.tech',
  customDomainStatus: 'active',
})
```

## Flujo de Request

### Para Dominio Personalizado (`kingsdev.tech`)

1. **Cliente** → `https://kingsdev.tech/`
2. **DNS** → resuelve a `d3qt0kqv4ik0re.cloudfront.net`
3. **CloudFront Tenant** → recibe request con `Host: kingsdev.tech`
4. **Lambda@Edge** →
   - Preserva: `x-original-host: kingsdev.tech`
   - Cambia: `Host: fasttify.com`
5. **Amplify** → acepta request (Host válido)
6. **Next.js Middleware** → usa `x-original-host` para identificar tienda
7. **Domain Resolver** → busca tienda con `customDomain: "kingsdev.tech"`
8. **Render** → página de la tienda correspondiente

### Para Subdominio (`tienda.fasttify.com`)

1. **Cliente** → `https://tienda.fasttify.com/`
2. **DNS** → resuelve a Amplify directamente
3. **Next.js Middleware** → extrae subdominio `tienda`
4. **Render** → página de la tienda

## Monitoreo y Logs

### CloudFront Logs

```json
{
  "timestamp": "1750648423",
  "distributionid": "E2S54QFYG78KRA",
  "x-host-header": "kingsdev.tech",
  "sc-status": "200",
  "distribution-tenant-id": "dt_2yswVG0ALnaLI4dLxljH9zRL3jF",
  "origin-fbl": "0.310"
}
```

### Lambda@Edge Logs

**CloudWatch Logs**: `/aws/lambda/us-east-1.cloudfront-host-rewriter`

```
Original Host header: kingsdev.tech
Modified Host header: fasttify.com
Added x-original-host: kingsdev.tech
```

### Next.js Middleware Logs

```typescript
console.log('🔗 Headers debug:', {
  'x-original-host': xOriginalHost,
  hostname: hostname,
  path: path,
})
```

## Agregar Nuevos Dominios

### 1. Crear Nuevo Tenant

```bash
# En la consola de AWS CloudFront Multi-Tenant
# Crear tenant con el nuevo dominio
```

### 2. Configurar DNS

```
# En el proveedor de DNS del cliente
CNAME mitienda.com → [endpoint-del-nuevo-tenant].cloudfront.net
```

### 3. Actualizar Base de Datos

```typescript
await client.models.UserStore.update({
  storeId: 'store-del-cliente',
  customDomain: 'mitienda.com',
  customDomainStatus: 'pending',
})
```

### 4. Verificar

```bash
curl -I https://mitienda.com
# Debe devolver 200 OK
```

## Troubleshooting

### Error 403 - Bad Request

**Causa**: CloudFront no acepta el dominio  
**Solución**: Verificar configuración del tenant y DNS

### Error 421 - Misdirected Request

**Causa**: Amplify rechaza el header Host  
**Solución**: Verificar Lambda@Edge en Origin Request

### Error 502 - CloudFront Function Error

**Causa**: Función intenta modificar header read-only  
**Solución**: Usar Lambda@Edge en lugar de CloudFront Function

### Dominio no resuelve

**Causa**: Tienda no existe en base de datos  
**Solución**: Agregar `customDomain` en UserStore

## Costos Estimados

- **CloudFront Multi-Tenant**: ~$1/mes por distribución
- **Distribution Tenants**: ~$0.50/mes por tenant
- **Lambda@Edge**: ~$0.20/millón de requests
- **Certificados SSL**: Gratuitos (AWS Certificate Manager)
- **DNS**: Depende del proveedor (~$2-5/mes)

**Total por dominio personalizado**: ~$3-7/mes

## Ventajas vs Alternativas

### CloudFront Multi-Tenant

- SSL automático
- Escalabilidad ilimitada
- No requiere modificar Amplify
- Rendimiento global (CDN)
- Monitoreo granular por tenant

### CloudFront Normal

- Requiere crear distribución por dominio
- Gestión manual de certificados
- Menos escalable

### Subdominios únicamente

- No permite dominios personalizados
- Menos profesional para clientes

## Limitaciones

1. **Propagación**: Cambios en DNS pueden tardar hasta 48 horas
2. **Lambda@Edge**: Deployment global tarda 15-30 minutos
3. **Límites AWS**: 200 distribuciones por cuenta (contactar AWS para más)
4. **Región fija**: Lambda@Edge debe estar en us-east-1

## Mantenimiento

### Actualizar Lambda@Edge

```bash
# 1. Actualizar código
zip lambda-edge-v2.zip nueva-funcion.js

# 2. Actualizar función
aws lambda update-function-code \
  --region us-east-1 \
  --function-name cloudfront-host-rewriter \
  --zip-file fileb://lambda-edge-v2.zip

# 3. Publicar nueva versión
aws lambda publish-version \
  --region us-east-1 \
  --function-name cloudfront-host-rewriter

# 4. Actualizar asociación en CloudFront (manual)
```

### Monitoreo Regular

```bash
# Verificar estado de tenants
aws cloudfront list-distribution-tenants \
  --multi-tenant-distribution-id E2S54QFYG78KRA

# Verificar logs de Lambda@Edge
aws logs describe-log-groups \
  --log-group-name-prefix "/aws/lambda/us-east-1.cloudfront-host-rewriter"
```

## Referencias

- [AWS CloudFront Multi-Tenant Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Lambda@Edge Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
- [Amplify Gen 2 Documentation](https://docs.amplify.aws/)

---

**Implementado exitosamente el 23 de junio de 2025**
