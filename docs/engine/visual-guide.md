# Guía Visual del Motor de Renderizado Liquid

## ¿Qué es y cómo funciona?

El motor de renderizado es como un **traductor inteligente** que convierte templates Liquid en páginas web dinámicas para tiendas e-commerce. Piensa en él como el cerebro que une los datos de productos con el diseño visual.

### Flujo Simplificado

```
1. Usuario visita → mitienda.com/products/zapatos
2. Motor resuelve → ¿Qué tienda? ¿Qué página?
3. Carga datos → Información del producto "zapatos"
4. Busca template → product.liquid
5. Combina datos + template → HTML final
6. Agrega CSS/JS → Página completa lista
```

---

## Arquitectura: Los "Trabajadores" del Motor

### **DomainResolver** - El Detective

```typescript
// Su trabajo: "¿De qué tienda es este dominio?"
mitienda.com → Store ID: "abc123"
```

### **DataFetcher** - El Recolector

```typescript
// Su trabajo: "Dame todos los datos que necesitas"
ProductFetcher.getProduct() → Información del producto
CollectionFetcher.getCollection() → Lista de productos
NavigationFetcher.getMenus() → Menús de navegación
```

### **LiquidEngine** - El Actor Principal

```typescript
// Su trabajo: "Convierto código Liquid en HTML"
{{ product.name }} → "Zapatos Nike Air Max"
{% if product.available %} → <button>Comprar</button>
```

### **AssetCollector** - El Estilista

```typescript
// Su trabajo: "Reúno todos los CSS y JS"
{% style %} → Combina en un solo archivo CSS
{% javascript %} → Combina en un solo archivo JS
```

---

## Objetos Liquid: Tus Herramientas Básicas

### `shop` - Información de la Tienda

```liquid
<!-- Lo que puedes hacer -->
<h1>{{ shop.name }}</h1>                    <!-- Mi Tienda Genial -->
<img src="{{ shop.logo | image_url: '200x' }}"> <!-- Logo optimizado -->
<p>{{ shop.description }}</p>               <!-- Descripción SEO -->
<span>{{ shop.currency }}</span>            <!-- COP -->

<!-- Ejemplo real -->
<header class="site-header">
  <div class="logo">
    <a href="{{ shop.url }}">
      <img src="{{ shop.logo | image_url: '150x' }}" alt="{{ shop.name }}">
    </a>
  </div>
  <div class="contact">
    {% if shop.email %}
      <a href="mailto:{{ shop.email }}">{{ shop.email }}</a>
    {% endif %}
  </div>
</header>
```

### `product` - El Corazón del E-commerce

```liquid
<!-- Información básica -->
{{ product.name }}           <!-- Nombre del producto -->
{{ product.price | money }}  <!-- $125,000 (formateado) -->
{{ product.description }}    <!-- Descripción HTML -->
{{ product.url }}           <!-- /products/mi-producto -->

<!-- Imágenes -->
{% for image in product.images %}
  <img src="{{ image.url | image_url: '500x' }}" alt="{{ image.alt }}">
{% endfor %}

<!-- Variantes (tallas, colores, etc.) -->
<select name="variant">
  {% for variant in product.variants %}
    <option value="{{ variant.id }}" {% unless variant.available %}disabled{% endunless %}>
      {{ variant.title }} - {{ variant.price | money }}
    </option>
  {% endfor %}
</select>

<!-- Ejemplo real: Tarjeta de producto -->
<div class="product-card">
  <div class="product-image">
    <a href="{{ product.url }}">
      <img src="{{ product.images.first.url | image_url: '300x300' }}"
           alt="{{ product.name }}">
    </a>
    {% if product.compare_at_price > product.price %}
      <span class="sale-badge">¡OFERTA!</span>
    {% endif %}
  </div>

  <div class="product-info">
    <h3>{{ product.name }}</h3>
    <div class="price">
      <span class="current">{{ product.price | money }}</span>
      {% if product.compare_at_price > product.price %}
        <span class="original">{{ product.compare_at_price | money }}</span>
      {% endif %}
    </div>
  </div>
</div>
```

### `collection` - Grupos de Productos

