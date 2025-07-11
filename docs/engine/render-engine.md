# Motor de Renderizado Liquid - Guía Completa del Desarrollador

## Índice

1. [Visión General](#visión-general)
2. [Arquitectura del Motor](#arquitectura-del-motor)
3. [Objetos Globales Disponibles](#objetos-globales-disponibles)
4. [Etiquetas Personalizadas (Tags)](#etiquetas-personalizadas-tags)
5. [Filtros Disponibles](#filtros-disponibles)
6. [Sistema de Navegación](#sistema-de-navegación)
7. [Gestión de Assets](#gestión-de-assets)
8. [Caché y Performance](#caché-y-performance)
9. [Ejemplos Prácticos](#ejemplos-prácticos)
10. [Resolución de Problemas](#resolución-de-problemas)

---

## Visión General

El motor de renderizado utiliza **Liquid** como lenguaje de plantillas, extendido con funcionalidades específicas para e-commerce. El sistema está diseñado con una arquitectura de **separación de responsabilidades**:

- **Fetchers**: Obtienen y transforman los datos
- **Templates**: Se encargan únicamente de la presentación
- **Servicios**: Manejan lógica de negocio (caché, navegación, etc.)

### Características Principales

**Compatibilidad con Shopify**: Sintaxis familiar para desarrolladores
**Renderizado Dinámico**: Determina automáticamente qué datos cargar
**Sistema de Caché**: Optimizado para performance
**Assets Inteligentes**: Combina y optimiza CSS/JS automáticamente
**Multi-tenant**: Soporte completo para múltiples tiendas

---

## Arquitectura del Motor

```
Domain Request → DomainResolver → StoreResolver → PageDataLoader
                                               ↓
                                            DataFetcher
                                               ↓
                                    ProductFetcher/CollectionFetcher
                                               ↓
                               TemplateLoader → LiquidEngine → Tags & Filters
                                               ↓
                               ContextBuilder → SectionRenderer → AssetCollector
                                               ↓
                                           Final HTML
```

### Componentes Principales

| Componente       | Responsabilidad                               |
| ---------------- | --------------------------------------------- |
| `DomainResolver` | Resuelve dominios a tiendas específicas       |
| `PageDataLoader` | Determina y carga datos necesarios por página |
| `TemplateLoader` | Carga templates desde S3/CloudFront           |
| `LiquidEngine`   | Motor de renderizado principal                |
| `ContextBuilder` | Construye el contexto Liquid                  |
| `AssetCollector` | Maneja CSS/JS dinámico                        |

---

## Objetos Globales Disponibles

### Objeto `shop` / `store`

Información global de la tienda, disponible en todas las plantillas:

```liquid
<!-- Logo de la tienda -->
<img src="{{ shop.logo | image_url: '200x' }}" alt="{{ shop.name }}">

<!-- Información básica -->
<h1>{{ shop.name }}</h1>
<p>{{ shop.description }}</p>

<!-- Enlaces importantes -->
<a href="{{ shop.url }}">Inicio</a>
<a href="mailto:{{ shop.email }}">Contacto</a>
```

**Propiedades disponibles:**

```typescript
interface ShopContext {
  name: string; // Nombre de la tienda
  description: string; // Descripción SEO
  domain: string; // Dominio (ej: mitienda.com)
  url: string; // URL completa (https://...)
  currency: string; // Código moneda (COP, USD)
  money_format: string; // Formato precios (${{amount}})
  logo?: string; // URL del logo
  banner?: string; // URL del banner
  email?: string; // Email de contacto
  phone?: string; // Teléfono
}
```

### Objeto `product`

Disponible en páginas de producto y dentro de loops:

```liquid
<!-- Información básica del producto -->
<h1>{{ product.name }}</h1>
<div class="price">
  {{ product.price | money }}
  {% if product.compare_at_price %}
    <s>{{ product.compare_at_price | money }}</s>
  {% endif %}
</div>

<!-- Galería de imágenes -->
{% for image in product.images %}
  <img src="{{ image.url | image_url: '500x' }}" alt="{{ image.alt }}">
{% endfor %}

<!-- Variantes -->
<select name="variant">
  {% for variant in product.variants %}
    <option value="{{ variant.id }}">
      {{ variant.title }} - {{ variant.price | money }}
    </option>
  {% endfor %}
</select>
```

### Objeto `collection`

Disponible en páginas de colección:

```liquid
<!-- Encabezado de colección -->
<div class="collection-header">
  {% if collection.image %}
    <img src="{{ collection.image | image_url: '1200x' }}" alt="{{ collection.title }}">
  {% endif %}
  <h1>{{ collection.title }}</h1>
  <p>{{ collection.description }}</p>
</div>

<!-- Productos de la colección -->
<div class="product-grid">
  {% paginate collection.products %}
    {% for product in collection.products %}
      {% render 'product-card', product: product %}
    {% endfor %}

    {{ collection | default_pagination }}
  {% endpaginate %}
</div>
```

### Objeto `cart`

Información del carrito de compras:

```liquid
<!-- Contador del carrito -->
<span class="cart-count">{{ cart.item_count }}</span>

<!-- Total del carrito -->
<span class="cart-total">{{ cart.total_price | money }}</span>

<!-- Items del carrito -->
{% for item in cart.items %}
  <div class="cart-item">
    <img src="{{ item.image }}" alt="{{ item.title }}">
    <h3>{{ item.title }}</h3>
    <span>{{ item.quantity }} x {{ item.price | money }}</span>
    <span>{{ item.line_price | money }}</span>
  </div>
{% endfor %}
```

---

## Etiquetas Personalizadas (Tags)

### `{% paginate %}`

La etiqueta fundamental para la paginación. **Ahora es pasiva y no especifica el límite de ítems por página directamente**. El motor inyecta un objeto `paginate` global que contiene toda la información de paginación (incluyendo el límite, que se define en el `schema` del template JSON de la página).

**¡Importante! Uso de límites pares**: Es crucial que los límites de paginación (ej. `products_per_page`, `collections_per_page`) que configures en el `schema` del JSON de tu plantilla sean **números pares**. Esto se debe a una limitación conocida en la paginación con `nextToken` en Amplify Gen 2, que puede causar que el botón "Siguiente" aparezca incorrectamente en la última página si se usan límites impares.

```liquid
{% comment %}
  Sintaxis: {% paginate expression %}
  - expression: collection.products, search.results, etc.
  - La cantidad de ítems por página se configura en el schema del template JSON (ej: templates/collection.json o templates/product.json).
{% endcomment %}

{% paginate collection.products %}
  <div class="product-grid">
    {% for product in collection.products %}
      <div class="product-card">
        <img src="{{ product.featured_image | image_url: '300x' }}">
        <h3>{{ product.name }}</h3>
        <p>{{ product.price | money }}</p>
      </div>
    {% endfor %}
  </div>

  <!-- Controles de paginación automáticos -->
  {{ paginate | default_pagination }}
{% endpaginate %}
```

**Cómo funciona internamente:**

- Detecta el tipo de recurso automáticamente
- Llama al fetcher correspondiente (`ProductFetcher`, `CollectionFetcher`)
- Usa paginación cursor-based (NextToken) para máxima eficiencia
- No carga todos los items en memoria

### `{% render %}`

Incluye snippets reutilizables con parámetros:

```liquid
<!-- Snippet: snippets/product-card.liquid -->
<div class="product-card">
  <a href="{{ card_product.url }}">
    <img src="{{ card_product.featured_image | image_url: '300x' }}"
         alt="{{ card_product.name }}">
    <h3>{{ card_product.name }}</h3>
    <span class="price">{{ card_product.price | money }}</span>
    {% if card_product.compare_at_price %}
      <s class="original-price">{{ card_product.compare_at_price | money }}</s>
    {% endif %}
  </a>
</div>

<!-- Uso en templates -->
{% for product in collection.products %}
  {% render 'product-card', card_product: product %}
{% endfor %}

<!-- Con múltiples parámetros -->
{% render 'product-card',
   card_product: product,
   show_vendor: true,
   show_tags: false %}
```

### `{% section %}`

Incluye secciones completas:

```liquid
<!-- En layout/theme.liquid -->
<main>
  {% section 'header' %}
  {{ content_for_layout }}
  {% section 'footer' %}
</main>
```

**Funcionamiento:**

- Busca en `sections/header.liquid`
- Pre-carga automáticamente para evitar bloqueos
- Disponible en `context.preloaded_sections`

### `{% schema %}`

Define configuraciones personalizables en secciones:

```liquid
<!-- sections/banner.liquid -->
<div class="banner" style="background-color: {{ section.settings.bg_color }};">
  <h2>{{ section.settings.title }}</h2>
  <p>{{ section.settings.subtitle }}</p>
  {% if section.settings.show_button %}
    <a href="{{ section.settings.button_url }}">{{ section.settings.button_text }}</a>
  {% endif %}
</div>

{% schema %}
{
  "name": "Banner Hero",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Título Principal",
      "default": "¡Bienvenido a nuestra tienda!"
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
      "default": "#f5f5f5"
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
      "label": "URL del Botón"
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

### `{% form %}`

Crea formularios con atributos correctos:

```liquid
<!-- Formulario de contacto -->
{% form 'contact' %}
  <input type="text" name="contact[name]" placeholder="Nombre" required>
  <input type="email" name="contact[email]" placeholder="Email" required>
  <textarea name="contact[message]" placeholder="Mensaje" required></textarea>
  <button type="submit">Enviar</button>
{% endform %}

<!-- Formulario de producto (agregar al carrito) -->
{% form 'product', product %}
  <select name="id">
    {% for variant in product.variants %}
      <option value="{{ variant.id }}">{{ variant.title }}</option>
    {% endfor %}
  </select>
  <input type="number" name="quantity" value="1" min="1">
  <button type="submit">Agregar al Carrito</button>
{% endform %}

<!-- Formulario de newsletter -->
{% form 'newsletter', class: 'newsletter-form' %}
  <input type="email" name="contact[email]" placeholder="Tu email">
  <button type="submit">Suscribirse</button>
{% endform %}
```

### `{% style %}` y `{% javascript %}`

CSS y JavaScript dinámico en secciones:

```liquid
<!-- CSS dinámico con variables Liquid -->
{% style %}
  .banner-{{ section.id }} {
    background-color: {{ section.settings.bg_color }};
    padding: {{ section.settings.padding }}px;
    text-align: {{ section.settings.text_align }};
  }

  .banner-{{ section.id }} h2 {
    color: {{ section.settings.text_color }};
    font-size: {{ section.settings.title_size }}px;
  }
{% endstyle %}

<!-- JavaScript con contexto de sección -->
{% javascript %}
  document.addEventListener('DOMContentLoaded', function() {
    const banner = document.querySelector('.banner-{{ section.id }}');
    const autoPlay = {{ section.settings.auto_play }};

    if (autoPlay && banner) {
      // Lógica de auto-play
      setInterval(() => {
        banner.classList.toggle('highlight');
      }, {{ section.settings.interval | default: 3000 }});
    }
  });
{% endjavascript %}
```

---

## Filtros Disponibles

### Filtros de URL

```liquid
<!-- Assets estáticos del tema -->
{{ 'logo.png' | asset_url }}
<!-- Resultado: /api/stores/store-123/assets/logo.png -->

<!-- Imágenes con transformaciones -->
{{ product.featured_image | image_url: '450x450' }}
{{ product.featured_image | image_url: '1200x600_crop_center' }}

<!-- URLs de productos y colecciones -->
{{ product | product_url }}
{{ collection | collection_url }}
```

### Filtros de HTML

```liquid
<!-- Enlaces automáticos -->
{{ 'Mi Producto' | link_to: product.url, 'class="product-link"' }}

<!-- Tags de assets -->
{{ 'theme.css' | asset_url | stylesheet_tag }}
{{ 'theme.js' | asset_url | script_tag }}

<!-- Imágenes con atributos -->
{{ product.featured_image | img_tag: product.name, 'class="product-image"' }}

<!-- Paginación automática -->
{{ collection | default_pagination }}
```

### Filtros de Dinero

```liquid
<!-- Formateo de precios -->
{{ 125000 | money }}                    <!-- $125,000 -->
{{ product.price | money_without_currency }}    <!-- 125,000.00 -->
{{ product.price | money_without_decimal }}     <!-- $125,000 -->

<!-- Conversión de centavos -->
{{ 12500 | cents_to_price | money }}    <!-- $125.00 -->
```

### Filtros de Texto

```liquid
<!-- Handles SEO-friendly -->
{{ "¡Mi Súper Producto!" | handleize }}  <!-- mi-super-producto -->

<!-- Truncado inteligente -->
{{ product.description | truncate: 150, '... Ver más' }}

<!-- Valores por defecto -->
{{ product.vendor | default: 'Marca No Especificada' }}

<!-- Pluralización -->
{{ cart.item_count | pluralize: 'producto', 'productos' }}
```

### Filtros de Carrito

```liquid
<!-- URLs del carrito -->
{{ cart_url }}              <!-- /cart -->
{{ cart_add_url }}          <!-- /cart/add -->

<!-- Contar items de una variante específica -->
{{ cart | item_count_for_variant: variant.id }}

<!-- Items de un producto específico -->
{% assign product_items = cart | line_items_for: product.id %}

<!-- URLs para cambiar cantidad -->
{{ item.key | cart_change_url: 5 }}     <!-- Cambiar a 5 -->
{{ item.key | remove_from_cart_url }}   <!-- Remover completamente -->
```

---

## Sistema de Navegación

### LinkLists (Menús)

El sistema de navegación es compatible con Shopify:

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
<footer>
  {% if linklists.footer-menu %}
    {% for link in linklists.footer-menu.links %}
      <a href="{{ link.url }}">{{ link.title }}</a>
    {% endfor %}
  {% endif %}
</footer>

<!-- Menú con submenús (si están implementados) -->
{% for link in linklists.main-menu.links %}
  <div class="nav-item">
    <a href="{{ link.url }}">{{ link.title }}</a>
    {% if link.links %}
      <ul class="submenu">
        {% for sublink in link.links %}
          <li><a href="{{ sublink.url }}">{{ sublink.title }}</a></li>
        {% endfor %}
      </ul>
    {% endif %}
  </div>
{% endfor %}
```

### Configuración de Navegación

Los menús se configuran en la base de datos y se transforman automáticamente:

```typescript
// Estructura interna
interface NavigationMenu {
  id: string;
  name: string;
  handle: string; // 'main-menu', 'footer-menu'
  isMain: boolean;
  menuData: NavigationMenuItem[];
}

// Se transforma a formato Shopify
interface LinkList {
  title: string;
  handle: string;
  links: LinkListItem[];
}
```

---

## Gestión de Assets

### Sistema de Assets Dinámicos

El motor incluye un sistema inteligente de gestión de assets:

```liquid
<!-- CSS y JS se combinan automáticamente -->
{% style %}
  .mi-seccion { color: red; }
{% endstyle %}

{% javascript %}
  console.log('Mi código JS');
{% endjavascript %}
```

**Funcionamiento:**

1. `AssetCollector` recopila todos los CSS/JS de las secciones
2. Los combina y optimiza automáticamente
3. Los inyecta en `<head>` y antes de `</body>`
4. Añade atributo `data-fasttify-assets="true"` para identificación

### Assets Estáticos

```liquid
<!-- Imágenes del tema -->
<img src="{{ 'banner.jpg' | asset_url }}" alt="Banner">

<!-- CSS del tema -->
{{ 'theme.css' | asset_url | stylesheet_tag }}

<!-- JavaScript del tema -->
{{ 'theme.js' | asset_url | script_tag }}
```

**Rutas generadas:**

- Assets: `/api/stores/{storeId}/assets/{filename}`
- Servidas desde CloudFront para máxima velocidad

---

## Caché y Performance

### Sistema de Caché Multinivel

```typescript
// TTL por tipo de contenido
PRODUCT_CACHE_TTL: 15 minutos
COLLECTION_CACHE_TTL: 30 minutos
TEMPLATE_CACHE_TTL: 1 hora (1 segundo en desarrollo)
DOMAIN_CACHE_TTL: 30 minutos
```

### Estrategias de Optimización

1. **Templates**: Caché agresivo con invalidación inteligente
2. **Datos**: Caché por tienda con TTL diferenciado
3. **Assets**: CloudFront + caché del navegador
4. **Paginación**: Solo carga datos de la página actual

### Invalidación de Caché

```typescript
// Invalidar por tienda
cacheManager.invalidateStoreCache(storeId);

// Invalidar producto específico
cacheManager.invalidateProductCache(storeId, productId);

// Invalidar template específico
cacheManager.invalidateTemplateCache(templatePath);
```

---

## Ejemplos Prácticos

### Template de Producto Completo

```liquid
<!-- templates/product.liquid -->
<div class="product-page">
  <!-- Breadcrumbs -->
  <nav class="breadcrumbs">
    <a href="{{ shop.url }}">Inicio</a>
    {% if collection %}
      <a href="{{ collection.url }}">{{ collection.title }}</a>
    {% endif %}
    <span>{{ product.name }}</span>
  </nav>

  <div class="product-main">
    <!-- Galería de imágenes -->
    <div class="product-gallery">
      {% for image in product.images %}
        <img src="{{ image.url | image_url: '600x' }}"
             alt="{{ image.alt | default: product.name }}"
             {% if forloop.first %}class="active"{% endif %}>
      {% endfor %}
    </div>

    <!-- Información del producto -->
    <div class="product-info">
      <h1>{{ product.name }}</h1>

      <!-- Precio -->
      <div class="price-box">
        <span class="current-price">{{ product.price | money }}</span>
        {% if product.compare_at_price and product.compare_at_price > product.price %}
          <s class="original-price">{{ product.compare_at_price | money }}</s>
          <span class="discount">
            {{ product.compare_at_price | minus: product.price | money }} de descuento
          </span>
        {% endif %}
      </div>

      <!-- Descripción -->
      <div class="product-description">
        {{ product.description }}
      </div>

      <!-- Formulario de compra -->
      {% form 'product', product, class: 'product-form' %}
        {% if product.variants.size > 1 %}
          <div class="variant-selector">
            <label for="variant-select">Opciones:</label>
            <select name="id" id="variant-select">
              {% for variant in product.variants %}
                <option value="{{ variant.id }}"
                        {% unless variant.available %}disabled{% endunless %}>
                  {{ variant.title }} - {{ variant.price | money }}
                  {% unless variant.available %} (Agotado){% endunless %}
                </option>
              {% endfor %}
            </select>
          </div>
        {% else %}
          <input type="hidden" name="id" value="{{ product.variants.first.id }}">
        {% endif %}

        <div class="quantity-selector">
          <label for="quantity">Cantidad:</label>
          <input type="number" name="quantity" id="quantity" value="1" min="1">
        </div>

        <button type="submit" class="add-to-cart-btn"
                {% unless product.available %}disabled{% endunless %}>
          {% if product.available %}
            Agregar al Carrito
          {% else %}
            Agotado
          {% endif %}
        </button>
      {% endform %}
    </div>
  </div>

  <!-- Productos relacionados -->
  {% if collection and collection.products.size > 1 %}
    <div class="related-products">
      <h2>Productos Relacionados</h2>
      <div class="product-grid">
        {% for related_product in collection.products limit: 4 %}
          {% unless related_product.id == product.id %}
            {% render 'product-card', product: related_product %}
          {% endunless %}
        {% endfor %}
      </div>
    </div>
  {% endif %}
</div>
```

### Snippet de Tarjeta de Producto

```liquid
<!-- snippets/product-card.liquid -->
<div class="product-card" data-product-id="{{ product.id }}">
  <div class="product-image">
    <a href="{{ product.url }}">
      {% if product.images.size > 0 %}
        <img src="{{ product.images.first.url | image_url: '300x300' }}"
             alt="{{ product.name }}"
             loading="lazy">
      {% else %}
        <div class="no-image-placeholder">Sin imagen</div>
      {% endif %}
    </a>

    {% if product.compare_at_price and product.compare_at_price > product.price %}
      <span class="sale-badge">¡Oferta!</span>
    {% endif %}
  </div>

  <div class="product-details">
    <h3 class="product-title">
      <a href="{{ product.url }}">{{ product.name }}</a>
    </h3>

    {% if product.vendor %}
      <p class="product-vendor">{{ product.vendor }}</p>
    {% endif %}

    <div class="product-price">
      <span class="current-price">{{ product.price | money }}</span>
      {% if product.compare_at_price and product.compare_at_price > product.price %}
        <s class="original-price">{{ product.compare_at_price | money }}</s>
      {% endif %}
    </div>

    {% unless product.available %}
      <span class="stock-status out-of-stock">Agotado</span>
    {% endunless %}
  </div>

  <!-- Botón de compra rápida -->
  {% if product.available and product.variants.size == 1 %}
    <div class="quick-add">
      {% form 'product', product, class: 'quick-add-form' %}
        <input type="hidden" name="id" value="{{ product.variants.first.id }}">
        <input type="hidden" name="quantity" value="1">
        <button type="submit" class="quick-add-btn">Compra Rápida</button>
      {% endform %}
    </div>
  {% endif %}
</div>
```

### Template de Colección con Filtros

```liquid
<!-- templates/collection.liquid -->
<div class="collection-page">
  <!-- Encabezado -->
  <div class="collection-header">
    {% if collection.image %}
      <div class="collection-banner">
        <img src="{{ collection.image | image_url: '1200x400' }}"
             alt="{{ collection.title }}">
      </div>
    {% endif %}

    <div class="collection-info">
      <h1>{{ collection.title }}</h1>
      {% if collection.description %}
        <div class="collection-description">
          {{ collection.description }}
        </div>
      {% endif %}
    </div>
  </div>

  <!-- Filtros y ordenamiento -->
  <div class="collection-toolbar">
    <div class="results-count">
      {{ collection.products.size }}
      {{ collection.products.size | pluralize: 'producto', 'productos' }}
    </div>

    <!-- Aquí irían filtros más avanzados -->
    <div class="sort-options">
      <select name="sort" id="sort-select">
        <option value="manual">Destacados</option>
        <option value="price-ascending">Precio: Menor a Mayor</option>
        <option value="price-descending">Precio: Mayor a Menor</option>
        <option value="title-ascending">A-Z</option>
        <option value="title-descending">Z-A</option>
        <option value="created-descending">Más Recientes</option>
      </select>
    </div>
  </div>

  <!-- Productos con paginación -->
  {% paginate collection.products %}
    {% if collection.products.size > 0 %}
      <div class="product-grid">
        {% for product in collection.products %}
          {% render 'product-card', product: product %}
        {% endfor %}
      </div>

      <!-- Paginación -->
      {% if paginate.pages > 1 %}
        <nav class="pagination-wrapper">
          {{ collection | default_pagination }}
        </nav>
      {% endif %}
    {% else %}
      <div class="empty-collection">
        <h2>No hay productos en esta colección</h2>
        <p>Vuelve pronto para ver nuevos productos.</p>
        <a href="{{ shop.url }}" class="btn">Ver todas las colecciones</a>
      </div>
    {% endif %}
  {% endpaginate %}
</div>
```

---

## Resolución de Problemas

### Errores Comunes

#### 1. Template no encontrado

```
Error: TEMPLATE_NOT_FOUND
```

**Solución:**

- Verificar que el archivo existe en S3
- Comprobar el nombre del archivo (case-sensitive)
- Verificar permisos de S3

#### 2. Variable no definida

```liquid
{{ variable_no_definida }}  <!-- No produce error, devuelve vacío -->
```

**Mejor práctica:**

```liquid
{{ variable_no_definida | default: 'Valor por defecto' }}
```

#### 3. Error en schema JSON

```liquid
{% schema %}
{
  "name": "Mi Sección"  // ❌ Coma al final no permitida
}
{% endschema %}
```

#### 4. Problemas de caché en desarrollo

```typescript
// El sistema detecta automáticamente development
// Templates se cachean solo 1 segundo vs 1 hora en producción
```

### Debugging

#### Logs del Sistema

```typescript
// Logs automáticos disponibles:
[Renderer:LiquidEngine] Template rendering started
[Renderer:TemplateLoader] Loading template: sections/header.liquid
[Renderer:SectionRenderer] Rendering section: header
[Renderer:AssetCollector] CSS collected: 150 bytes
```

#### Información de Debug en Templates

```liquid
<!-- Mostrar contexto de sección -->
<pre>{{ section | json }}</pre>

<!-- Mostrar información del producto -->
<pre>{{ product | json }}</pre>

<!-- Verificar si una variable existe -->
{% if variable %}
  Variable existe: {{ variable }}
{% else %}
  Variable no definida
{% endif %}
```

### Performance Tips

1. **Usar paginación siempre**:

```liquid
{% paginate collection.products %}
  <!-- contenido -->
{% endpaginate %}
```

2. **Lazy loading de imágenes**:

```liquid
<img src="{{ image | image_url: '300x' }}" loading="lazy">
```

3. **Evitar loops anidados grandes**:

```liquid
<!-- ❌ Evitar -->
{% for collection in collections %}
  {% for product in collection.products %}
    <!-- renderizado pesado -->
  {% endfor %}
{% endfor %}

<!-- ✅ Mejor -->
{% render 'collection-preview', collection: collection %}
```

4. **Usar snippets para código repetitivo**:

```liquid
<!-- ✅ Reutilizable y cacheable -->
{% render 'product-card', product: product %}
```

---
