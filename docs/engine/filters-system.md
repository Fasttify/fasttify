# Sistema de Filtros de Productos

## Resumen

El sistema de filtros de Fasttify permite a los usuarios filtrar productos por categorías, tags, vendors, precio y ordenamiento. El sistema está completamente integrado con el motor de renderizado Liquid y proporciona una experiencia de usuario fluida con scroll infinito.

## Características Principales

- ✅ **Filtros dinámicos**: Categorías, tags, vendors, colecciones
- ✅ **Filtros de precio**: Rango de precios configurable
- ✅ **Ordenamiento**: Múltiples opciones de ordenamiento
- ✅ **Scroll infinito**: Carga automática de más productos
- ✅ **URL persistente**: Los filtros se mantienen en la URL
- ✅ **Diseño responsive**: Sidebar adaptativo
- ✅ **Formateo automático de moneda**: Usa la función global `formatMoney`
- ✅ **Ocultar paginación**: Automáticamente cuando hay filtros activos
- ✅ **Token oculto**: El `nextToken` no aparece en la URL

## Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Liquid Tag    │    │  FilterSystem   │    │  JavaScript     │
│   {% filters %} │───▶│                 │───▶│  Generator      │
│                 │    │ (Orchestrator)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │  Data Fetcher   │    │  HTML Generator │
         │              │                 │    │                 │
         │              │ (API Calls)     │    │ (Filter UI)     │
         │              └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Rendered      │    │  Filter API     │    │  Client-side    │
│   HTML + JS     │    │                 │    │  JavaScript     │
│                 │    │ (Backend)       │    │ (Interactions)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Implementación para Desarrolladores de Temas

### 1. Incluir el Tag de Filtros

En tu template de lista de productos (`product-list-view.liquid`):

```liquid
{% comment %}
  Configurar filtros con parámetros personalizados
{% endcomment %}
{% filters
  storeId: store.id,
  cssClass: 'product-filters',
  title: 'Filtrar Productos',
  showPriceRange: true,
  showSortOptions: true,
  showClearButton: true,
  infiniteScroll: true,
  productsPerPage: 20
%}

{% comment %}
  Contenedor de productos con atributos requeridos
{% endcomment %}
<div class="product-grid" id="products-container" data-products>
  {% for product in products %}
    <div class="product-card" data-product-id="{{ product.id }}">
      <div class="product-image-wrapper">
        <a href="{{ product.url }}" class="product-link">
          <img class="product-image" src="{{ product.featured_image | image_url: width: 300 }}" alt="{{ product.title }}">
        </a>
      </div>
      <div class="product-info">
        <h3 class="product-title">{{ product.title }}</h3>
        <div class="product-price">
          <span class="price-current">{{ product.price | money }}</span>
          {% if product.compare_at_price %}
            <span class="price-compare">{{ product.compare_at_price | money }}</span>
          {% endif %}
        </div>
        <button onclick="addProductToCart('{{ product.id }}', 1)">
          Agregar al Carrito
        </button>
      </div>
    </div>
  {% endfor %}
</div>
```

### 2. Configurar CSS para el Sidebar

```css
/* Layout principal */
.product-page {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Sidebar de filtros */
.product-filters {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.product-filters__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.product-filters__section {
  margin-bottom: 2rem;
}

.product-filters__section-title {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #374151;
}

.product-filters__options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-filters__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.product-filters__checkbox {
  width: 16px;
  height: 16px;
}

.product-filters__label {
  font-size: 0.875rem;
  color: #4b5563;
}

.product-filters__count {
  margin-left: auto;
  font-size: 0.75rem;
  color: #6b7280;
  background: #e5e7eb;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

/* Controles de precio */
.product-filters__price-range {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.product-filters__price-input {
  width: 100px;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

/* Botón limpiar */
.product-filters__clear-btn {
  width: 100%;
  padding: 0.75rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.product-filters__clear-btn:hover {
  background: #b91c1c;
}

/* Loading indicator */
.product-filters__loading {
  display: none;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: #6b7280;
}

.product-filters__loading.show {
  display: flex;
}

/* Grid de productos */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.product-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .product-page {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .product-filters {
    position: static;
    order: -1;
  }
}
```

### 3. Parámetros del Tag de Filtros

#### Parámetros Básicos