```liquid
<!-- Lo básico -->
{{ collection.title }}       <!-- "Zapatos Deportivos" -->
{{ collection.description }} <!-- Descripción de la colección -->
{{ collection.url }}        <!-- /collections/zapatos-deportivos -->

<!-- Productos de la colección -->
{% for product in collection.products %}
  {% render 'product-card', product: product %}
{% endfor %}

<!-- Ejemplo real: Página de colección -->
<div class="collection-page">
  <div class="collection-header">
    {% if collection.image %}
      <img src="{{ collection.image | image_url: '1200x400' }}" alt="{{ collection.title }}">
    {% endif %}
    <h1>{{ collection.title }}</h1>
    <p>{{ collection.description }}</p>
  </div>

  <!-- SÚPER IMPORTANTE: Paginación -->
  {% paginate collection.products by 12 %}
    <div class="product-grid">
      {% for product in collection.products %}
        {% render 'product-card', product: product %}
      {% endfor %}
    </div>

    <!-- Controles automáticos de página -->
    {{ collection | default_pagination }}
  {% endpaginate %}
</div>
```

---

## Tags Mágicos: Las Etiquetas que Hacen la Magia

### `{% paginate %}` - El Más Importante

**¿Por qué es tan importante?** Porque NUNCA carga todos los productos de una vez. Solo los de la página actual.

```liquid
<!-- Sintaxis básica -->
{% paginate collection.products by 12 %}
  <!-- Aquí van tus productos -->
  {% for product in collection.products %}
    <div class="product">{{ product.name }}</div>
  {% endfor %}

  <!-- Controles de navegación automáticos -->
  {{ collection | default_pagination }}
{% endpaginate %}

<!-- Ejemplo avanzado -->
{% paginate collection.products by 24 %}
  <div class="collection-toolbar">
    <span class="results">
      Mostrando {{ collection.products.size }} de muchos productos
    </span>
  </div>

  <div class="product-grid">
    {% for product in collection.products %}
      {% render 'product-card', product: product %}
    {% else %}
      <p>No hay productos en esta colección</p>
    {% endfor %}
  </div>

  {% if paginate.pages > 1 %}
    <nav class="pagination">
      {{ collection | default_pagination }}
    </nav>
  {% endif %}
{% endpaginate %}
```

### `{% render %}` - Componentización

**Para qué sirve:** Reutilizar código. Como copiar y pegar, pero inteligente.

```liquid
<!-- Crear snippet: snippets/product-card.liquid -->
<div class="product-card">
  <img src="{{ card_product.featured_image | image_url: '300x' }}">
  <h3>{{ card_product.name }}</h3>
  <p>{{ card_product.price | money }}</p>
  {% if show_vendor %}
    <span class="vendor">{{ card_product.vendor }}</span>
  {% endif %}
</div>

<!-- Usar en cualquier lugar -->
{% render 'product-card', card_product: product %}
{% render 'product-card', card_product: product, show_vendor: true %}

<!-- Ejemplo real: Lista de productos -->
<div class="featured-products">
  <h2>Productos Destacados</h2>
  <div class="product-grid">
    {% for product in collections.featured.products limit: 8 %}
      {% render 'product-card', card_product: product %}
    {% endfor %}
  </div>
</div>
```

### `{% schema %}` - Configuración Visual

**Para qué sirve:** Crear opciones que se pueden cambiar desde un editor visual.

```liquid
<!-- En una sección: sections/banner.liquid -->
<div class="banner" style="background: {{ section.settings.bg_color }};">
  <h2 style="color: {{ section.settings.text_color }};">
    {{ section.settings.title }}
  </h2>
  <p>{{ section.settings.subtitle }}</p>

  {% if section.settings.show_button %}
    <a href="{{ section.settings.button_url }}" class="btn">
      {{ section.settings.button_text }}
    </a>
  {% endif %}
</div>

{% schema %}
{
  "name": "Banner Personalizable",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Título del Banner",
      "default": "¡Bienvenido!"
    },
    {
      "type": "textarea",
      "id": "subtitle",
      "label": "Subtítulo"
    },
    {
      "type": "color",
      "id": "bg_color",
      "label": "Color de Fondo",
      "default": "#f0f0f0"
    },
    {
      "type": "color",
      "id": "text_color",
      "label": "Color del Texto",
      "default": "#333333"
    },
    {
      "type": "checkbox",
      "id": "show_button",
      "label": "Mostrar Botón",
      "default": true
    },
    {
      "type": "url",
      "id": "button_url",
      "label": "Enlace del Botón"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Texto del Botón",
      "default": "Ver Productos"
    }
  ]
}
{% endschema %}
```

### `{% form %}` - Formularios Inteligentes

**Para qué sirve:** Crear formularios que saben exactamente dónde enviar los datos.

