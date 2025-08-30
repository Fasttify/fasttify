# Arquitectura del Sistema de Búsqueda - Documentación Técnica

## Visión General

El sistema de búsqueda automática está diseñado con una arquitectura modular que separa las responsabilidades y permite una fácil extensión. Utiliza el patrón Singleton para los cargadores y sigue principios de inyección de dependencias.

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    DynamicDataLoader                        │
│                    (Orquestador)                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                          │
┌───▼─────────┐        ┌───────▼────────┐
│CoreDataLoader│        │SearchDataLoader│
│             │        │                │
│ • Análisis  │        │ • Productos    │
│ • Paginación│        │ • Colecciones  │
│ • Contexto  │        │ • Límites      │
└─────────────┘        └────────────────┘
                              │
                       ┌──────▼──────┐
                       │SearchLimits │
                       │Extractor    │
                       │             │
                       │ • settings  │
                       │ • schema    │
                       └─────────────┘
```

## Componentes Detallados

### 1. DynamicDataLoader (Orquestador)

**Ubicación**: `renderer-engine/services/page/dynamic-data-loader.ts`

**Responsabilidades**:

- Coordinar la carga de datos principales y de búsqueda
- Manejar errores y fallbacks
- Proporcionar una interfaz unificada

**Interfaz Principal**:

```typescript
interface DynamicLoadResult {
  products: any[];
  collections: any[];
  contextData: Record<string, any>;
  metaData: Record<string, any>;
  cartData: any;
  analysis: any;
  nextToken?: string;
  paginate?: PaginationInfo;
  searchProducts?: any[];
  searchCollections?: any[];
}
```

### 2. CoreDataLoader (Datos Principales)

**Ubicación**: `renderer-engine/services/page/data-loader/core-data-loader.ts`

**Responsabilidades**:

- Análisis de plantillas para determinar necesidades de datos
- Carga de productos y colecciones principales
- Manejo de carrito y contexto
- Construcción de objetos de paginación

**Métodos Principales**:

```typescript
class CoreDataLoader {
  async loadCoreData(
    storeId: string,
    options: PageRenderOptions,
    searchParams: Record<string, string> = {}
  ): Promise<CoreData>;
}
```

### 3. SearchDataLoader (Datos de Búsqueda)

**Ubicación**: `renderer-engine/services/page/data-loader/search-data-loader.ts`

**Responsabilidades**:

- Carga de productos específicos para búsqueda
- Carga de colecciones para búsqueda (opcional)
- Inyección de datos en el contexto Liquid
- Manejo de límites configurables

**Interfaz de Datos**:

```typescript
interface SearchData {
  searchProducts: any[];
  searchProductsLimit: number;
  searchCollections?: any[];
  searchCollectionsLimit?: number;
}
```

### 4. SearchLimitsExtractor (Configuración)

**Ubicación**: `renderer-engine/services/page/data-loader/search-limits-extractor.ts`

**Responsabilidades**:

- Extraer límites de `settings_schema.json`
- Ser agnóstico al nombre de secciones
- Proporcionar valores por defecto seguros

**Características**:

- Busca settings en cualquier sección del schema
- Valida que los valores sean números válidos
- Maneja errores gracefully

## Flujo de Datos Detallado

### 1. Inicialización

```typescript
// En loadDataStep del pipeline de renderizado
const loadedTemplates = {
  'config/settings_schema.json': settingsContent,
  'layout/theme.liquid': layoutContent,
  // ... otros templates
};

const pageData = await dynamicDataLoader.loadDynamicData(storeId, options, searchParams, loadedTemplates);
```

### 2. Carga de Datos Principales

```typescript
// CoreDataLoader.loadCoreData()
const analysis = await analyzeRequiredTemplates(storeId, options);
const cartData = await dataFetcher.getCart(storeId);
const { loadedData, paginationInfo } = await loadDataFromAnalysis(...);
const contextData = await buildContextData(storeId, options, loadedData);
```

### 3. Carga de Datos de Búsqueda

```typescript
// SearchDataLoader.loadSearchData()
const { searchProductsLimit, searchCollectionsLimit } = extractSearchLimitsFromSettings(loadedTemplates);

const searchProductsData = await dataFetcher.getStoreProducts(storeId, {
  limit: searchProductsLimit,
});
```

### 4. Inyección en Contexto

```typescript
// SearchDataLoader.injectSearchDataIntoContext()
contextData.search_products = searchData.searchProducts;
contextData.search_products_limit = searchData.searchProductsLimit;
```

## Configuración del Sistema

### Estructura de settings_schema.json

El sistema busca automáticamente los siguientes settings en cualquier sección:

```json
{
  "id": "search_products_limit",
  "type": "range",
  "default": 8,
  "min": 4,
  "max": 20,
  "step": 2
}
```

```json
{
  "id": "search_collections_limit",
  "type": "range",
  "default": 4,
  "min": 2,
  "max": 10,
  "step": 1
}
```

### Variables Liquid Disponibles

| Variable                   | Tipo   | Descripción               |
| -------------------------- | ------ | ------------------------- |
| `search_products`          | Array  | Productos para búsqueda   |
| `search_products_limit`    | Number | Límite configurado        |
| `search_collections`       | Array  | Colecciones para búsqueda |
| `search_collections_limit` | Number | Límite de colecciones     |

## Patrones de Diseño Utilizados

### 1. Singleton Pattern

```typescript
export class SearchDataLoader {
  private static instance: SearchDataLoader;