| Parámetro  | Tipo   | Default          | Descripción                    |
| ---------- | ------ | ---------------- | ------------------------------ |
| `storeId`  | string | -                | **Requerido**. ID de la tienda |
| `cssClass` | string | `custom-filters` | Clase CSS para el contenedor   |
| `title`    | string | `Filtros`        | Título del sidebar             |
| `style`    | string | `sidebar`        | Estilo de presentación         |

#### Parámetros de Visualización

| Parámetro         | Tipo    | Default | Descripción                        |
| ----------------- | ------- | ------- | ---------------------------------- |
| `showCounts`      | boolean | `true`  | Mostrar contadores en filtros      |
| `showPriceRange`  | boolean | `true`  | Mostrar filtro de rango de precios |
| `showSortOptions` | boolean | `true`  | Mostrar opciones de ordenamiento   |
| `showClearButton` | boolean | `true`  | Mostrar botón "Limpiar filtros"    |

#### Parámetros de Límites

| Parámetro        | Tipo   | Default | Descripción                     |
| ---------------- | ------ | ------- | ------------------------------- |
| `maxCategories`  | number | `10`    | Máximo de categorías a mostrar  |
| `maxTags`        | number | `15`    | Máximo de tags a mostrar        |
| `maxVendors`     | number | `10`    | Máximo de vendors a mostrar     |
| `maxCollections` | number | `10`    | Máximo de colecciones a mostrar |

#### Parámetros de Scroll Infinito

| Parámetro         | Tipo    | Default | Descripción                         |
| ----------------- | ------- | ------- | ----------------------------------- |
| `infiniteScroll`  | boolean | `true`  | Habilitar scroll infinito           |
| `scrollThreshold` | number  | `100`   | Píxeles antes del final para cargar |
| `debounceDelay`   | number  | `300`   | Delay para debounce de eventos      |

#### Parámetros de Mensajes

| Parámetro          | Tipo   | Default                       | Descripción             |
| ------------------ | ------ | ----------------------------- | ----------------------- |
| `loadingMessage`   | string | `Cargando productos...`       | Mensaje durante carga   |
| `noResultsMessage` | string | `No se encontraron productos` | Mensaje sin resultados  |
| `errorMessage`     | string | `Error cargando productos`    | Mensaje de error        |
| `clearFiltersText` | string | `Limpiar filtros`             | Texto del botón limpiar |

### 4. Ejemplo Completo de Implementación

```liquid
{% comment %}
  Template: product-list-view.liquid
  Descripción: Lista de productos con filtros avanzados
{% endcomment %}

<div class="product-page">

  {% comment %}
    Sidebar de filtros con configuración personalizada
  {% endcomment %}
  {% filters
    storeId: store.id,
    cssClass: 'product-filters',
    title: 'Filtrar Productos',
    showPriceRange: true,
    showSortOptions: true,
    showClearButton: true,
    showCounts: true,
    maxCategories: 15,
    maxTags: 20,
    maxVendors: 10,
    maxCollections: 8,
    infiniteScroll: true,
    scrollThreshold: 150,
    debounceDelay: 500,
    loadingMessage: 'Buscando productos...',
    noResultsMessage: 'No encontramos productos con esos filtros',
    errorMessage: 'Hubo un error al cargar los productos',
    clearFiltersText: 'Limpiar todos los filtros'
  %}

  {% comment %}
    Contenedor principal de productos
  {% endcomment %}
  <div class="products-container">

    {% comment %}
      Header con información de resultados
    {% endcomment %}
    <div class="products-header">
      <h1 class="products-title">{{ collection.title | default: 'Todos los Productos' }}</h1>
      <p class="products-count">{{ products.size }} productos</p>
    </div>

    {% comment %}
      Grid de productos con atributos requeridos
    {% endcomment %}
    <div class="product-grid" id="products-container" data-products>
      {% for product in products %}
        <div class="product-card" data-product-id="{{ product.id }}">

          {% comment %}
            Imagen del producto
          {% endcomment %}
          <div class="product-image-wrapper">
            <a href="{{ product.url }}" class="product-link">
              <img
                class="product-image"
                src="{{ product.featured_image | image_url: width: 300 }}"
                alt="{{ product.title }}"
                loading="lazy"
              >
            </a>
          </div>

          {% comment %}
            Información del producto
          {% endcomment %}
          <div class="product-info">
            <h3 class="product-title">
              <a href="{{ product.url }}">{{ product.title }}</a>
            </h3>

            <div class="product-price">
              <span class="price-current">{{ product.price | money }}</span>
              {% if product.compare_at_price and product.compare_at_price > product.price %}
                <span class="price-compare">{{ product.compare_at_price | money }}</span>
              {% endif %}
            </div>

            {% comment %}
              Botón de agregar al carrito
            {% endcomment %}
            <button
              class="add-to-cart-btn"
              onclick="addProductToCart('{{ product.id }}', 1)"
            >
              Agregar al Carrito
            </button>
          </div>
        </div>
      {% endfor %}
    </div>

    {% comment %}
      Paginación (se oculta automáticamente cuando hay filtros)
    {% endcomment %}
    <div class="custom-pagination">
      {% if paginate.pages > 1 %}
        <div class="pagination">
          {% if paginate.previous %}
            <a href="{{ paginate.previous.url }}" class="pagination__prev">
              ← Anterior
            </a>
          {% endif %}

          <span class="pagination__info">
            Página {{ paginate.current_page }} de {{ paginate.pages }}
          </span>

          {% if paginate.next %}
            <a href="{{ paginate.next.url }}" class="pagination__next">
              Siguiente →
            </a>
          {% endif %}
        </div>
      {% endif %}
    </div>
  </div>
</div>
```

