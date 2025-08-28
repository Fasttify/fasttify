# Fasttify

**Plataforma SaaS avanzada para crear y gestionar tiendas online con motor de plantillas Liquid compatible con Shopify**

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Fasttify/fasttify)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![AWS Amplify](https://img.shields.io/badge/AWS%20Amplify-Gen2-orange?logo=aws&logoColor=white)](https://aws.amazon.com/amplify/)
[![Shopify Polaris](https://img.shields.io/badge/Polaris-13.9.5-95BF47?logo=shopify&logoColor=white)](https://polaris.shopify.com/)

---

## Descripción General

Fasttify es una **plataforma SaaS completa** que permite a emprendedores crear, personalizar y gestionar tiendas de e-commerce multi-tenant. Construida con **Next.js 15**, **AWS Amplify Gen2** y un **motor de plantillas Liquid 100% compatible con Shopify**, ofrece una solución escalable para dropshipping y comercio digital con dominios personalizados automatizados.

> [!WARNING]
> PROYECTO EN DESARROLLO ACTIVO
> **Fasttify se encuentra actualmente en fase de desarrollo beta.** Aunque muchas funcionalidades están operativas, el proyecto puede contener bugs, funciones incompletas y cambios frecuentes en la API.
>
> **Recomendaciones:**
>
> - ⚠️ **No usar en producción** sin realizar pruebas exhaustivas
> - 🔄 **Hacer backups regulares** de tus datos
> - 📝 **Reportar bugs** encontrados en [GitHub Issues](../../issues)
> - 📧 **Contactar soporte** para problemas críticos: [soporte@fasttify.com](mailto:soporte@fasttify.com)
>
> **Agradecemos tu paciencia y colaboración** mientras continuamos mejorando la plataforma.

### **Características Principales**

🏪 **Sistema Multi-Tenant Avanzado**

- Arquitectura de **Database Sharding** con DynamoDB para escalabilidad infinita
- **Dominios personalizados automatizados** con CloudFront Multi-Tenant y SSL
- **Motor Liquid 100% compatible** con Shopify (tags, filtros, plantillas)
- Gestión independiente de múltiples tiendas por usuario

🛒 **E-commerce Completo**

- **Sistema de carrito avanzado** con side cart, controles de cantidad y persistencia
- **Checkout tokenizado** con sesiones seguras y formularios profesionales
- **Filtros de productos automáticos** con scroll infinito y URL persistente
- **Búsqueda AJAX** en tiempo real con autocompletado inteligente

🤖 **IA Integrada con AWS Bedrock**

- Generación automática de descripciones de productos con Claude
- Sugerencias inteligentes de precios para mercados locales
- Chat de soporte integrado con IA

💳 **Pagos y Facturación**

- Integración nativa con **Wompi** y **Mercado Pago**
- Gestión de suscripciones con **Polar**
- Encriptación segura de API keys y webhooks automáticos

🔐 **Seguridad y Escalabilidad**

- AWS Cognito con autenticación multifactor
- Logs seguros con AWS Lambda Powertools
- **Sharding automático** por tienda para rendimiento óptimo

---

## Stack Tecnológico

### **Frontend**

```
Next.js 15.3.5 (App Router + Turbopack)
├── React 18.3.1 + React DOM
├── TypeScript 5.8.3 (Strict Mode)
├── Tailwind CSS 3.4.17 + PostCSS
├── Shopify Polaris 13.9.5
├── Radix UI Complete Suite
├── TanStack Query 5.82.0 (React Query)
├── Zustand 5.0.6 (State Management)
├── React Hook Form 7.60.0 + Zod 3.25.64
├── Framer Motion 12.23.1
└── Lucide React Icons
```

### **Backend & Infrastructure**

```
AWS Amplify Gen 2 (Serverless)
├── AWS AppSync (GraphQL API)
├── AWS Cognito (Auth + MFA)
├── DynamoDB (NoSQL + Sharding)
├── AWS Lambda (Funciones + Powertools)
├── AWS Bedrock (Claude IA)
├── AWS S3 (Storage + CDN)
├── AWS SES (Email)
├── AWS ACM (SSL Automático)
├── CloudFront Multi-Tenant
└── AWS IAM (Seguridad)
```

### **Motor de Plantillas Avanzado**

```
Motor Liquid Personalizado
├── 100% Compatible con Shopify
├── Tags: {% filters %}, {% paginate %}, {% render %}
├── Filtros: money, img_url, asset_url
├── Renderizado SSR/SSG optimizado
├── Cache multinivel inteligente
├── Template Sync en desarrollo
└── Arquitectura modular extensible
```

### **Workspaces y Packages**

```
Monorepo con npm workspaces
├── packages/renderer-engine (Motor Liquid)
├── packages/orders-app (Gestión pedidos)
├── packages/lambda-edge-host-rewriter
└── packages/tenant-domains
```

---

## Instalación y Configuración

### **Prerrequisitos**

- Node.js 18+ con npm
- AWS CLI configurado
- Cuenta AWS con permisos para Amplify
- Git

### **1. Clonar y configurar**

```bash
# Clonar el repositorio
git clone https://github.com/Fasttify/fasttify.git
cd fasttify

# Instalar dependencias
npm install
```

### **2. Configurar AWS Amplify Gen 2**

```bash
# Instalar Amplify CLI Gen 2
npm install -g @aws-amplify/backend-cli

# Inicializar sandbox de desarrollo
npx ampx sandbox

# Para producción
APP_ENV=production npx ampx sandbox
```

### **3. Variables de entorno**

Crear `.env.local`:

```env
# AWS Amplify Gen 2
NEXT_PUBLIC_S3_URL="https://tu-bucket.s3.amazonaws.com"
NEXT_PUBLIC_AWS_REGION="us-east-1"
BUCKET_NAME="fasttify-themes"
AWS_REGION="us-east-1"

# CloudFront Multi-Tenant
CLOUDFRONT_MULTI_TENANT_DISTRIBUTION_ID="E2S54QFYG78KRA"
CUSTOM_DOMAIN_VERIFIER_FUNCTION_NAME="customDomainVerifier"

# Email (SES)
SES_FROM_EMAIL="noreply@fasttify.com"
SES_REPLY_TO_EMAIL="support@fasttify.com"

# Seguridad
JWT_SECRET="tu-jwt-secret-super-seguro"

# Entorno
APP_ENV=development
NEXT_PUBLIC_APP_ENV=development

# Opcional: Dominios custom
COOKIE_DOMAIN=".tudominio.com"
```

### **4. Ejecutar en desarrollo**

```bash
# Desarrollo con Turbopack (recomendado)
npm run dev

# Sincronizar plantillas en tiempo real
npm run template-sync

# Ejecutar tests
npm run test
npm run test:coverage

# Verificar tipos TypeScript
npm run type-check
```

La aplicación estará disponible en `http://localhost:3000`

---

## Arquitectura del Proyecto

```
fasttify/
├── 📁 amplify/                     # AWS Amplify Backend
│   ├── 📁 auth/                    # Configuración autenticación
│   │   ├── 📁 post-confirmation/   # Lambda post-confirmación
│   │   └── 📁 custom-message/      # Mensajes personalizados
│   ├── 📁 data/                    # Esquemas GraphQL y Lambda IA
│   │   ├── 📁 chat-generate/       # Chat con Claude 3 Haiku
│   │   ├── 📁 description-generate/# Generación descripciones
│   │   └── 📁 price-suggestion/    # Sugerencias de precios
│   ├── 📁 functions/               # Lambda functions
│   │   ├── 📁 webHookPlan/         # Webhooks Polar
│   │   ├── 📁 checkStoreName/      # Validación nombres
│   │   ├── 📁 checkStoreDomain/    # Validación dominios
│   │   ├── 📁 storeImages/         # Gestión imágenes S3
│   │   └── 📁 createStoreTemplate/ # Creación plantillas
│   └── 📁 storage/                 # Configuración S3
├── 📁 app/                         # Next.js App Router
│   ├── 📁 (main-layout)/          # Landing y páginas públicas
│   ├── 📁 (setup-layout)/         # Wizard configuración inicial
│   ├── 📁 [store]/                # Rutas dinámicas tiendas públicas
│   ├── 📁 store/                  # Dashboard administración
│   │   ├── 📁 [slug]/dashboard/   # Métricas y analytics
│   │   ├── 📁 [slug]/products/    # Gestión productos
│   │   ├── 📁 [slug]/orders/      # Gestión pedidos
│   │   ├── 📁 [slug]/setup/       # Configuración tienda
│   │   └── 📁 components/         # Componentes dashboard
│   └── 📁 api/                    # API Routes
│       ├── 📁 stores/             # APIs gestión tiendas
│       └── 📁 domain-validation/  # Validación dominios
├── 📁 renderer-engine/            # Motor plantillas Liquid
│   ├── 📁 liquid/                 # Engine LiquidJS personalizado
│   ├── 📁 services/               # Servicios renderizado
│   ├── 📁 renderers/              # Renderizadores dinámicos
│   └── 📁 types/                  # Tipos TypeScript
├── 📁 template/                   # Plantillas base Liquid
│   ├── 📁 layout/                 # Layout base tema
│   ├── 📁 sections/               # Secciones reutilizables
│   ├── 📁 templates/              # Templates páginas
│   └── 📁 assets/                 # Assets estáticos
├── 📁 lib/                        # Servicios y utilidades
│   ├── 📁 services/               # Servicios especializados
│   │   ├── 📁 cloudfront/         # CloudFront Multi-Tenant
│   │   ├── 📁 domain/             # Validación dominios
│   │   └── 📁 ssl/                # Gestión certificados
│   └── 📁 zod-schemas/            # Validaciones Zod
└── 📁 components/                 # Componentes UI reutilizables
```

---

## Funcionalidades Principales

### **1. Gestión de Tiendas Multi-Tenant**

**Modelo de datos completo:**

```typescript
// Esquema principal UserStore
{
  storeId: string           // Identificador único
  userId: string            // Propietario
  storeName: string         // Nombre público
  storeDescription?: string // Descripción SEO
  storeLogo?: string        // Logo S3 URL
  storeTheme?: string       // Tema activo
  storeCurrency: string     // Moneda (COP, USD, etc.)
  customDomain?: string     // Dominio personalizado
  customDomainStatus?: string // pending | active | failed
  cloudFrontTenantId?: string // ID tenant CloudFront
  wompiConfig?: string      // Config Wompi encriptada
  mercadoPagoConfig?: string // Config MercadoPago encriptada
  onboardingCompleted: boolean // Estado wizard
}
```

### **2. Productos y Colecciones**

```typescript
// Modelo Product con características avanzadas
{
  storeId: string
  name: string
  description?: string      // Puede ser generada por IA
  price: float
  compareAtPrice?: float    // Precio de comparación
  costPerItem?: float       // Costo para cálculo margen
  sku?: string              // SKU único
  barcode?: string          // Código de barras
  quantity: integer         // Inventario
  category?: string         // Categoría para IA
  images: json[]            // Múltiples imágenes S3
  variants: json[]          // Variantes (talla, color, etc.)
  tags: json[]              // Tags para filtrado
  featured: boolean         // Producto destacado
  supplier?: string         // Proveedor dropshipping
}
```

### **3. Sistema de E-commerce Completo**

#### **🛒 Carrito Avanzado**

- **Side Cart modular** con arquitectura separada en 5 módulos
- **Controles de cantidad** con botones +/- e input manual
- **Eliminación individual** y limpieza completa
- **Persistencia por sesión** con cookies seguras
- **Actualizaciones en tiempo real** sin reload
- **Soporte para atributos** de producto (color, talla, etc.)

#### **💳 Checkout Tokenizado**

- **URLs seguras** tipo `checkouts/cn/{token}`
- **Sesiones temporales** con expiración automática (24h)
- **Formularios profesionales** para información del cliente
- **Redirección automática** al dominio de la tienda
- **Pago manual** con captura posterior

#### **🔍 Filtros Automáticos**

- **Tag `{% filters %}`** que genera interfaz completa automáticamente
- **Filtros dinámicos**: categorías, tags, vendors, precio, disponibilidad
- **Scroll infinito** con carga progresiva
- **URL persistente** - filtros mantienen estado en navegación
- **Responsive automático** con sidebar adaptativo

#### **🔎 Búsqueda AJAX**

- **Autocompletado inteligente** en tiempo real
- **Resultados instantáneos** sin reload de página
- **Highlighting** de términos de búsqueda
- **Integración con filtros** para refinamiento

```liquid
<!-- Filtros automáticos - ¡Solo una línea! -->
{% filters storeId: store.id %}

<!-- El tag genera automáticamente:
     ✅ Filtros de precio (slider)
     ✅ Filtros de categorías (checkboxes)
     ✅ Filtros de etiquetas (pills)
     ✅ Ordenamiento (dropdown)
     ✅ Grid de productos con AJAX
     ✅ JavaScript completo incluido
-->
```

### **4. Dominios Personalizados Automatizados**

**Sistema CloudFront Multi-Tenant completamente automatizado:**

- **🔒 SSL automático**: Certificados generados automáticamente vía AWS ACM
- **🤖 Verificación inteligente**: Validación DNS cada hora automáticamente
- **⚡ Configuración instantánea**: Creación automática de tenants
- **📋 Instrucciones específicas**: Guías por proveedor (Cloudflare, GoDaddy, etc.)
- **🔄 Estados en tiempo real**: `pending` → `active` → `failed`

```typescript
// Flujo automatizado
POST /api/stores/{storeId}/custom-domain
{
  "customDomain": "mitienda.com"
}

// Sistema automáticamente:
// 1. Crea tenant en CloudFront Multi-Tenant
// 2. Configura Lambda@Edge para reescritura de headers
// 3. Genera certificado SSL
// 4. Proporciona instrucciones DNS específicas
// 5. Verifica estado cada hora
```

### **5. Arquitectura de Database Sharding**

**Sharding automático por tienda con DynamoDB:**

- **🎯 Clave de partición**: `storeId` para aislamiento completo
- **🚀 Escalabilidad infinita**: Nuevas tiendas = nuevas particiones automáticas
- **⚡ Rendimiento aislado**: Evita problemas de "vecino ruidoso"
- **🔍 Consultas eficientes**: Índices secundarios globales (GSI)

```typescript
// Cada tienda obtiene su propia partición
Product.byStore(storeId); // Ultra-rápido
Order.byStore(storeId); // Aislado
Collection.byStore(storeId); // Escalable
```

### **6. Integraciones de Pago Colombianas**

**Wompi (Recomendado - 2.9% fees):**

```json
{
  "publicKey": "pub_prod_...", // Encriptada en BD
  "signature": "prod_integrity_...", // Firma webhook
  "isActive": true
}
```

**Mercado Pago (3.99% fees):**

```json
{
  "publicKey": "APP_USR-...", // Access token
  "privateKey": "TEST-...", // Clave secreta
  "isActive": true
}
```

**Métodos soportados:**

- 💳 Tarjetas (Visa, Mastercard, Amex)
- 📱 Wallets (Nequi, DaviPlata)
- 🏦 PSE y transferencias bancarias
- 💰 Pagos en efectivo
- ⏰ Paga después (BNPL)

### **7. Gestión de Suscripciones con Polar**

```typescript
// Webhook automático para cambios de plan
export class PolarPaymentProcessor {
  async processSubscriptionEvent(event: PolarWebhookEvent) {
    // Actualización automática en BD
    // Notificaciones por email
    // Cambios de permisos en tiempo real
  }
}
```

---

##

## Guía de Uso

### **Para Emprendedores**

#### **1. Configuración inicial (Wizard de 7 pasos)**

1. **Registro y verificación** con AWS Cognito
2. **Información básica** de la tienda
3. **Selección de tema** visual
4. **Configuración de productos** (manual o con IA)
5. **Método de pago** (Wompi/Mercado Pago)
6. **Configuración de envíos**
7. **Dominio personalizado** (opcional)

#### **2. Gestión diaria del dashboard**

```typescript
// Dashboard principal con métricas en tiempo real
interface StoreDashboard {
  totalOrders: number;
  revenue: number;
  topProducts: Product[];
  recentOrders: Order[];
  trafficStats: AnalyticsData;
  conversionRate: number;
}
```

### **Para Desarrolladores**

#### **1. Desarrollo de plantillas Liquid**

```bash
# Sincronización en tiempo real
npm run template-sync -- start STORE_ID

# Observa cambios y sincroniza automáticamente
```

#### **2. Extensión de funcionalidades**

```typescript
// Hook personalizado para métricas
export const useStoreMetrics = (storeId: string) => {
  return useQuery({
    queryKey: ['store-metrics', storeId],
    queryFn: () => fetchStoreMetrics(storeId),
    refetchInterval: 30000, // Actualización cada 30s
  });
};

// Integración con nueva pasarela de pago
export const configurePaymentGateway = async (storeId: string, gateway: PaymentGatewayType, config: PaymentConfig) => {
  // Encriptación automática de API keys
  // Validación de configuración
  // Actualización en base de datos
};
```

---

## Scripts Disponibles

| Comando                     | Descripción                                   |
| --------------------------- | --------------------------------------------- |
| `npm run dev`               | Servidor desarrollo con Turbopack             |
| `npm run build`             | Build optimizado para producción              |
| `npm run start`             | Servidor de producción                        |
| `npm run test`              | Tests unitarios con Jest                      |
| `npm run test:watch`        | Tests en modo watch                           |
| `npm run test:coverage`     | Coverage completo de tests                    |
| `npm run lint`              | ESLint + Prettier                             |
| `npm run type-check`        | Verificación de tipos TypeScript              |
| `npm run template-sync`     | Sincronización de plantillas en tiempo real   |
| `npm run workspace:install` | Instalar dependencias en todos los workspaces |
| `npm run build:packages`    | Build de todos los packages                   |

---

## Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests específicos
npm run test -- components/ProductForm
```

**Cobertura actual:**

- ✅ **Sistema de carrito** - Tests completos para side cart y módulos
- ✅ **Motor Liquid** - Tags personalizados y filtros
- ✅ **Filtros de productos** - API y frontend
- ✅ **Checkout tokenizado** - Sesiones y formularios
- ✅ **Dominios personalizados** - CloudFront Multi-Tenant
- ✅ **Database sharding** - Consultas por tienda
- ✅ **Middlewares** - Autenticación y dominio
- ✅ **Funciones Lambda** - Powertools y logging

---

## Casos de Uso Reales

### **1. Tienda de Moda con Filtros Avanzados**

```liquid
<!-- Solo necesitas una línea para filtros completos -->
{% filters storeId: store.id, style: 'sidebar' %}

<!-- Sistema genera automáticamente:
     - Filtros por talla, color, marca
     - Rango de precios con slider
     - Ordenamiento por popularidad/precio
     - Grid responsive con carrito integrado
-->
```

### **2. Dropshipping con Dominio Personalizado**

```javascript
// Configuración automática
POST /api/stores/tech-store-123/custom-domain
{
  "customDomain": "tech-gadgets.com"
}

// Sistema automáticamente:
// ✅ Crea tenant CloudFront
// ✅ Genera SSL
// ✅ Proporciona instrucciones DNS
// ✅ Verifica configuración cada hora
```

### **3. E-commerce Completo con Checkout**

```javascript
// Flujo automatizado del carrito al checkout
addProductToCart(productId, quantity)    // Agrega al side cart
  ↓
openCart()                              // Abre carrito lateral
  ↓
checkout()                              // Inicia checkout tokenizado
  ↓
/checkouts/cn/{token}                   // Formulario seguro
  ↓
Order created                           // Pedido manual generado
```

---

## Contribuciones

### **Cómo contribuir**

1. Fork del repositorio
2. Crear rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: descripción del cambio'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request con descripción detallada

### **Estándares de código**

- **TypeScript strict** habilitado
- **ESLint + Prettier** configurados
- **Conventional Commits** para mensajes
- **Tests obligatorios** para nuevas funciones
- **Documentación** actualizada

---

## Roadmap 2025

### **🚀 En Desarrollo (Q1 2025)**

- [ ] **IA con AWS Bedrock** - Generación de descripciones y precios
- [ ] **Motor de plantillas mejorado** - Más tags Shopify compatibles
- [ ] **Sistema de órdenes completo** - Gestión avanzada de pedidos
- [ ] **Panel de analytics** - Métricas en tiempo real por tienda
- [ ] **Sistema de templates marketplace** - Temas premium/gratuitos

### **🔮 Futuro (Q2-Q3 2025)**

- [ ] **App móvil nativa** (React Native + Expo)
- [ ] **Multi-idioma completo** (i18n con Liquid)
- [ ] **Integración WhatsApp Business** para ventas
- [ ] **Marketplace multi-vendor** con comisiones
- [ ] **Sistema de afiliados** automático
- [ ] **POS físico** para tiendas híbridas

### **✅ Completado**

- [x] **Sistema de carrito modular** con side cart
- [x] **Checkout tokenizado** con sesiones seguras
- [x] **Filtros automáticos** con tag `{% filters %}`
- [x] **Dominios personalizados** automatizados
- [x] **Database sharding** por tienda
- [x] **CloudFront Multi-Tenant** con SSL automático

---

## Licencia

Este proyecto está bajo la **Licencia Apache 2.0** - ver [LICENSE](LICENSE) para detalles.

---

## Documentación y Recursos

### **📚 Documentación Técnica Completa**

- **[🏗️ Arquitectura](./docs/architecture/)** - Database sharding, S3 storage
- **[🎨 Motor de Plantillas](./docs/engine/)** - Liquid tags, filtros, carrito, checkout
- **[🌐 Dominios Personalizados](./docs/domains/)** - CloudFront Multi-Tenant
- **[🔧 Desarrollo de Temas](./docs/templates/)** - Guías y referencias

### **🛠️ Guías Rápidas**

- **[Filtros en 5 minutos](./docs/engine/filters-quick-start.md)** - Sistema de filtros automáticos
- **[Sistema de Carrito](./docs/engine/cart-system.md)** - Side cart modular completo
- **[Checkout Tokenizado](./docs/engine/checkout-system.md)** - Sesiones seguras
- **[Dominios Automáticos](./docs/domains/automated-custom-domains.md)** - SSL instantáneo

### **🚀 Ejemplos Prácticos**

```bash
# Clonar y probar inmediatamente
git clone https://github.com/Fasttify/fasttify.git
cd fasttify && npm install && npm run dev

# ¡Tienda funcionando en localhost:3000!
```

---

## Soporte y Comunidad

- 📚 **Documentación**: [./docs/](./docs/) - Guías técnicas completas
- 🐛 **Reportar bugs**: [GitHub Issues](../../issues) - Sistema de tracking
- 💬 **Discusiones**: [GitHub Discussions](../../discussions) - Comunidad dev
- 📧 **Contacto directo**: [soporte@fasttify.com](mailto:soporte@fasttify.com)

---

<div align="center">

**🚀 Plataforma E-commerce de Nueva Generación**

[📖 Documentación Completa](./docs/) | [🛠️ Comenzar Desarrollo](./docs/engine/theme-development-guide.md) | [🌐 Dominios Automáticos](./docs/domains/)

**Construido con 💙 para la comunidad dev**

_Shopify-compatible • Multi-tenant • Serverless • Open Source_

</div>