  public static getInstance(): SearchDataLoader {
    if (!SearchDataLoader.instance) {
      SearchDataLoader.instance = new SearchDataLoader();
    }
    return SearchDataLoader.instance;
  }
}
```

### 2. Dependency Injection

```typescript
// Los cargadores reciben dependencias como parámetros
async loadSearchData(
  storeId: string,
  loadedTemplates: Record<string, string>
): Promise<SearchData>
```

### 3. Strategy Pattern

```typescript
// Diferentes estrategias de carga según el tipo de datos
const coreData = await coreDataLoader.loadCoreData(...);
const searchData = await searchDataLoader.loadSearchData(...);
```

## Manejo de Errores

### Estrategia de Fallbacks

```typescript
try {
  // Intentar carga normal
  return await loadSearchData(storeId, loadedTemplates);
} catch (error) {
  logger.warn('Failed to load search data, using fallback', error);
  return {
    searchProducts: [],
    searchProductsLimit: 8,
    searchCollections: [],
    searchCollectionsLimit: undefined,
  };
}
```

### Logging Estructurado

```typescript
logger.info('Search data loaded successfully', {
  productsCount: searchProducts.length,
  collectionsCount: searchCollections.length,
  productsLimit: searchProductsLimit,
  collectionsLimit: searchCollectionsLimit,
});
```

## Optimizaciones de Performance

### 1. Carga Paralela

```typescript
// Los datos principales y de búsqueda se cargan en paralelo
const [coreData, searchData] = await Promise.all([
  coreDataLoader.loadCoreData(storeId, options, searchParams),
  searchDataLoader.loadSearchData(storeId, loadedTemplates),
]);
```

### 2. Caché Inteligente

- Los datos se cachean a nivel del motor de renderizado
- Los límites se extraen una vez por sesión
- Reutilización de análisis de plantillas

### 3. Límites Configurables

- Evita cargar datos innecesarios
- Respeta límites de paginación
- Valores por defecto seguros

## Extensibilidad

### Agregar Nuevos Tipos de Datos

```typescript
// En SearchDataLoader
interface SearchData {
  searchProducts: any[];
  searchProductsLimit: number;
  searchCollections?: any[];
  searchCollectionsLimit?: number;
  // Nuevo tipo de datos
  searchBlogs?: any[];
  searchBlogsLimit?: number;
}
```

### Personalizar Filtros

```typescript
// Agregar lógica de filtrado
const searchProductsData = await dataFetcher.getStoreProducts(storeId, {
  limit: searchProductsLimit,
  filter: {
    status: { eq: 'active' },
    featured: { eq: true }, // Nuevo filtro
  },
});
```

### Nuevas Configuraciones

```json
{
  "id": "search_featured_only",
  "type": "checkbox",
  "default": false,
  "label": "Show only featured products in search"
}
```

## Testing

### Unit Tests Recomendados

```typescript
describe('SearchDataLoader', () => {
  it('should load search products with configured limit', async () => {
    // Test implementation
  });

  it('should handle missing settings gracefully', async () => {
    // Test fallback behavior
  });

  it('should inject data into context correctly', () => {
    // Test context injection
  });
});
```

### Integration Tests

```typescript
describe('Search System Integration', () => {
  it('should work end-to-end with real templates', async () => {
    // Test complete flow
  });
});
```

## Monitoreo y Debugging

### Logs Clave

- `Search limits extracted from settings`
- `Search data loaded successfully`
- `Dynamic data loading completed`

### Métricas Recomendadas

- Tiempo de carga de datos de búsqueda
- Número de productos cargados
- Tasa de éxito de carga
- Uso de caché

## Consideraciones de Seguridad

### Validación de Entrada

- Los límites se validan como números
- Valores por defecto seguros
- Sanitización de datos de productos

### Control de Acceso

- Verificación de ownership de tienda
- Validación de permisos de usuario
- Logging de accesos

## Roadmap de Mejoras

### Corto Plazo

- [ ] Búsqueda en tiempo real
- [ ] Filtros avanzados
- [ ] Cache de resultados

### Mediano Plazo

- [ ] Búsqueda por categorías
- [ ] Sugerencias de búsqueda
- [ ] Analytics de búsqueda

### Largo Plazo

- [ ] Machine learning para relevancia
- [ ] Búsqueda semántica
- [ ] Integración con sistemas externos
