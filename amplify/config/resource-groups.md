# 🏗️ Grupos de Recursos (Resource Groups)

Este documento describe la organización de recursos en grupos lógicos usando `resourceGroupName` en AWS Amplify Gen 2.

## 📋 Estructura de Grupos

### 🤖 `ai-functions` - Funciones de Inteligencia Artificial

**CloudFormation Stack**: `amplify-fasttify-ai-functions`

| Función                              | Propósito                       | Modelo         |
| ------------------------------------ | ------------------------------- | -------------- |
| `generateHaikuFunction`              | Genera haikus creativos         | Claude 3 Haiku |
| `generateProductDescriptionFunction` | Crea descripciones de productos | Claude 3 Haiku |
| `generatePriceSuggestionFunction`    | Sugiere precios inteligentes    | Claude 3 Haiku |

**Beneficios:**

- Despliegue independiente de funciones de IA
- Gestión centralizada de modelos de Bedrock
- Escalado específico para cargas de trabajo de ML

### 📧 `email-system` - Sistema de Emails Masivos

**CloudFormation Stack**: `amplify-fasttify-email-system`

| Función              | Propósito                | Características             |
| -------------------- | ------------------------ | --------------------------- |
| `bulkEmailAPI`       | API para envío de emails | Timeout: 30s, Memory: 512MB |
| `bulkEmailProcessor` | Procesador de colas SQS  | Timeout: 15min, Memory: 1GB |

**Beneficios:**

- Aislamiento del sistema de emails
- Gestión independiente de colas SQS
- Escalado específico para procesamiento masivo

### 📋 `subscriptions` - Gestión de Suscripciones

**CloudFormation Stack**: `amplify-fasttify-subscriptions`

| Función              | Propósito                  | Características            |
| -------------------- | -------------------------- | -------------------------- |
| `createSubscription` | Crear nuevas suscripciones | Integración con Polar      |
| `webHookPlan`        | Webhook de planes          | Manejo de eventos de Polar |
| `planScheduler`      | Programador de planes      | Ejecución cada hora        |

**Beneficios:**

- Ciclo de vida conjunto para funciones de facturación
- Gestión centralizada de integración con Polar
- Políticas de seguridad específicas para pagos

### 💳 `payments` - Sistema de Pagos

**CloudFormation Stack**: `amplify-fasttify-payments`

| Función             | Propósito                 | Características           |
| ------------------- | ------------------------- | ------------------------- |
| `managePaymentKeys` | Gestión de claves de pago | Integración KMS (pausada) |

**Beneficios:**

- Máxima seguridad para funciones sensibles
- Aislamiento de claves y secretos
- Auditoría independiente

### 🏪 `store-management` - Gestión de Tiendas

**CloudFormation Stack**: `amplify-fasttify-store-management`

| Función               | Propósito              | Características  |
| --------------------- | ---------------------- | ---------------- |
| `storeImages`         | Gestión de imágenes    | S3 + CloudFront  |
| `checkStoreDomain`    | Validación de dominios | Verificación DNS |
| `createStoreTemplate` | Creación de plantillas | Timeout: 120s    |

**Beneficios:**

- Funcionalidad cohesiva de tiendas
- Gestión conjunta de assets y configuración
- Despliegue independiente de funciones de tienda

### 🚀 `onboarding` - Proceso de Incorporación

**CloudFormation Stack**: `amplify-fasttify-onboarding`

| Función              | Propósito               | Características    |
| -------------------- | ----------------------- | ------------------ |
| `onboardingProgress` | Seguimiento de progreso | Gestión de estados |

**Beneficios:**

- Funcionalidad específica de onboarding
- Fácil extensión para nuevas funciones de incorporación
- Gestión independiente del flujo de usuarios nuevos

### 🔐 `auth` - Autenticación (Existente)

**CloudFormation Stack**: `amplify-fasttify-auth`

| Función            | Propósito                     | Características           |
| ------------------ | ----------------------------- | ------------------------- |
| `postConfirmation` | Post-confirmación de usuarios | Timeout: 120s             |
| `customMessage`    | Mensajes personalizados       | Personalización de emails |

**Beneficios:**

- Funciones críticas de autenticación aisladas
- Ciclo de vida conjunto con Cognito
- Políticas de seguridad específicas

### 📊 `main` - Recursos Principales (Sin grupo específico)

**CloudFormation Stack**: `amplify-fasttify-main`

| Recurso   | Propósito              |
| --------- | ---------------------- |
| `data`    | GraphQL API y DynamoDB |
| `storage` | S3 Bucket principal    |

## 🎯 Beneficios de esta Organización

### 1. **Despliegues Independientes**

```bash
# Desplegar solo funciones de IA
amplify deploy --resource ai-functions

# Desplegar solo sistema de emails
amplify deploy --resource email-system
```

### 2. **Gestión de Errores Aislada**

- Un error en emails no afecta las funciones de IA
- Rollbacks específicos por grupo
- Debugging más eficiente

### 3. **Escalado Específico**

- Diferentes configuraciones de memoria/timeout por grupo
- Políticas de auto-scaling independientes
- Optimización de costos por funcionalidad

### 4. **Seguridad Granular**

- Permisos específicos por grupo funcional
- Aislamiento de recursos sensibles (payments)
- Auditoría más detallada

### 5. **Colaboración en Equipos**

- Diferentes equipos pueden trabajar en grupos específicos
- Menos conflictos en deployments
- Responsabilidades claras

## 🔄 Migración Realizada

| Función         | Grupo Anterior | Grupo Nueva        | Razón del Cambio              |
| --------------- | -------------- | ------------------ | ----------------------------- |
| `webHookPlan`   | `auth`         | `subscriptions`    | Lógica de negocio relacionada |
| `planScheduler` | `auth`         | `subscriptions`    | Lógica de negocio relacionada |
| `storeImages`   | `storeImages`  | `store-management` | Consistencia de nomenclatura  |

## 📈 Próximos Pasos

1. **Monitorear** los grupos después del despliegue
2. **Ajustar** configuraciones específicas por grupo si es necesario
3. **Considerar** dividir grupos grandes en el futuro
4. **Documentar** nuevas funciones con el grupo apropiado