## Funcionalidades del Sistema

### 1. Filtros Dinámicos

El sistema automáticamente detecta y muestra:

- **Categorías**: Basadas en `product.category`
- **Tags**: Basados en `product.tags`
- **Vendors**: Basados en `product.vendor`
- **Colecciones**: Basadas en `product.collections`

### 2. Filtro de Precio

```liquid
{% comment %}
  El sistema genera automáticamente inputs de precio
  con el rango mínimo y máximo de los productos
{% endcomment %}
<div class="product-filters__section">
  <h3 class="product-filters__section-title">Precio</h3>
  <div class="product-filters__price-range">
    <input
      type="number"
      data-filter="price-min"
      placeholder="Mínimo"
      class="product-filters__price-input"
    >
    <span>-</span>
    <input
      type="number"
      data-filter="price-max"
      placeholder="Máximo"
      class="product-filters__price-input"
    >
  </div>
</div>
```

### 3. Ordenamiento

```liquid
{% comment %}
  Opciones de ordenamiento automáticas
{% endcomment %}
<div class="product-filters__section">
  <h3 class="product-filters__section-title">Ordenar por</h3>
  <select data-filter="sort" class="product-filters__select">
    <option value="">Relevancia</option>
    <option value="name">Nombre A-Z</option>
    <option value="name_desc">Nombre Z-A</option>
    <option value="price">Precio: Menor a Mayor</option>
    <option value="price_desc">Precio: Mayor a Menor</option>
    <option value="created_at">Más Recientes</option>
    <option value="created_at_desc">Más Antiguos</option>
  </select>
</div>
```

### 4. Scroll Infinito

El sistema implementa scroll infinito automáticamente:

- **Carga progresiva**: 50 productos por carga (configurable)
- **Token oculto**: El `nextToken` no aparece en la URL
- **Detección automática**: Solo activo cuando hay filtros aplicados
- **Debounce**: Evita múltiples requests durante scroll

### 5. Gestión de URL

```javascript
// Ejemplo de URL con filtros
/products?categories=electronics,phones&price_min=100&price_max=500&sort_by=price

// El token se envía internamente, no aparece en la URL
// URL limpia para el usuario
```

## API del Backend

### Endpoint de Filtros

```
GET /api/stores/{storeId}/products/filter
```

#### Parámetros de Query

| Parámetro     | Tipo   | Descripción                        |
| ------------- | ------ | ---------------------------------- |
| `categories`  | string | Categorías separadas por coma      |
| `tags`        | string | Tags separados por coma            |
| `vendors`     | string | Vendors separados por coma         |
| `collections` | string | Colecciones separadas por coma     |
| `price_min`   | number | Precio mínimo                      |
| `price_max`   | number | Precio máximo                      |
| `sort_by`     | string | Campo de ordenamiento              |
| `limit`       | number | Productos por página (default: 50) |
| `token`       | string | Token de paginación (interno)      |

#### Respuesta

