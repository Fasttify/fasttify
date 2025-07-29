# Sistema de Filtros Automático

## 📋 Descripción General

El sistema de filtros automático permite a los desarrolladores de temas implementar filtros de productos sin configuración manual. El sistema genera automáticamente las opciones de filtrado basándose en los datos reales de los productos y proporciona una experiencia de usuario tipo Shopify.

## 🚀 Uso Básico

### 1. Tag Liquid Principal

```liquid
{% filters %}
```

Este tag genera automáticamente:

- ✅ Filtros de precio (rango dinámico)
- ✅ Filtros de disponibilidad (en stock)
- ✅ Filtros de ordenamiento (nombre, precio, fecha)
- ✅ Filtros de categorías (extraídas de productos)
- ✅ Paginación híbrida (Liquid + JavaScript)

### 2. Opciones Avanzadas

```liquid
{% filters
  style="sidebar"
  maxCategories="10"
  cssClass="my-filters"
  noResultsMessage="No se encontraron productos"
%}
```

## 🎨 Opciones de Configuración

| Opción             | Tipo     | Default                            | Descripción                          |
| ------------------ | -------- | ---------------------------------- | ------------------------------------ |
| `style`            | `string` | `"horizontal"`                     | `"sidebar"` o `"horizontal"`         |
| `maxCategories`    | `number` | `20`                               | Máximo de categorías a mostrar       |
| `maxTags`          | `number` | `20`                               | Máximo de tags a mostrar             |
| `cssClass`         | `string` | `"auto-filters"`                   | Clase CSS personalizada              |
| `productRenderer`  | `string` | `".product-grid"`                  | Selector del contenedor de productos |
| `noResultsMessage` | `string` | `"No se encontraron productos..."` | Mensaje cuando no hay resultados     |
| `loadingMessage`   | `string` | `"Filtrando productos..."`         | Mensaje durante la carga             |

## 🏗️ Estructura del Sistema

### Arquitectura Modular

```
renderer-engine/liquid/tags/filters/
├── javascript-generator.ts (coordinador principal)
├── modules/
│   ├── pagination-handler.ts (paginación)
│   ├── filter-handler.ts (filtros)
│   ├── url-manager.ts (URLs)
│   ├── product-renderer.ts (renderizado)
│   └── ui-manager.ts (interfaz)
```

### Flujo de Datos

1. **Extracción**: `product.json` → `products_per_page`
2. **Generación**: Filtros automáticos basados en datos reales
3. **Renderizado**: HTML + JavaScript optimizado
4. **Interacción**: AJAX con paginación híbrida

## 📱 Implementación en Temas

### 1. Template Básico

```liquid
{% comment %} product-list-view.liquid {% endcomment %}
<div class="products-layout">
  <div class="products-sidebar">
    {% filters style="sidebar" %}
  </div>

  <div class="products-main-content">
    <div class="product-grid">
      {% for product in products %}
        {% render 'product-card', product: product %}
      {% endfor %}
    </div>
  </div>
</div>
```

### 2. Template con Paginación Híbrida

```liquid
{% paginate products %}
  <div class="products-layout">
    <div class="products-sidebar">
      {% filters style="sidebar" %}
    </div>

    <div class="products-main-content">
      <div class="product-grid">
        {% for product in products %}
          {% render 'product-card', product: product %}
        {% endfor %}
      </div>
    </div>
  </div>
{% endpaginate %}
```

## 🎯 Comportamiento del Sistema

### Estados de Paginación

#### Estado A: Sin Filtros (Paginación Liquid)

```
URL: /products
Paginación: Liquid ({{ paginate.next.url }})
Comportamiento: Normal de Liquid
```

#### Estado B: Con Filtros (Paginación JavaScript)

```
URL: /products?sort_by=name&token=abc123
Paginación: JavaScript (botones Anterior/Siguiente)
Comportamiento: Shopify-style con tokens
```

### Transición Automática

1. **Sin filtros**: Usa paginación de Liquid
2. **Con filtros**: Usa paginación de JavaScript
3. **Transición**: Cambia automáticamente entre sistemas

## 🔧 Configuración Avanzada

### 1. Personalización de Estilos

```css
/* Estilos para filtros sidebar */
.auto-filters {
  padding: 1rem;
  background: #f8f9fa;
}

.auto-filters .filter-group {
  margin-bottom: 1.5rem;
}

.auto-filters .filter-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Estilos para paginación */
.js-pagination {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.js-pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.js-pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 2. Configuración de Productos por Página

El sistema lee automáticamente el valor de `products_per_page` desde `product.json`:

```json
{
  "sections": {
    "product": {
      "settings": {
        "id": "products_per_page",
        "default": 15
      }
    }
  }
}
```

### 3. Formato de Moneda

El sistema usa automáticamente la función `window.formatMoney()` del tema:

```javascript
// Definido en theme.liquid
window.formatMoney = function (amount) {
  if (typeof amount !== 'number') return 'N/A';

  const locale = window.MONEY_LOCALE;
  const decimalPlaces = window.MONEY_DECIMAL_PLACES;
  const symbol = window.MONEY_SYMBOL;

  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(amount);

  return `${symbol}${formattedAmount}`;
};
```

## 🔄 URLs y Navegación

### Estructura de URLs

```
Sin filtros: /products
Con filtros: /products?sort_by=name&limit=15
Con paginación: /products?sort_by=name&limit=15&token=abc123
```

### Parámetros Soportados

- `price_min`: Precio mínimo
- `price_max`: Precio máximo
- `availability`: `"in_stock"` para productos disponibles
- `sort_by`: Ordenamiento (`name`, `price`, `createdAt`, etc.)
- `category`: Categoría específica
- `featured`: Productos destacados
- `token`: Token de paginación (DynamoDB)
- `limit`: Límite de productos por página

## 🎨 Personalización de Product Cards

### Renderizado Automático

El sistema renderiza automáticamente las tarjetas de productos con:

- ✅ Imágenes múltiples con hover
- ✅ Precios con formato de moneda
- ✅ Badges de descuento
- ✅ Botones de acción
- ✅ Información del producto

### Estructura HTML Generada

```html
<div class="product-card">
  <div class="product-image-wrapper">
    <a href="/products/product-slug" class="product-link">
      <img class="product-image" src="image-url" alt="Product Name" />
    </a>
    <div class="product-badges">
      <span class="product-badge badge-sale">SAVE 20%</span>
    </div>
  </div>

  <div class="product-info">
    <div class="product-vendor">VENDOR</div>
    <h3 class="product-title">Product Name</h3>
    <div class="product-price">
      <span class="price-compare">$100</span>
      <span class="price-current price-sale">$80</span>
    </div>
  </div>
