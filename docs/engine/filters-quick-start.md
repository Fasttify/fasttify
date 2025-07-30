# Guía Rápida: Sistema de Filtros

## Implementación en 5 Minutos

### 1. Agregar el Tag de Filtros

En tu template `product-list-view.liquid`:

```liquid
<div class="product-page">
  {% filters
    storeId: store.id,
    cssClass: 'product-filters',
    title: 'Filtrar Productos'
  %}

  <div class="product-grid" id="products-container" data-products>
    {% for product in products %}
      <div class="product-card" data-product-id="{{ product.id }}">
        <img src="{{ product.featured_image | image_url: width: 300 }}">
        <h3>{{ product.title }}</h3>
        <p>{{ product.price | money }}</p>
      </div>
    {% endfor %}
  </div>
</div>
```

### 2. CSS Básico

```css
.product-page {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.product-filters {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}
```

### 3. ¡Listo!

El sistema automáticamente:

- ✅ Genera filtros por categorías, tags, vendors
- ✅ Agrega filtro de precio
- ✅ Incluye opciones de ordenamiento
- ✅ Implementa scroll infinito
- ✅ Mantiene filtros en la URL
- ✅ Oculta paginación cuando hay filtros

## Configuración Avanzada

### Parámetros Principales

```liquid
{% filters
  storeId: store.id,                    # Requerido
  cssClass: 'my-filters',               # Clase CSS
  title: 'Filtrar',                     # Título
  showPriceRange: true,                 # Filtro de precio
  showSortOptions: true,                # Ordenamiento
  showClearButton: true,                # Botón limpiar
  infiniteScroll: true,                 # Scroll infinito
  maxCategories: 10,                    # Límite categorías
  maxTags: 15,                          # Límite tags
  debounceDelay: 300                    # Delay debounce
%}
```

### Estilos Personalizados

```css
/* Tema oscuro */
.dark-filters {
  background: #1f2937;
  color: #f9fafb;
}

/* Tema minimalista */
.minimal-filters {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .product-page {
    grid-template-columns: 1fr;
  }
}
```

## Ejemplos Completos

### Tema Básico

```liquid
{% comment %} product-list-view.liquid {% endcomment %}

<div class="product-page">
  {% filters
    storeId: store.id,
    cssClass: 'product-filters',
    title: 'Filtrar Productos',
    showPriceRange: true,
    showSortOptions: true,
    showClearButton: true,
    infiniteScroll: true
  %}

  <div class="products-container">
    <div class="products-header">
      <h1>{{ collection.title | default: 'Todos los Productos' }}</h1>
      <p>{{ products.size }} productos</p>
    </div>

    <div class="product-grid" id="products-container" data-products>
      {% for product in products %}
        <div class="product-card" data-product-id="{{ product.id }}">
          <div class="product-image">
            <a href="{{ product.url }}">
              <img src="{{ product.featured_image | image_url: width: 300 }}" alt="{{ product.title }}">
            </a>
          </div>

          <div class="product-info">
            <h3>{{ product.title }}</h3>
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
  </div>
</div>

<style>
.product-page {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.product-filters {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

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

@media (max-width: 768px) {
  .product-page {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
}
</style>
```

### Tema Avanzado

