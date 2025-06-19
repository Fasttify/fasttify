# Sistema de Renderizado de Tiendas

Sistema completo y avanzado para renderizar tiendas de e-commerce con dominios personalizados, plantillas Liquid compatibles con Shopify, SEO optimizado y manejo de errores amigable.

## Arquitectura

```
renderer-engine/
├── index.ts                        # Factory principal del sistema
├── liquid/                         # Motor de plantillas LiquidJS
│   ├── engine.ts                   # Configuración y gestión del motor
│   ├── filters.ts                  # Filtros personalizados de Shopify
│   └── tags/                       # Tags personalizados para compatibilidad
│       ├── form-tag.ts             # Formularios interactivos
│       ├── javascript-tag.ts       # JavaScript dinámico en secciones
│       ├── paginate-tag.ts         # Sistema de paginación avanzado
│       ├── render-tag.ts           # Inclusión de snippets
│       ├── schema-tag.ts           # Configuración de secciones
│       ├── script-tag.ts           # Etiquetas de script
│       ├── section-tag.ts          # Inclusión de secciones
│       └── style-tag.ts            # CSS dinámico en secciones
├── renderers/
│   └── dynamic-page-renderer.ts    # Renderizador dinámico unificado
├── services/
│   ├── core/                       # Servicios fundamentales
│   │   ├── cache-manager.ts        # Sistema de caché multinivel
│   │   ├── data-transformer.ts     # Transformaciones de datos
│   │   ├── domain-resolver.ts      # Resolución dominio → tienda
│   │   └── linkList-service.ts     # Generación de menús
│   ├── errors/
│   │   └── error-renderer.ts       # Sistema de errores UI amigable
│   ├── fetchers/                   # Obtención de datos especializados
│   │   ├── collection-fetcher.ts   # Datos de colecciones
│   │   ├── data-fetcher.ts         # Orquestador principal
│   │   ├── product-fetcher.ts      # Datos de productos
│   │   └── template-fetcher.ts     # Datos de templates
│   ├── page/                       # Configuración de páginas
│   │   ├── page-config.ts          # Configuraciones por tipo
│   │   └── page-data-loader.ts     # Cargador de datos de página
│   ├── rendering/                  # Servicios de renderizado
│   │   ├── asset-collector.ts      # Recolección de CSS/JS dinámico
│   │   ├── context-builder.ts      # Construcción de contextos Liquid
│   │   ├── metadata-generator.ts   # Generación de metadata SEO
│   │   └── section-renderer.ts     # Renderizado de secciones
│   └── templates/                  # Gestión de plantillas
│       ├── schema-parser.ts        # Procesamiento de schemas
│       ├── template-dev-synchronizer.ts # Sincronización en desarrollo
│       └── template-loader.ts      # Carga desde S3/CloudFront
└── types/                          # Definiciones TypeScript completas
    ├── index.ts                    # Exportaciones principales
    ├── liquid.ts                   # Tipos del motor Liquid
    ├── product.ts                  # Tipos de productos y colecciones
    ├── store.ts                    # Tipos de tiendas
    └── template.ts                 # Tipos de plantillas y renderizado
```

## Uso Básico

### Renderizado Simple

```typescript
import { storeRenderer } from '@/renderer-engine'

// Renderizar homepage
const result = await storeRenderer.renderPage('mitienda.fasttify.com', '/')

// Renderizar producto específico
const productResult = await storeRenderer.renderPage(
  'mitienda.fasttify.com',
  '/products/mi-producto'
)

// Renderizar colección
const collectionResult = await storeRenderer.renderPage(
  'mitienda.fasttify.com',
  '/collections/mi-coleccion'
)
```

### Verificación de Tienda

```typescript
import { storeRenderer } from '@/renderer-engine'

// Verificar si una tienda puede ser renderizada
const canRender = await storeRenderer.canRenderStore('mitienda.fasttify.com')
```

## Componentes Principales

### 1. StoreRendererFactory

Factory principal que orquesta todo el sistema de renderizado.

**Características:**

- Conversión automática de paths a opciones de renderizado
- Manejo inteligente de errores con UI amigable
- Integración con todos los servicios del sistema
- Caché automático con TTL por tipo de página

**Tipos de página soportados:**

- `index` - Homepage de la tienda
- `product` - Páginas de productos
- `collection` - Páginas de colecciones
- `page` - Páginas estáticas
- `blog` - Páginas de blog
- `search` - Página de búsqueda
- `cart` - Carrito de compras
- `404` - Página no encontrada

### 2. DynamicPageRenderer

Renderizador dinámico que maneja cualquier tipo de página de manera unificada.

**Proceso de renderizado:**

1. Resolución de dominio a tienda
2. Verificación de plantillas existentes
3. Carga paralela de datos y plantillas
4. Construcción del contexto de renderizado
5. Pre-carga de secciones del layout
6. Renderizado con motor Liquid
7. Inyección de assets dinámicos
8. Generación de metadata SEO