</div>
```

## 🚨 Manejo de Errores

### Estados de Error

1. **Sin productos**: Muestra mensaje personalizable
2. **Error de red**: Muestra error con opción de reintentar
3. **Filtros sin resultados**: Muestra mensaje específico

### Mensajes Personalizables

```liquid
{% filters
  noResultsMessage="No se encontraron productos con estos filtros"
  loadingMessage="Filtrando productos..."
%}
```

## 🔧 API Endpoint

### Estructura de Respuesta

```json
{
  "products": [
    {
      "id": "product-id",
      "name": "Product Name",
      "price": 10000,
      "compareAtPrice": 12000,
      "quantity": 5,
      "category": "ropa",
      "images": "[{\"url\":\"image-url\",\"alt\":\"alt-text\"}]"
    }
  ],
  "pagination": {
    "limit": 15,
    "nextToken": "abc123",
    "hasMore": true,
    "totalResults": 45
  },
  "available_filters": {
    "categories": ["ropa", "accesorios"],
    "price_range": { "min": 1000, "max": 50000 },
    "sort_options": [{ "value": "name", "label": "Nombre A-Z" }]
  }
}
```

## 📝 Ejemplos de Uso

### 1. Filtros Básicos

```liquid
{% comment %} collection.liquid {% endcomment %}
<div class="collection-page">
  <div class="collection-filters">
    {% filters %}
  </div>

  <div class="collection-products">
    <div class="product-grid">
      {% for product in collection.products %}
        {% render 'product-card', product: product %}
      {% endfor %}
    </div>
  </div>
</div>
```

### 2. Filtros con Sidebar

```liquid
{% comment %} products.liquid {% endcomment %}
<div class="products-page">
  <div class="products-sidebar">
    {% filters
      style="sidebar"
      maxCategories="15"
      cssClass="product-filters"
    %}
  </div>

  <div class="products-main">
    <div class="product-grid">
      {% for product in products %}
        {% render 'product-card', product: product %}
      {% endfor %}
    </div>
  </div>
</div>
```

### 3. Filtros con Paginación Personalizada

```liquid
{% paginate products %}
  <div class="products-container">
    <div class="filters-section">
      {% filters
        style="horizontal"
        noResultsMessage="No hay productos que coincidan con tu búsqueda"
      %}
    </div>

    <div class="products-section">
      <div class="product-grid">
        {% for product in products %}
          {% render 'product-card', product: product %}
        {% endfor %}
      </div>
    </div>
  </div>
{% endpaginate %}
```

## 🎯 Mejores Prácticas

### 1. Estructura de CSS

```css
/* Layout principal */
.products-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

/* Sidebar de filtros */
.products-sidebar {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

/* Contenedor de productos */
.products-main-content {
  min-height: 400px;
}

/* Grid de productos */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}
```

### 2. Responsive Design

```css
@media (max-width: 768px) {
  .products-layout {
    grid-template-columns: 1fr;
  }

  .products-sidebar {
    position: static;
    order: 2;
  }

  .products-main-content {
    order: 1;
  }
}
```

### 3. Estados de Loading

```css
.filtering-loading {
  position: relative;
  opacity: 0.6;
  pointer-events: none;
}

.filters-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

## 🔍 Debugging

### Console Logs

El sistema incluye logs detallados para debugging:

```javascript
console.log('Filtros aplicados:', this.currentFilters);
console.log('Productos encontrados:', data.products.length);
console.log('Paginación:', data.pagination);
```

### Verificación de Estado

```javascript
// Verificar si hay filtros activos
console.log('Filtros activos:', this.hasActiveFilters());

// Verificar configuración
console.log('Productos por página:', this.productsPerPage);
console.log('Selector de grid:', this.productGridSelector);
```

## 📚 Recursos Adicionales

- **API Documentation**: `/api/stores/{storeId}/products/filter`
- **Liquid Filters**: `renderer-engine/liquid/filters/`
- **JavaScript Modules**: `renderer-engine/liquid/tags/filters/modules/`
- **Template Examples**: `template/snippets/product-list-view.liquid`

---

**Nota**: Este sistema está diseñado para ser completamente automático y no requiere configuración manual. Los filtros se generan dinámicamente basándose en los datos reales de los productos de cada tienda.