```liquid
<!-- Agregar al carrito -->
{% form 'product', product %}
  <!-- El motor automáticamente: -->
  <!-- action="/cart/add" method="post" -->

  <select name="id">
    {% for variant in product.variants %}
      <option value="{{ variant.id }}">{{ variant.title }}</option>
    {% endfor %}
  </select>

  <input type="number" name="quantity" value="1" min="1">
  <button type="submit">Agregar al Carrito</button>
{% endform %}

<!-- Contacto -->
{% form 'contact' %}
  <!-- El motor automáticamente: -->
  <!-- action="/contact" method="post" -->

  <input type="text" name="contact[name]" placeholder="Tu nombre" required>
  <input type="email" name="contact[email]" placeholder="Tu email" required>
  <textarea name="contact[message]" placeholder="Tu mensaje" required></textarea>
  <button type="submit">Enviar</button>
{% endform %}

<!-- Newsletter -->
{% form 'newsletter', class: 'newsletter-form' %}
  <input type="email" name="contact[email]" placeholder="Tu email">
  <button type="submit">Suscribirse</button>
{% endform %}
```

### `{% style %}` y `{% javascript %}` - CSS y JS Dinámico

**Para qué sirve:** Crear estilos y scripts que cambian según la configuración.

```liquid
<!-- CSS dinámico -->
{% style %}
  .banner-{{ section.id }} {
    background-color: {{ section.settings.bg_color }};
    padding: {{ section.settings.padding | default: 20 }}px;
    text-align: {{ section.settings.text_align | default: 'center' }};
  }

  .banner-{{ section.id }} h2 {
    color: {{ section.settings.text_color }};
    font-size: {{ section.settings.title_size | default: 32 }}px;
  }

  @media (max-width: 768px) {
    .banner-{{ section.id }} {
      padding: {{ section.settings.padding | default: 20 | divided_by: 2 }}px;
    }
  }
{% endstyle %}

<!-- JavaScript dinámico -->
{% javascript %}
  document.addEventListener('DOMContentLoaded', function() {
    const banner = document.querySelector('.banner-{{ section.id }}');

    // Configuración desde schema
    const autoSlide = {{ section.settings.auto_slide | default: false }};
    const slideInterval = {{ section.settings.slide_interval | default: 3000 }};

    if (autoSlide && banner) {
      setInterval(function() {
        banner.classList.toggle('highlight');
      }, slideInterval);
    }

    // Event listeners específicos
    banner.addEventListener('click', function() {
      console.log('Banner clicked!');
    });
  });
{% endjavascript %}
```

---

## Filtros: Transformadores de Datos

### Filtros de Dinero

```liquid
<!-- Básicos -->
{{ 125000 | money }}                 <!-- $125,000 -->
{{ 125000 | money_without_currency }} <!-- 125,000.00 -->
{{ 125000 | money_without_decimal }}  <!-- $125,000 -->

<!-- Comparación de precios -->
<div class="price-comparison">
  <span class="current">{{ product.price | money }}</span>
  {% if product.compare_at_price > product.price %}
    <span class="original">{{ product.compare_at_price | money }}</span>
    <span class="savings">
      Ahorras {{ product.compare_at_price | minus: product.price | money }}
    </span>
  {% endif %}
</div>
```

### Filtros de Imágenes

```liquid
<!-- Tamaños específicos -->
{{ image.url | image_url: '300x300' }}     <!-- 300x300 exacto -->
{{ image.url | image_url: '500x' }}        <!-- 500px ancho, alto proporcional -->
{{ image.url | image_url: 'x400' }}        <!-- 400px alto, ancho proporcional -->

<!-- Con crop -->
{{ image.url | image_url: '400x300_crop_center' }}  <!-- Recorta desde el centro -->

<!-- Galería responsiva -->
<div class="product-gallery">
  {% for image in product.images %}
    <picture>
      <source media="(max-width: 480px)"
              srcset="{{ image.url | image_url: '480x' }}">
      <source media="(max-width: 768px)"
              srcset="{{ image.url | image_url: '768x' }}">
      <img src="{{ image.url | image_url: '1200x' }}"
           alt="{{ image.alt | default: product.name }}">
    </picture>
  {% endfor %}
</div>
```

### Filtros de Texto

```liquid
<!-- Básicos -->
{{ "¡Mi Súper Producto!" | handleize }}           <!-- mi-super-producto -->
{{ product.description | truncate: 150 }}         <!-- Corta a 150 caracteres -->
{{ product.vendor | default: 'Sin marca' }}       <!-- Valor por defecto -->

<!-- SEO-friendly URLs -->
<a href="/products/{{ product.name | handleize }}">
  {{ product.name }}
</a>

<!-- Descripciones con fallback -->
<p class="product-description">
  {{ product.description | truncate: 200, '... <a href="' | append: product.url | append: '">Ver más</a>' }}
</p>
```

### Filtros de HTML

