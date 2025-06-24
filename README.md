# Fasttify

**Plataforma SaaS completa para crear y gestionar tiendas online con motor de plantillas Liquid avanzado**
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Fasttify/fasttify)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![AWS Amplify](https://img.shields.io/badge/AWS%20Amplify-Gen2-orange?logo=aws&logoColor=white)](https://aws.amazon.com/amplify/)
[![LiquidJS](https://img.shields.io/badge/LiquidJS-10.21.1-blue?logo=liquid&logoColor=white)](https://liquidjs.com/)
[![Shopify Polaris](https://img.shields.io/badge/Polaris-13.9.5-95BF47?logo=shopify&logoColor=white)](https://polaris.shopify.com/)

---

## Descripción General

Fasttify es una **plataforma SaaS avanzada** que permite a emprendedores crear, personalizar y gestionar tiendas de e-commerce con un enfoque en dropshipping y comercio digital. Construida con **Next.js 15**, **AWS Amplify Gen2** y un **motor de plantillas Liquid personalizado**, combina la flexibilidad del desarrollo moderno con la potencia de un sistema multi-tenant empresarial.

> [!WARNING]
>   PROYECTO EN DESARROLLO ACTIVO
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

🏪 **Sistema Multi-Tenant Completo**

- Gestión independiente de múltiples tiendas por usuario
- Dominios personalizados automatizados con SSL
- Motor de plantillas Liquid compatible con Shopify

🤖 **IA Integrada con AWS Bedrock**

- Generación automática de descripciones de productos
- Sugerencias inteligentes de precios para el mercado colombiano
- Chat de soporte con Claude 3 Haiku

💳 **Pasarelas de Pago Colombianas**

- Integración nativa con **Wompi** (tarifas desde 2.9%)
- Soporte completo para **Mercado Pago**
- Encriptación segura de API keys

📊 **Gestión Integral de Suscripciones**

- Integración con **Polar** para facturación
- Webhooks en tiempo real para sincronización
- Gestión automática de planes y upgrades

🔐 **Arquitectura de Seguridad Empresarial**

- AWS Cognito con autenticación multifactor
- Encriptación de extremo a extremo
- Logs seguros y auditoría completa

---

## Stack Tecnológico

### **Frontend**

```
Next.js 15 (App Router)
├── TypeScript 5.7.3
├── Tailwind CSS 3.4.17
├── Shopify Polaris 13.9.5
├── Radix UI Components
├── React Query (TanStack Query)
├── Zustand (State Management)
├── React Hook Form + Zod
└── Framer Motion
```

### **Backend**

```
AWS Amplify Gen 2
├── AWS AppSync (GraphQL API)
├── AWS Cognito (Autenticación)
├── DynamoDB (Base de datos)
├── AWS Lambda (Funciones serverless)
├── AWS Bedrock (IA/ML)
├── AWS S3 (Almacenamiento)
├── AWS SES (Email)
└── AWS ACM (Certificados SSL)
```

### **Motor de Plantillas**

```
LiquidJS 10.21.1
├── Tags Shopify compatibles
├── Filtros personalizados
├── Renderizado SSR optimizado
├── Cache inteligente multinivel
└── Sincronización en desarrollo
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

### **2. Configurar AWS Amplify**

```bash
# Inicializar proyecto de Amplify
npx @aws-amplify/cli@latest init

# Desplegar backend
npx @aws-amplify/cli@latest deploy
```

### **3. Variables de entorno**

Crear `.env.local`:

```env
# AWS Amplify
NEXT_PUBLIC_S3_URL="tu-s3-url"
NEXT_PUBLIC_AWS_REGION="tu-region"
BUCKET_NAME="tu-bucket-name"
AWS_REGION="tu-region"
CLOUDFRONT_MULTI_TENANT_DISTRIBUTION_ID="tu-distribution-id"

# Desarrollo
APP_ENV=development
```

### **4. Ejecutar en desarrollo**

```bash
npm run dev
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

### **3. Motor de Plantillas Liquid Avanzado**

**Características técnicas:**

- **100% compatible con Shopify Liquid**
- **Tags personalizados**: `{% render %}`, `{% section %}`, `{% paginate %}`
- **Filtros especializados**: `money`, `img_url`, `asset_url`
- **Renderizado SSR** optimizado para SEO
- **Cache multinivel** con invalidación inteligente
- **Sincronización en tiempo real** para desarrollo

**Ejemplo de uso:**

```liquid
<!-- Plantilla de producto con IA -->
{% assign ai_description = product | generate_ai_description %}
{% assign price_suggestion = product | ai_price_suggestion %}

<div class="product-detail">
  <h1>{{ product.name }}</h1>

  <!-- Precio con sugerencia IA -->
  <div class="price-section">
    <span class="current-price">{{ product.price | money }}</span>
    {% if price_suggestion.suggestedPrice != product.price %}
      <small class="ai-suggestion">
        IA sugiere: {{ price_suggestion.suggestedPrice | money }}
      </small>
    {% endif %}
  </div>

  <!-- Descripción mejorada por IA -->
  <div class="description">
    {{ ai_description }}
  </div>
</div>
```

### **4. IA Integrada con AWS Bedrock**

**Funciones disponibles:**

```typescript
// 1. Generación de descripciones
generateProductDescription(productName: string, category?: string)
// Retorna: descripción optimizada de 100-150 palabras

// 2. Sugerencias de precios
generatePriceSuggestion(productName: string, category?: string)
// Retorna: {
//   suggestedPrice: number,
//   minPrice: number,
//   maxPrice: number,
//   confidence: 'high' | 'medium' | 'low',
//   explanation: string
// }

// 3. Chat de soporte
generateHaiku(prompt: string)
// Chatbot especializado en e-commerce y dropshipping
```

### **5. Dominios Personalizados Automatizados**

**Sistema completo CloudFront Multi-Tenant:**

- **Certificados SSL automáticos** vía AWS ACM
- **Validación DNS inteligente** cada hora
- **Verificación de propiedad** con tokens únicos
- **Estados transitórios**: `pending` → `active` → `failed`
- **Instrucciones DNS** específicas por proveedor

```typescript
// API de configuración
POST /api/stores/[storeId]/custom-domain
{
  "domain": "mitienda.com",
  "storeId": "store_123"
}

// Respuesta con instrucciones DNS
{
  "success": true,
  "dnsInstructions": {
    "type": "CNAME",
    "name": "mitienda.com",
    "value": "d123abc.cloudfront.net",
    "provider": "cloudflare" // Instrucciones específicas
  }
}
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
  totalOrders: number
  revenue: number
  topProducts: Product[]
  recentOrders: Order[]
  trafficStats: AnalyticsData
  conversionRate: number
}
```

### **Para Desarrolladores**

#### **1. Desarrollo de plantillas Liquid**

```bash
# Sincronización en tiempo real
npm run template-sync -- start STORE_ID ./template

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
  })
}

// Integración con nueva pasarela de pago
export const configurePaymentGateway = async (
  storeId: string,
  gateway: PaymentGatewayType,
  config: PaymentConfig
) => {
  // Encriptación automática de API keys
  // Validación de configuración
  // Actualización en base de datos
}
```

---

## Scripts Disponibles

| Comando                 | Descripción                       |
| ----------------------- | --------------------------------- |
| `npm run dev`           | Servidor desarrollo con Turbopack |
| `npm run build`         | Build optimizado para producción  |
| `npm run start`         | Servidor de producción            |
| `npm run test`          | Tests unitarios con Jest          |
| `npm run test:watch`    | Tests en modo watch               |
| `npm run test:coverage` | Coverage completo                 |
| `npm run lint`          | ESLint + Prettier                 |
| `npm run template-sync` | Sincronización plantillas         |

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

- ✅ Componentes UI principales
- ✅ Hooks personalizados
- ✅ Middlewares de autenticación
- ✅ Funciones Lambda
- ✅ Tags Liquid personalizados

---

## Casos de Uso Reales

### **1. Tienda de Moda**

```javascript
const fashionStore = {
  theme: 'modern-boutique',
  products: {
    variants: ['talla', 'color'],
    aiDescriptions: true,
    pricingStrategy: 'market-competitive',
  },
  payments: ['wompi', 'mercadoPago'],
  shipping: 'colombia-nationwide',
}
```

### **2. Dropshipping Electrónicos**

```javascript
const techStore = {
  theme: 'tech-minimal',
  products: {
    aiPricing: true,
    supplierIntegration: 'mastershop',
    categories: ['smartphones', 'laptops', 'accesorios'],
  },
  targeting: 'colombia-urban',
}
```

### **3. Tienda Local con Delivery**

```javascript
const localStore = {
  theme: 'local-business',
  location: 'bogota-chapinero',
  delivery: {
    zones: ['chapinero', 'zona-rosa', 'chicó'],
    methods: ['delivery-propio', 'rappi', 'uber-eats'],
  },
}
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

### **Q1 2025**

- [ ] **App móvil** (React Native + Expo)
- [ ] **Multi-idioma** (i18n completo)
- [ ] **Integración WhatsApp Business** nativa
- [ ] **Analytics avanzados** con predicciones IA

### **Q2 2025**

- [ ] **Marketplace multi-vendor**
- [ ] **Sistema de afiliados** automático
- [ ] **Integración Meta Ads** directa
- [ ] **POS físico** para tiendas híbridas

---

## Licencia

Este proyecto está bajo la **Licencia MIT** - ver [LICENSE](LICENSE) para detalles.

---

## Soporte

- 📚 **Documentación**: [./docs/](./docs/)
- 🐛 **Reportar bugs**: [GitHub Issues](../../issues)
- 💬 **Comunidad**: [Discord](https://discord.gg/fasttify)
- 📧 **Contacto**: [soporte@fasttify.com](mailto:soporte@fasttify.com)

---

<div align="center">

**¿Listo para revolucionar tu e-commerce?**

[🚀 Comenzar ahora](https://fasttify.com) | [📖 Documentación](./docs/) | [💬 Comunidad](https://discord.gg/fasttify)

**Hecho con ❤️ en Colombia**

</div>
