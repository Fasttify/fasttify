# Renderer Engine

Sistema de renderizado de tiendas dinámico usando templates Liquid.

## Estructura del Proyecto

```
renderer-engine/
├── index.ts                 # Punto de entrada principal (re-exports)
├── exports.ts              # Organización de todas las exportaciones
├── instances.ts            # Instancias singleton
├── config/
│   └── route-matchers.ts   # Configuración de rutas y matchers
├── factories/
│   └── store-renderer-factory.ts  # Factory principal
├── renderers/
│   └── dynamic-page-renderer.ts   # Renderizador dinámico
├── liquid/
│   ├── engine.ts           # Motor Liquid
│   ├── filters/            # Filtros Liquid
│   └── tags/               # Tags Liquid
├── services/
│   ├── core/               # Servicios core
│   ├── errors/             # Manejo de errores
│   ├── fetchers/           # Obtención de datos
│   ├── page/               # Servicios de página
│   ├── rendering/          # Servicios de renderizado
│   └── templates/          # Servicios de plantillas
└── types/                  # Definiciones de tipos
```

## Uso Básico

```typescript
import { storeRenderer } from '@/renderer-engine';

// Renderizar una página
const result = await storeRenderer.renderPage('mystore.com', '/products/my-product');

// Verificar si una tienda puede ser renderizada
const canRender = await storeRenderer.canRenderStore('mystore.com');
```

## Componentes Principales

### StoreRendererFactory

Factory principal que coordina el renderizado de páginas de tiendas.

**Métodos:**

- `renderPage(domain, path, searchParams)` - Renderiza una página
- `canRenderStore(domain)` - Verifica si una tienda puede ser renderizada

### Route Matchers

Sistema declarativo para mapear URLs a tipos de página.

**Tipos de ruta soportados:**

- Homepage (`/`)
- Productos (`/products/handle`)
- Colecciones (`/collections/handle`)
- Páginas estáticas (`/pages/handle`)
- Blog (`/blogs/handle`)
- Carrito (`/cart`)
- Búsqueda (`/search`)
- Políticas (`/policies`)

### DynamicPageRenderer

Renderizador que maneja la lógica de renderizado dinámico.

## Servicios Disponibles

### Core Services

- `domainResolver` - Resolución de dominios
- `linkListService` - Servicio de navegación

### Data Services

- `dataFetcher` - Obtención de datos
- `navigationFetcher` - Obtención de navegación
- `dynamicDataLoader` - Carga dinámica de datos

### Template Services

- `templateLoader` - Carga de plantillas
- `templateAnalyzer` - Análisis de plantillas

### Error Services

- `errorRenderer` - Renderizado de errores

## Configuración

### Agregar Nuevas Rutas

Para agregar una nueva ruta, edita `config/route-matchers.ts`:

```typescript
{
  pattern: /^\/my-new-route\/([^\/]+)$/,
  handler: (match) => ({
    pageType: 'custom',
    handle: match[1],
  }),
}
```

### Personalizar Renderizado

Extiende `StoreRendererFactory` o usa los servicios individuales para personalizar el comportamiento.

## Tipos Principales

```typescript
// Resultado del renderizado
type RenderResult = {
  html: string;
  metadata: {
    title: string;
    description: string;
    // ... más metadatos
  };
};

// Opciones de renderizado
type PageRenderOptions = {
  pageType: 'index' | 'product' | 'collection' | 'page' | 'blog' | 'cart' | 'search' | '404';
  handle?: string;
  collectionHandle?: string;
};
```

## Arquitectura

El sistema sigue el patrón Factory con:

1. **Configuración declarativa** - Rutas definidas en `route-matchers.ts`
2. **Separación de responsabilidades** - Cada servicio tiene una función específica
3. **Inyección de dependencias** - Servicios se inyectan en el factory
4. **Manejo de errores centralizado** - Todos los errores se manejan de forma consistente
5. **Exportaciones organizadas** - API pública clara y bien documentada