```liquid
<!-- Assets automáticos -->
{{ 'theme.css' | asset_url | stylesheet_tag }}
<!-- Resultado: <link rel="stylesheet" href="/api/stores/abc123/assets/theme.css"> -->

{{ 'theme.js' | asset_url | script_tag }}
<!-- Resultado: <script src="/api/stores/abc123/assets/theme.js"></script> -->

<!-- Enlaces inteligentes -->
{{ 'Ver Producto' | link_to: product.url, 'class="btn btn-primary"' }}
<!-- Resultado: <a href="/products/mi-producto" class="btn btn-primary">Ver Producto</a> -->

<!-- Cargar assets condicionalmente -->
{% if section.settings.load_custom_css %}
  {{ 'section-custom.css' | asset_url | stylesheet_tag }}
{% endif %}
```

---

## Sistema de Carrito

### URLs del Carrito

```liquid
<!-- Enlaces básicos -->
<a href="{{ cart_url }}">Ver Carrito ({{ cart.item_count }})</a>
<a href="{{ cart_add_url }}">Agregar</a>

<!-- Estados del carrito -->
{% if cart.item_count > 0 %}
  <div class="cart-summary">
    <span class="count">{{ cart.item_count }} productos</span>
    <span class="total">{{ cart.total_price | money }}</span>
  </div>
{% else %}
  <div class="cart-empty">Tu carrito está vacío</div>
{% endif %}
```

### Manipulación de Items

```liquid
<!-- Contar items de una variante -->
{% assign variant_count = cart | item_count_for_variant: variant.id %}
{% if variant_count > 0 %}
  <span class="in-cart">Ya tienes {{ variant_count }} en el carrito</span>
{% endif %}

<!-- Cambiar cantidades -->
<form action="{{ item.key | cart_change_url }}" method="post">
  <input type="number" name="quantity" value="{{ item.quantity }}" min="0">
  <button type="submit">Actualizar</button>
</form>

<!-- Remover completamente -->
<a href="{{ item.key | remove_from_cart_url }}" class="remove-item">
  Eliminar
</a>
```

---

## Navegación y Menús

### LinkLists (Menús)

```liquid
<!-- Menú principal -->
<nav class="main-navigation">
  {% for link in linklists.main-menu.links %}
    <a href="{{ link.url }}"
       class="nav-link{% if link.active %} active{% endif %}">
      {{ link.title }}
    </a>
  {% endfor %}
</nav>

<!-- Menú del footer -->
<footer class="site-footer">
  {% if linklists.footer-menu %}
    <div class="footer-links">
      {% for link in linklists.footer-menu.links %}
        <a href="{{ link.url }}">{{ link.title }}</a>
      {% endfor %}
    </div>
  {% endif %}
</footer>

<!-- Menú con detección de página activa -->
<nav class="breadcrumbs">
  <a href="{{ shop.url }}">Inicio</a>
  {% for link in linklists.main-menu.links %}
    {% if link.active %}
      <span class="current">{{ link.title }}</span>
      {% break %}
    {% endif %}
  {% endfor %}
</nav>
```

---

## Performance y Optimización

### Mejores Prácticas

```liquid
<!-- SIEMPRE usar paginación -->
{% paginate collection.products by 24 %}
  <!-- contenido -->
{% endpaginate %}

<!-- Lazy loading para imágenes -->
<img src="{{ image | image_url: '300x' }}"
     loading="lazy"
     alt="{{ product.name }}">

<!-- Snippets para código repetitivo -->
{% render 'product-card', product: product %}

<!-- EVITAR loops grandes sin paginación -->
{% for product in collection.products %}  <!-- ¡NO! -->
  <!-- podría cargar 1000+ productos -->
{% endfor %}

<!-- Limitar manualmente si no usas paginación -->
{% for product in collection.products limit: 12 %}
  {% render 'product-card', product: product %}
{% endfor %}
```

### Debug y Troubleshooting

```liquid
<!-- Ver datos en formato JSON -->
<pre>{{ product | json }}</pre>
<pre>{{ collection | json }}</pre>
<pre>{{ cart | json }}</pre>

<!-- Verificar variables -->
{% if product %}
  Producto existe: {{ product.name }}
{% else %}
  No hay producto
{% endif %}

<!-- Contar elementos -->
<p>Total de productos: {{ collection.products.size }}</p>
<p>Imágenes disponibles: {{ product.images.size }}</p>

<!-- Debugging de schema -->
<pre>{{ section.settings | json }}</pre>
```

---

## Ejemplos Prácticos Completos

### Template de Homepage