### 3. Motor Liquid

Sistema de plantillas basado en LiquidJS con compatibilidad completa con Shopify.

#### Filtros Disponibles

```liquid
<!-- Formateo de precios -->
{{ 15000 | money }}                    <!-- $15.000 -->
{{ 15000 | money_without_currency }}   <!-- 15.000 -->

<!-- URLs de productos y colecciones -->
{{ product | product_url }}            <!-- /products/mi-producto -->
{{ collection | collection_url }}      <!-- /collections/mi-coleccion -->

<!-- Manipulación de imágenes -->
{{ product.image | img_url: '300x300' }}
{{ 'logo.png' | asset_url }}

<!-- Fechas y texto -->
{{ "2024-01-15" | date: "%d/%m/%Y" }}  <!-- 15/01/2024 -->
{{ text | truncate: 100 }}             <!-- Texto truncado... -->
{{ title | handleize }}                <!-- titulo-seo-friendly -->

<!-- Tags HTML -->
{{ 'style.css' | asset_url | stylesheet_tag }}
{{ 'script.js' | asset_url | script_tag }}
```

#### Tags Personalizados

```liquid
<!-- Secciones y snippets -->
{% section 'header' %}
{% render 'product-card', product: product %}

<!-- Formularios -->
{% form 'contact' %}
  <input type="email" name="email" required>
  <button type="submit">Enviar</button>
{% endform %}

<!-- Paginación -->
{% paginate collections.all by 12 %}
  {% for collection in collections %}
    <!-- Contenido -->
  {% endfor %}
  {{ paginate | default_pagination }}
{% endpaginate %}

<!-- CSS y JavaScript dinámico -->
{% style %}
  .section-{{ section.id }} {
    background: {{ section.settings.background_color }};
  }
{% endstyle %}

{% javascript %}
  console.log('Sección:', {{ section.id | json }});
{% endjavascript %}

<!-- Configuración de secciones -->
{% schema %}
{
  "name": "Hero Banner",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Título"
    }
  ]
}
{% endschema %}
```

### 4. Sistema de Datos

#### Obtención de Datos

```typescript
import { dataFetcher } from '@/renderer-engine'

// Productos con paginación
const products = await dataFetcher.getStoreProducts(storeId, {
  limit: 20,
  nextToken: 'cursor',
})

// Producto específico
const product = await dataFetcher.getProduct(storeId, productId)

// Productos destacados
const featured = await dataFetcher.getFeaturedProducts(storeId, 8)

// Colecciones
const collections = await dataFetcher.getStoreCollections(storeId)

// Colección con productos
const collection = await dataFetcher.getCollection(storeId, collectionId)
```

#### Gestión de Caché

```typescript
import { dataFetcher } from '@/renderer-engine'

// Invalidar caché de tienda completa
dataFetcher.invalidateStoreCache(storeId)

// Invalidar producto específico
dataFetcher.invalidateProductCache(storeId, productId)

// Limpiar caché expirado
dataFetcher.cleanExpiredCache()

// Estadísticas de caché
const stats = dataFetcher.getCacheStats()
```

### 5. Sistema de Plantillas

#### Carga de Plantillas

```typescript
import { templateLoader } from '@/renderer-engine'

// Layout principal
const layout = await templateLoader.loadMainLayout(storeId)

// Sección específica
const section = await templateLoader.loadSection(storeId, 'header')

// Plantilla por tipo
const template = await templateLoader.loadTemplateByType(storeId, 'sections', 'product-card')

// Verificar existencia
const hasTemplates = await templateLoader.hasTemplates(storeId)
```

#### Sincronización en Desarrollo

```typescript
import { TemplateDevSynchronizer } from '@/renderer-engine'

const synchronizer = TemplateDevSynchronizer.getInstance()

// Iniciar sincronización automática
await synchronizer.start({
  localDir: './template',
  storeId: 'store-123',
  bucketName: 'mi-bucket',
})

// Escuchar cambios
synchronizer.onChanges(changes => {
  console.log('Archivos modificados:', changes)
})

// Sincronización manual completa
await synchronizer.syncAll()
```

### 6. Resolución de Dominios

```typescript
import { domainResolver } from '@/renderer-engine'

// Resolver dominio a tienda
const store = await domainResolver.resolveStoreByDomain('mitienda.fasttify.com')

// Verificar si dominio existe
const domain = await domainResolver.resolveDomain('mitienda.fasttify.com')

// Invalidar caché de dominio
domainResolver.invalidateCache('mitienda.fasttify.com')
```

### 7. Sistema de Errores Amigable

El sistema incluye un renderizador de errores que genera páginas amigables para diferentes tipos de errores:

**Tipos de error:**