```liquid
{% comment %} collection.liquid {% endcomment %}

<div class="collection-page">
  {% filters
    storeId: store.id,
    cssClass: 'collection-filters',
    title: 'Filtrar ' | append: collection.title,
    showPriceRange: true,
    showSortOptions: true,
    showClearButton: true,
    showCounts: true,
    maxCategories: 20,
    maxTags: 25,
    maxVendors: 15,
    maxCollections: 10,
    infiniteScroll: true,
    scrollThreshold: 200,
    debounceDelay: 500,
    loadingMessage: 'Buscando productos...',
    noResultsMessage: 'No encontramos productos con esos filtros',
    errorMessage: 'Hubo un error al cargar los productos',
    clearFiltersText: 'Limpiar todos los filtros'
  %}

  <div class="collection-content">
    <div class="collection-header">
      <h1>{{ collection.title }}</h1>
      <p>{{ collection.description }}</p>
      <div class="collection-meta">
        <span>{{ collection.products_count }} productos</span>
        {% if collection.image %}
          <img src="{{ collection.image | image_url: width: 100 }}" alt="{{ collection.title }}">
        {% endif %}
      </div>
    </div>

    <div class="products-wrapper">
      <div class="product-grid" id="products-container" data-products>
        {% for product in collection.products %}
          <div class="product-card" data-product-id="{{ product.id }}">
            <div class="product-image-wrapper">
              <a href="{{ product.url }}" class="product-link">
                <img
                  class="product-image"
                  src="{{ product.featured_image | image_url: width: 300 }}"
                  alt="{{ product.title }}"
                  loading="lazy"
                >
              </a>

              {% if product.compare_at_price and product.compare_at_price > product.price %}
                <div class="product-badge">
                  <span class="badge-sale">
                    -{{ product.compare_at_price | minus: product.price | times: 100.0 | divided_by: product.compare_at_price | round }}%
                  </span>
                </div>
              {% endif %}
            </div>

            <div class="product-info">
              <div class="product-vendor">{{ product.vendor }}</div>
              <h3 class="product-title">
                <a href="{{ product.url }}">{{ product.title }}</a>
              </h3>

              <div class="product-price">
                <span class="price-current">{{ product.price | money }}</span>
                {% if product.compare_at_price and product.compare_at_price > product.price %}
                  <span class="price-compare">{{ product.compare_at_price | money }}</span>
                {% endif %}
              </div>

              <div class="product-actions">
                <button
                  class="add-to-cart-btn"
                  onclick="addProductToCart('{{ product.id }}', 1)"
                >
                  Agregar al Carrito
                </button>

                <button
                  class="quick-view-btn"
                  onclick="quickView('{{ product.id }}')"
                >
                  Vista Rápida
                </button>
              </div>
            </div>
          </div>
        {% endfor %}
      </div>
    </div>
  </div>
</div>

<style>
.collection-page {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 3rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.collection-filters {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.collection-filters__title {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.collection-header {
  margin-bottom: 3rem;
  text-align: center;
}

.collection-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1f2937;
}

.collection-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  color: #6b7280;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.product-image-wrapper {
  position: relative;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.badge-sale {
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.product-info {
  padding: 1.5rem;
}

.product-vendor {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.product-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.product-title a {
  color: #1f2937;
  text-decoration: none;
}

.product-title a:hover {
  color: #3b82f6;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.price-current {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.price-compare {
  font-size: 1rem;
  color: #6b7280;
  text-decoration: line-through;
}

.product-actions {
  display: flex;
  gap: 0.75rem;
}

.add-to-cart-btn,
.quick-view-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-to-cart-btn {
  background: #3b82f6;
  color: white;
}

.add-to-cart-btn:hover {
  background: #2563eb;
}

.quick-view-btn {
  background: #f3f4f6;
  color: #374151;
}

.quick-view-btn:hover {
  background: #e5e7eb;
}

@media (max-width: 1024px) {
  .collection-page {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .collection-filters {
    position: static;
    order: -1;
  }
}

@media (max-width: 768px) {
  .collection-page {
    padding: 1rem;
  }

  .collection-header h1 {
    font-size: 2rem;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}
</style>
```

## Troubleshooting Rápido

### Problema: Filtros no aparecen

**Solución**: Verifica que el contenedor tenga `id="products-container"` y `data-products`

### Problema: JavaScript no funciona

**Solución**: Revisa la consola del navegador para errores

### Problema: Productos no se actualizan

**Solución**: Asegúrate de que los productos tengan `data-product-id`

### Problema: Scroll infinito no funciona

**Solución**: Solo funciona cuando hay filtros aplicados

## Recursos Adicionales

- [Documentación Completa](./filters-system.md) - Guía detallada del sistema
- [API de Filtros](./filters-system.md#api-del-backend) - Endpoints disponibles
- [Personalización Avanzada](./filters-system.md#personalización-avanzada) - Eventos y estilos
- [Troubleshooting](./filters-system.md#troubleshooting) - Solución de problemas

---

**¡Listo para usar!** El sistema de filtros está completamente funcional y optimizado para cualquier tema de Fasttify.
