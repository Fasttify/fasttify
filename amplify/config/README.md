# Configuración Modular del Backend

Esta carpeta contiene la configuración modular del backend de Amplify, organizada para facilitar el mantenimiento y la escalabilidad.

## Estructura de Archivos

### `environment.ts`

Configuraciones relacionadas con el entorno de ejecución:

- Detección de entorno (desarrollo/producción)
- Configuración de CORS
- Configuración de deployment
- Variables de stage

### `policies.ts`

Políticas de IAM reutilizables:

- `bedrockPolicyStatement`: Permisos para Amazon Bedrock (IA)
- `sesPolicyStatement`: Permisos para Amazon SES (emails)
- `createS3PolicyStatement()`: Función para crear políticas de S3
- `createSqsSendPolicyStatement()`: Función para permisos de envío SQS
- `createSqsReceivePolicyStatement()`: Función para permisos de recepción SQS

### `queues.ts`

Configuración del sistema de colas SQS:

- `createEmailQueues()`: Crea las colas para emails normales y de alta prioridad
- `configureEmailEventSources()`: Configura los event sources para las lambdas
- `configureEmailEnvironmentVariables()`: Configura variables de entorno

### `apis.ts`

Configuración de todas las APIs REST:

- APIs para suscripciones, webhooks, dominios, imágenes y emails
- Configuración de autorización según entorno
- Políticas de acceso a las APIs

### `permissions.ts`

Aplicación de permisos a las funciones Lambda:

- `applyBedrockPermissions()`: Aplica permisos de Bedrock
- `applySesPermissions()`: Aplica permisos de SES
- `applyS3Permissions()`: Aplica permisos de S3
- `applySqsPermissions()`: Aplica permisos de SQS
- `applyApiAccessPolicies()`: Aplica políticas de acceso a APIs

### `outputs.ts`

Configuración de las salidas del backend:

- `createBackendOutputs()`: Crea la configuración de salidas estructurada
- Interface `BackendOutputs` para tipado

### `kms.ts` (PAUSADO)

Configuración de KMS para encriptación de claves de pago:

- `createPaymentKeysKmsKey()`: Crea y configura la clave KMS para claves de pago
- `createKmsPolicyStatement()`: Crea políticas para el uso de KMS
- **NOTA**: Actualmente pausado, pero mantenido para uso futuro

### `resource-groups.md`

Documentación completa sobre la organización de recursos en grupos lógicos:

- **6 grupos funcionales** organizados por propósito
- **Beneficios** de cada agrupación
- **Estrategia de deployment** independiente
- **Guía de migración** realizada

## Ventajas de esta Estructura

1. **Modularidad**: Cada aspecto del backend está separado en su propio archivo
2. **Reutilización**: Las funciones pueden ser reutilizadas en diferentes contextos
3. **Mantenibilidad**: Es más fácil encontrar y modificar configuraciones específicas
4. **Escalabilidad**: Agregar nuevas funcionalidades es más simple
5. **Legibilidad**: El archivo principal `backend.ts` es mucho más claro y conciso
6. **Testabilidad**: Cada módulo puede ser testeado independientemente

## Uso

El archivo principal `backend.ts` importa y utiliza estos módulos:

```typescript
import { createEmailQueues, configureEmailEventSources } from './config/queues';
import { createRestApis } from './config/apis';
import { applyBedrockPermissions, applySesPermissions } from './config/permissions';
import { createBackendOutputs } from './config/outputs';
```

## Mantenimiento

Para agregar nuevas funcionalidades:

1. **Nueva API**: Agregar en `apis.ts`
2. **Nuevos permisos**: Agregar en `policies.ts` y aplicar en `permissions.ts`
3. **Nueva configuración de entorno**: Agregar en `environment.ts`
4. **Nuevas colas**: Extender `queues.ts`
5. **Nuevas salidas**: Extender `outputs.ts`
6. **Configuración KMS**: Descomentar y extender `kms.ts` cuando sea necesario