```liquid
<!-- templates/index.liquid -->
<div class="homepage">
  <!-- Hero Banner -->
  {% section 'hero-banner' %}

  <!-- Productos Destacados -->
  <section class="featured-products">
    <div class="container">
      <h2>Productos Destacados</h2>

      {% if collections.featured-products.products.size > 0 %}
        <div class="product-grid">
          {% for product in collections.featured-products.products limit: 8 %}
            {% render 'product-card',
               product: product,
               show_vendor: true,
               image_size: '300x300' %}
          {% endfor %}
        </div>

        <div class="view-all">
          <a href="{{ collections.featured-products.url }}" class="btn">
            Ver Todos los Productos
          </a>
        </div>
      {% else %}
        <p>No hay productos destacados configurados.</p>
      {% endif %}
    </div>
  </section>

  <!-- Colecciones -->
  <section class="featured-collections">
    <div class="container">
      <h2>Nuestras Colecciones</h2>
      <div class="collection-grid">
        {% for collection in collections limit: 6 %}
          {% unless collection.handle == 'featured-products' %}
            <div class="collection-card">
              <a href="{{ collection.url }}">
                {% if collection.image %}
                  <img src="{{ collection.image | image_url: '400x300' }}"
                       alt="{{ collection.title }}">
                {% endif %}
                <h3>{{ collection.title }}</h3>
                <p>{{ collection.products.size }} productos</p>
              </a>
            </div>
          {% endunless %}
        {% endfor %}
      </div>
    </div>
  </section>
</div>
```

### Template de Colección Avanzado

```liquid
<!-- templates/collection.liquid -->
<div class="collection-page">
  <!-- Header -->
  <div class="collection-header">
    {% if collection.image %}
      <div class="collection-banner">
        <img src="{{ collection.image | image_url: '1200x400' }}"
             alt="{{ collection.title }}">
      </div>
    {% endif %}

    <div class="collection-info">
      <nav class="breadcrumbs">
        <a href="{{ shop.url }}">Inicio</a>
        <span>{{ collection.title }}</span>
      </nav>

      <h1>{{ collection.title }}</h1>
      {% if collection.description %}
        <div class="description">{{ collection.description }}</div>
      {% endif %}
    </div>
  </div>

  <!-- Toolbar -->
  <div class="collection-toolbar">
    <div class="results-info">
      {% paginate collection.products by 24 %}
        Mostrando {{ collection.products.size }} productos
      {% endpaginate %}
    </div>

    <!-- Aquí irían filtros de precio, marca, etc. -->
  </div>

  <!-- Productos -->
  {% paginate collection.products by 24 %}
    {% if collection.products.size > 0 %}
      <div class="product-grid">
        {% for product in collection.products %}
          {% render 'product-card',
             product: product,
             show_vendor: true,
             show_compare_price: true %}
        {% endfor %}
      </div>

      <!-- Paginación -->
      {% if paginate.pages > 1 %}
        <nav class="pagination">
          {{ collection | default_pagination }}
        </nav>
      {% endif %}
    {% else %}
      <div class="empty-collection">
        <h3>No hay productos en esta colección</h3>
        <p>Vuelve pronto para ver nuevos productos.</p>
        <a href="{{ shop.url }}" class="btn">Explorar otras colecciones</a>
      </div>
    {% endif %}
  {% endpaginate %}
</div>
```

---

## Solución de Problemas Comunes

### "Template not found"

```bash
# Verificar:
1. ¿El archivo existe en S3?
2. ¿El nombre está bien escrito? (case-sensitive)
3. ¿Tienes permisos correctos?
4. ¿Está en la carpeta correcta? (templates/, sections/, snippets/)
```

### "Variable undefined"

```liquid
<!-- Problemático -->
{{ variable_que_no_existe }}

<!-- Seguro -->
{{ variable_que_no_existe | default: 'Valor por defecto' }}

<!-- Con verificación -->
{% if variable_que_no_existe %}
  {{ variable_que_no_existe }}
{% else %}
  Contenido alternativo
{% endif %}
```

### "Schema JSON error"

```liquid
<!-- Incorrecto -->
{% schema %}
{
  "name": "Mi Sección",  // ← coma al final
}
{% endschema %}

<!-- Correcto -->
{% schema %}
{
  "name": "Mi Sección"
}
{% endschema %}
```

### "Performance lenta"

```liquid
<!-- Evitar -->
{% for product in collection.products %}  <!-- Carga TODOS -->
{% for collection in collections %}       <!-- Anidación pesada -->

<!-- Mejor -->
{% paginate collection.products by 24 %}  <!-- Solo 24 -->
{% for collection in collections limit: 6 %} <!-- Máximo 6 -->
```

---