```json
{
  "products": [
    {
      "id": "prod_123",
      "name": "Producto Ejemplo",
      "price": "29.99",
      "compareAtPrice": "39.99",
      "images": [
        {
          "url": "https://example.com/image.jpg",
          "alt": "Producto"
        }
      ],
      "url": "/products/prod_123"
    }
  ],
  "pagination": {
    "hasMore": true,
    "nextToken": "eyJ2ZXJzaW9uIjozLCJ0b2tlbiI6IkFnVjRxdjdGWTVnb2g...",
    "totalResults": 150
  }
}
```

## Personalización Avanzada

### 1. Estilos Personalizados

```css
/* Personalizar colores del tema */
.product-filters {
  --filter-primary: #3b82f6;
  --filter-secondary: #6b7280;
  --filter-accent: #f59e0b;
  --filter-error: #ef4444;
  --filter-success: #10b981;
}

.product-filters__clear-btn {
  background: var(--filter-primary);
}

.product-filters__clear-btn:hover {
  background: var(--filter-accent);
}
```

### 2. Eventos Personalizados

```javascript
// Escuchar eventos del sistema de filtros
document.addEventListener('filters:applied', (event) => {
  console.log('Filtros aplicados:', event.detail);
});

document.addEventListener('filters:cleared', (event) => {
  console.log('Filtros limpiados');
});

document.addEventListener('filters:loading', (event) => {
  console.log('Cargando productos...');
});
```

### 3. Integración con Analytics

```javascript
// Trackear uso de filtros
document.addEventListener('filters:applied', (event) => {
  const filters = event.detail;

  // Google Analytics
  gtag('event', 'filter_products', {
    filter_categories: filters.categories,
    filter_price_range: `${filters.priceMin}-${filters.priceMax}`,
    filter_sort: filters.sort,
  });
});
```

## Troubleshooting

### Problemas Comunes

#### 1. Filtros no aparecen

**Causa**: Falta el atributo `data-products` en el contenedor
**Solución**: Asegúrate de que el contenedor tenga `id="products-container"` y `data-products`

```liquid
<div class="product-grid" id="products-container" data-products>
  <!-- productos aquí -->
</div>
```

#### 2. JavaScript no se ejecuta

**Causa**: Conflicto con otros scripts
**Solución**: Verifica que no haya errores en la consola del navegador

#### 3. Productos no se actualizan

**Causa**: Estructura HTML incorrecta
**Solución**: Asegúrate de que los productos tengan la clase `.product-card` y `data-product-id`

#### 4. Scroll infinito no funciona

**Causa**: No hay filtros activos
**Solución**: El scroll infinito solo funciona cuando hay filtros aplicados

### Debugging

```javascript
// Habilitar logs de debug
localStorage.setItem('filters:debug', 'true');

// Ver logs en consola
console.log('Filter state:', window.filterState);
console.log('Filter elements:', window.elements);
```

## Mejores Prácticas

### 1. Performance

- **Lazy loading**: Usa `loading="lazy"` en imágenes
- **Debounce**: El sistema ya incluye debounce automático
- **Paginación**: 50 productos por carga es un buen balance

### 2. UX

- **Loading states**: El sistema muestra indicadores automáticamente
- **Error handling**: Mensajes de error claros y útiles
- **Accessibility**: Usa labels y aria-labels apropiados

### 3. SEO

- **URLs limpias**: Los filtros se mantienen en la URL
- **Meta tags**: Actualiza meta tags cuando cambien los filtros
- **Structured data**: Mantén structured data actualizado

## Ejemplos de Temas

### Tema Minimalista

```liquid
{% filters
  storeId: store.id,
  cssClass: 'minimal-filters',
  title: 'Filtros',
  showPriceRange: true,
  showSortOptions: true
%}

<style>
.minimal-filters {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 1rem;
}

.minimal-filters__title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
}
</style>
```

### Tema Dark

```liquid
{% filters
  storeId: store.id,
  cssClass: 'dark-filters',
  title: 'Filtrar',
  showPriceRange: true,
  showSortOptions: true
%}

<style>
.dark-filters {
  background: #1f2937;
  color: #f9fafb;
  border-radius: 8px;
  padding: 1.5rem;
}

.dark-filters__title {
  color: #f9fafb;
}

.dark-filters__clear-btn {
  background: #dc2626;
  color: white;
}
</style>
```

---

**Última actualización**: Sistema de filtros monolítico restaurado y optimizado (Enero 2025)

El sistema está completamente funcional y listo para usar en cualquier tema de Fasttify.
