# Sistema de Renderizado de Tiendas

Sistema completo para renderizar tiendas de e-commerce con dominios personalizados, plantillas Liquid, y SEO optimizado.

## 🏗️ Arquitectura

```
lib/store-renderer/
├── types/                 # Definiciones TypeScript
├── services/             # Servicios principales
│   ├── domain-resolver.ts    # Resolución dominio → tienda
│   ├── template-loader.ts    # Carga plantillas desde S3
│   └── data-fetcher.ts      # Obtiene datos de Amplify
├── liquid/               # Motor de plantillas LiquidJS
│   ├── engine.ts           # Configuración LiquidJS
│   └── filters.ts          # Filtros personalizados
├── renderers/            # Renderizadores específicos
│   ├── homepage.ts         # Renderizado homepage
│   └── product.ts          # Renderizado productos
└── index.ts              # Factory principal
```

## 🚀 Uso Básico

```typescript
import { storeRenderer } from '@/lib/store-renderer'

// Renderizar homepage
const result = await storeRenderer.renderPage('mitienda.fasttify.com', '/')

// Renderizar producto
const productResult = await storeRenderer.renderPage(
  'mitienda.fasttify.com',
  '/products/mi-producto'
)
```

## 🔧 Componentes Principales

### 1. Domain Resolver

Resuelve dominios personalizados a tiendas:

```typescript
import { domainResolver } from '@/lib/store-renderer'

const store = await domainResolver.resolveStoreByDomain('mitienda.fasttify.com')
```

### 2. Template Loader

Carga plantillas Liquid desde S3:

```typescript
import { templateLoader } from '@/lib/store-renderer'

const layout = await templateLoader.loadMainLayout(storeId)
const section = await templateLoader.loadSection(storeId, 'header')
```

### 3. Data Fetcher

Obtiene datos de productos/colecciones desde Amplify:

```typescript
import { dataFetcher } from '@/lib/store-renderer'

const products = await dataFetcher.getStoreProducts(storeId)
const product = await dataFetcher.getProduct(storeId, productId)
```

### 4. Liquid Engine

Renderiza plantillas con datos:

```typescript
import { liquidEngine } from '@/lib/store-renderer'

const html = await liquidEngine.render(template, context, cacheKey)
```

## 🎨 Plantillas Liquid

### Estructura de Archivos

```
templates/{storeId}/
├── layout/
│   └── theme.liquid         # Layout principal
└── sections/
    ├── header.liquid        # Encabezado
    ├── footer.liquid        # Pie de página
    ├── hero-banner.liquid   # Banner principal
    ├── featured-products.liquid  # Productos destacados
    └── collection-list.liquid    # Lista de colecciones
```

### Variables Disponibles

#### Context Global

```liquid
{{ shop.name }}              <!-- Nombre de la tienda -->
{{ shop.domain }}            <!-- Dominio personalizado -->
{{ shop.currency }}          <!-- Moneda (COP, USD) -->
{{ shop.logo }}              <!-- URL del logo -->
{{ shop.description }}       <!-- Descripción de la tienda -->

{{ page.title }}             <!-- Título de la página -->
{{ page.url }}               <!-- URL de la página -->
{{ page.template }}          <!-- Tipo de plantilla -->
```

#### Productos

```liquid
{% for product in products %}
  {{ product.title }}        <!-- Título del producto -->
  {{ product.price }}        <!-- Precio formateado -->
  {{ product.description }}  <!-- Descripción -->
  {{ product.url }}          <!-- URL SEO-friendly -->
  {{ product.handle }}       <!-- Slug del producto -->
  {{ product.available }}    <!-- Disponibilidad -->

  {% for image in product.images %}
    {{ image.url }}          <!-- URL de la imagen -->
    {{ image.alt }}          <!-- Texto alternativo -->
  {% endfor %}
{% endfor %}
```

### Filtros Disponibles