- `STORE_NOT_FOUND` - Tienda no encontrada
- `TEMPLATE_NOT_FOUND` - Plantillas no configuradas
- `RENDER_ERROR` - Error de renderizado
- `DATA_ERROR` - Error de conexión/datos

**Características:**

- Diseño minimalista estilo Shopify
- Header con navegación a Fasttify
- Botones de acción contextual
- Secciones informativas responsive
- Detalles técnicos solo en desarrollo
- Footer con branding

## Variables de Contexto Liquid

### Contexto de Tienda

```liquid
{{ shop.name }}              <!-- Nombre de la tienda -->
{{ shop.domain }}            <!-- Dominio personalizado -->
{{ shop.currency }}          <!-- Moneda (COP, USD) -->
{{ shop.email }}             <!-- Email de contacto -->
{{ shop.description }}       <!-- Descripción -->
{{ shop.logo }}              <!-- URL del logo -->
```

### Contexto de Página

```liquid
{{ page.title }}             <!-- Título de la página -->
{{ page.url }}               <!-- URL actual -->
{{ page.template }}          <!-- Tipo de plantilla -->
{{ page.handle }}            <!-- Slug SEO-friendly -->
```

### Productos

```liquid
{% for product in products %}
  {{ product.id }}           <!-- ID único -->
  {{ product.title }}        <!-- Nombre del producto -->
  {{ product.price }}        <!-- Precio formateado -->
  {{ product.description }}  <!-- Descripción -->
  {{ product.url }}          <!-- URL SEO-friendly -->
  {{ product.slug }}         <!-- Slug del producto -->

  {% for image in product.images %}
    {{ image.url }}          <!-- URL de la imagen -->
    {{ image.alt }}          <!-- Texto alternativo -->
  {% endfor %}

  {% for variant in product.variants %}
    {{ variant.title }}      <!-- Nombre de la variante -->
    {{ variant.price }}      <!-- Precio de la variante -->
    {{ variant.available }}  <!-- Disponibilidad -->
  {% endfor %}
{% endfor %}
```

### Colecciones

```liquid
{% for collection in collections %}
  {{ collection.title }}     <!-- Nombre de la colección -->
  {{ collection.description }} <!-- Descripción -->
  {{ collection.url }}       <!-- URL de la colección -->
  {{ collection.image }}     <!-- Imagen destacada -->

  {% for product in collection.products %}
    <!-- Productos de la colección -->
  {% endfor %}
{% endfor %}
```

## Configuración de Caché

### TTL por Tipo de Contenido

- **Plantillas:** 1 hora (1 segundo en desarrollo)
- **Productos:** 15 minutos
- **Colecciones:** 30 minutos
- **Dominios:** 30 minutos
- **Templates de tienda:** 30 minutos

### Gestión Automática

- Limpieza automática de entradas expiradas
- Invalidación inteligente por dependencias
- Estadísticas de rendimiento integradas

## Metadata y SEO

### Generación Automática

```typescript
const metadata = {
  title: 'Producto Genial | Mi Tienda',
  description: 'Descripción optimizada para SEO...',
  canonical: 'https://mitienda.fasttify.com/products/producto-genial',
  openGraph: {
    title: 'Producto Genial',
    description: 'Descripción para redes sociales',
    type: 'product',
    image: 'https://cdn.mitienda.com/imagen.jpg',
  },
  schema: {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Producto Genial',
    offers: {
      '@type': 'Offer',
      price: '15000',
      priceCurrency: 'COP',
    },
  },
}
```

### Tipos de Schema.org

- **WebPage:** Para páginas generales
- **Product:** Para productos individuales
- **CollectionPage:** Para colecciones
- **Organization:** Para información de la tienda

## Monitoreo y Debugging

### Logs Estructurados

- Errores de renderizado con contexto completo
- Estadísticas de rendimiento de caché
- Métricas de tiempo de renderizado
- Seguimiento de resolución de dominios

### Estadísticas de Caché

```typescript
const stats = cacheManager.getCacheStats()
// { total: 150, expired: 10, active: 140 }
```

### Modo Desarrollo

- TTL de caché reducido para plantillas
- Sincronización automática de archivos
- Detalles técnicos en páginas de error
- Logs verbosos de renderizado

## Variables de Entorno

```env
# Almacenamiento de plantillas
BUCKET_NAME=mi-bucket-plantillas
AWS_REGION_BUCKET=us-east-1
CLOUDFRONT_DOMAIN_NAME=cdn.midominio.com

# Configuración del entorno
APP_ENV=production
NODE_ENV=production
```

## Próximas Funcionalidades

- Renderizador de páginas de blog y artículos
- Sistema de temas con herencia
- A/B testing de plantillas
- Analytics de renderizado integrado
- Optimización automática de imágenes
- CDN edge caching avanzado
- Soporte para múltiples idiomas
- Sistema de comentarios en plantillas
