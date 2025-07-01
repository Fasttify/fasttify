# Acceso Específico a Datos por Handle en Templates Liquid

La nueva funcionalidad permite acceder a datos específicos (productos, colecciones) por su handle directamente en los templates Liquid, similar a como funciona Shopify.

## Funcionalidades Implementadas

### 1. **Detección Automática de Sintaxis**

El sistema detecta automáticamente cuando usas:

- `{{ collections['mi-coleccion'] }}`
- `{{ collections.mi-coleccion }}`
- `{{ products['mi-producto'] }}`
- `{{ collections.featured.products }}`

### 2. **Carga Inteligente de Datos**

- Solo carga los datos que realmente necesitas
- Cache automático para evitar cargas duplicadas
- Carga en paralelo para máximo rendimiento

### 3. **Acceso Dinámico**

- Objetos proxy que permiten acceso estilo Shopify
- Compatibilidad total con sintaxis de Liquid existente

## Guía de Uso

### Acceso a Colecciones Específicas

```liquid
<!-- Acceso directo por handle -->
{% assign collection = collections['featured-products'] %}

{{ collection.title }}
{{ collection.description }}

<!-- Obtener productos de una colección -->
{% for product in collections['featured-products'].products %}
  <h3>{{ product.title }}</h3>
  <p>{{ product.price }}</p>
{% endfor %}

<!-- Usando filtros -->
{{ 'featured-products' | collection_by_handle }}
{{ 'featured-products' | products_from_collection }}
```

### Acceso a Productos Específicos

```liquid
<!-- Acceso directo por handle -->
{% assign product = products['mi-producto-especial'] %}
{{ product.title }}
{{ product.price }}

<!-- Usando filtros -->
{{ 'mi-producto-especial' | product_by_handle }}
```

### Productos Relacionados

```liquid
<!-- En una página de producto -->
{% if related_products %}
  <h3>Productos Relacionados</h3>
  {% for product in related_products limit: 4 %}
    <div class="related-product">
      <h4>{{ product.title }}</h4>
      <p>{{ product.price }}</p>
    </div>
  {% endfor %}
{% endif %}
```

## Filtros Disponibles

### Filtros de Acceso por Handle

- `collection_by_handle` - Obtiene una colección por handle
- `product_by_handle` - Obtiene un producto por handle
- `products_from_collection` - Obtiene productos de una colección

### Filtros de Utilidad

- `products_to_json` - Convierte productos a JSON para JavaScript
- `limit` - Limita el número de elementos en un array

## Ejemplos Prácticos

### 1. Homepage con Colecciones Destacadas

```liquid
<!-- templates/index.liquid -->
<div class="featured-collections">
  {% assign featured = collections['featured'] %}
  {% if featured %}
    <h2>{{ featured.title }}</h2>
    <div class="products-grid">
      {% for product in featured.products limit: 8 %}
        <div class="product-card">
          <img src="{{ product.featured_image }}" alt="{{ product.title }}">
          <h3>{{ product.title }}</h3>
          <p>{{ product.price }}</p>
        </div>
      {% endfor %}
    </div>
  {% endif %}
</div>
```

### 3. Página de Producto con Relacionados

```liquid
<!-- templates/product.liquid -->
<div class="product-details">
  <h1>{{ product.title }}</h1>
  <p>{{ product.price }}</p>
  <div>{{ product.description }}</div>
</div>

{% if related_products and related_products.size > 0 %}
  <div class="related-products">
    <h3>También te podría interesar</h3>
    <div class="products-grid">
      {% for related in related_products limit: 4 %}
        <div class="product-card">
          <a href="{{ related.url }}">
            <img src="{{ related.featured_image }}" alt="{{ related.title }}">
            <h4>{{ related.title }}</h4>
            <p>{{ related.price }}</p>
          </a>
        </div>
      {% endfor %}
    </div>
  </div>
{% endif %}
```

### 4. JavaScript con Datos de Productos

```liquid
<!-- sections/product-recommendations.liquid -->
<div id="product-recommendations" data-products="{{ collections['recommended'].products | products_to_json | escape }}">
  <!-- Los productos se cargarán dinámicamente con JavaScript -->
</div>

<script>
  const productsData = JSON.parse(document.getElementById('product-recommendations').dataset.products);
  // Usar productsData en tu JavaScript
</script>
```

## Ventajas del Nuevo Sistema

### 1. **Performance Optimizada**

- Detección automática de dependencias
- Carga solo los datos necesarios
- Cache inteligente

### 2. **Sintaxis Familiar**

- Compatible con sintaxis de Shopify
- Fácil migración de themes existentes
- IntelliSense mejorado

### 3. **Flexibilidad**

- Acceso por handle, ID o slug
- Filtros personalizables
- Extensible para nuevos tipos de datos

### 4. **Debugging Amigable**

- Logs detallados en desarrollo
- Manejo graceful de errores
- Fallbacks automáticos

## Debugging y Desarrollo

En modo desarrollo, el sistema registra:

- Qué handles se detectaron en los templates
- Qué datos se cargaron para cada handle
- Tiempo de carga y resultados de cache

```bash
[Renderer:TemplateAnalyzer] Template analysis for templates/index.json:
  requiredData: ['specific_collection', 'products_by_collection']
  handles: ['featured', 'new-arrivals']
```

## Mejores Prácticas

### 1. **Usa Handles Descriptivos**

```liquid
<!-- ✅ Bueno -->
{{ collections['featured-products'] }}
{{ collections['summer-sale'] }}

<!-- ❌ Evitar -->
{{ collections['col1'] }}
{{ collections['temp'] }}
```

### 2. **Verifica Existencia**

```liquid
<!-- ✅ Siempre verificar -->
{% assign featured = collections['featured'] %}
{% if featured and featured.products.size > 0 %}
  <!-- Renderizar productos -->
{% endif %}
```

### 3. **Usa Límites Apropiados**

```liquid
<!-- ✅ Limitar para performance -->
{% for product in collections['featured'].products limit: 8 %}
  <!-- Producto -->
{% endfor %}
```

### 4. **Combina con Cache**

```liquid
<!-- ✅ Para datos que cambian poco -->
{% assign main_menu = linklists['main-menu'] %}
{% comment %} Este menú se cachea automáticamente {% endcomment %}
```

¡Esta funcionalidad te permite crear templates Liquid más dinámicos y eficientes, manteniendo la sintaxis familiar de Shopify pero con el rendimiento optimizado de nuestro motor personalizado!