```liquid
{{ 15000 | money }}          <!-- $15.000,00 -->
{{ product.title | handleize }}  <!-- mi-producto-genial -->
{{ product | product_url }}      <!-- /products/mi-producto -->
{{ collection | collection_url }} <!-- /collections/mi-coleccion -->
{{ "2024-01-15" | date: "%d/%m/%Y" }} <!-- 15/01/2024 -->
{{ text | truncate: 100 }}       <!-- Texto truncado... -->
```

## 🌐 API Routes

### GET /api/stores/render

Renderiza páginas de tienda:

```typescript
// Renderizar homepage
GET /api/stores/render?domain=mitienda.fasttify.com

// Renderizar producto
GET /api/stores/render?domain=mitienda.fasttify.com&path=/products/mi-producto
```

## 📄 Páginas Next.js

### Rutas Dinámicas

- `app/[store]/page.tsx` - Homepage de tienda
- `app/[store]/products/[product]/page.tsx` - Página de producto

### SSR + ISR

- **SSR**: Renderizado completo en servidor
- **ISR**: Regeneración incremental cada 15-30 minutos
- **Metadata**: SEO optimizado con Open Graph y Schema.org

## 🗄️ Sistema de Caché

### Niveles de Caché

1. **Plantillas**: 1 hora (cambian poco)
2. **Productos**: 15 minutos (cambian frecuentemente)
3. **Colecciones**: 30 minutos (cambian moderadamente)
4. **Resolución dominios**: 30 minutos (estable)

### Gestión de Caché

```typescript
// Limpiar caché de tienda
templateLoader.invalidateStoreCache(storeId)
dataFetcher.invalidateStoreCache(storeId)

// Limpiar caché específico
dataFetcher.invalidateProductCache(storeId, productId)

// Estadísticas de caché
const stats = templateLoader.getCacheStats()
```

## 🎯 SEO Optimizado

### Metadata Generada

- **Title**: Optimizado por tipo de página
- **Description**: Descriptiva y con keywords
- **Canonical**: URLs canónicas correctas
- **Open Graph**: Redes sociales optimizadas
- **Schema.org**: Structured data para buscadores

### Ejemplo de Metadata

```html
<title>Mi Producto Genial | Mi Tienda</title>
<meta name="description" content="Compra Mi Producto Genial - $15.000 COP..." />
<meta property="og:type" content="product" />
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Mi Producto Genial",
    "offers": {
      "@type": "Offer",
      "price": "15000",
      "priceCurrency": "COP"
    }
  }
</script>
```

## 🔒 Manejo de Errores

### Errores Tipados

```typescript
interface TemplateError {
  type: 'STORE_NOT_FOUND' | 'TEMPLATE_NOT_FOUND' | 'DATA_ERROR' | 'RENDER_ERROR'
  message: string
  statusCode: number
  details?: any
}
```

### Códigos de Estado

- **404**: Tienda/producto no encontrado
- **500**: Error de renderizado/datos
- **400**: Parámetros inválidos

## 🚀 Deployment

### Variables de Entorno

```env
BUCKET_NAME=mi-bucket-plantillas
AWS_REGION_BUCKET=us-east-1
CLOUDFRONT_DOMAIN_NAME=cdn.midominio.com
APP_ENV=production
```

### Configuración S3

- Bucket con permisos de lectura para Lambda
- Estructura: `templates/{storeId}/layout/` y `templates/{storeId}/sections/`
- CloudFront para distribución global

## 📊 Monitoreo

### Logs Estructurados

- Errores de renderizado
- Estadísticas de caché
- Performance de consultas
- Resolución de dominios

### Métricas Importantes

- Tiempo de renderizado por página
- Hit rate del caché
- Errores por tipo de página
- Uso de memoria de caché

## 🔄 Próximas Funcionalidades

- [ ] Renderizador de colecciones
- [ ] Páginas estáticas personalizadas
- [ ] Sistema de temas
- [ ] A/B testing de plantillas
- [ ] Analytics integrado
- [ ] CDN edge caching
