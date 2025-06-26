# Guía del Motor de Plantillas Liquid

¡Bienvenido a la documentación del motor de plantillas Liquid! Esta guía está diseñada para los desarrolladores y diseñadores de temas, y proporciona toda la información necesaria para crear temas potentes y dinámicos para la plataforma.

## Índice

1.  [Introducción a Liquid](#introducción-a-liquid)
2.  [Objetos Globales](#objetos-globales)
    - [Objeto `shop`](#objeto-shop)
    - [Objeto `collection`](#objeto-collection)
    - [Objeto `product`](#objeto-product)
    - [Objeto `cart`](#objeto-cart)
    - [Objeto `linklists`](#objeto-linklists)
    - [Objeto `paginate`](#objeto-paginate)
3.  [Etiquetas Personalizadas (Tags)](#etiquetas-personalizadas-tags)
    - [`{% paginate %}`](#-paginate-)
    - [`{% schema %}`](#-schema-)
    - [`{% section %}`](#-section-)
    - [`{% render %}`](#-render-)
    - [`{% style %}`](#-style-)
    - [`{% javascript %}`](#-javascript-)
    - [`{% form %}`](#-form-)
4.  [Filtros Personalizados (Filters)](#filtros-personalizados-filters)
    - [Filtros de URL](#filtros-de-url)
    - [Filtros de HTML](#filtros-de-html)
    - [Filtros de Dinero](#filtros-de-dinero)
    - [Filtros de Texto](#filtros-de-texto)

---

## Introducción a Liquid

Usamos una versión personalizada de **Liquid**, el mismo lenguaje de plantillas creado por Shopify. Esto te permite crear temas de forma rápida y segura, utilizando una sintaxis familiar. Puedes usar todas las construcciones lógicas estándar de Liquid como `{% if %}`, `{% for %}`, `{{ variable }}` y `{{ variable | filtro }`.

Además de la sintaxis estándar, hemos añadido objetos, etiquetas y filtros personalizados para facilitar la creación de temas de e-commerce.

---

## Objetos Globales

Estos objetos están disponibles en la mayoría de las plantillas y te dan acceso a los datos de la tienda.

### Objeto `shop`

El objeto `shop` (también accesible como `store`) contiene información general sobre la tienda.

- `shop.name`: Nombre de la tienda.
- `shop.description`: Descripción de la tienda.
- `shop.domain`: Dominio principal de la tienda.
- `shop.url`: URL completa de la tienda (`https://...`).
- `shop.currency`: Moneda de la tienda (ej: "COP").
- `shop.money_format`: Formato de la moneda (ej: `${{amount}}`).
- `shop.logo`: URL del logo de la tienda.
- `shop.favicon`: URL del favicon de la tienda.
- `shop.banner`: URL del banner principal de la tienda.

### Objeto `collection`

Contiene la información de la colección que se está viendo.

- `collection.id`: ID de la colección.
- `collection.title`: Título de la colección.
- `collection.description`: Descripción de la colección.
- `collection.image`: URL de la imagen de la colección.
- `collection.url`: URL de la página de la colección.
- `collection.products`: **Array** de los productos de la colección. **Nota**: Este array será paginado si se usa dentro de una etiqueta `{% paginate %}`.
- `collection.nextToken`: Token para obtener la siguiente página de productos (usado por la paginación).

### Objeto `product`

Contiene la información de un producto específico.

- `product.id`: ID del producto.
- `product.title`: Título del producto.
- `product.description`: Descripción del producto (HTML).
- `product.price`: Precio del producto, formateado.
- `product.compare_at_price`: Precio de comparación, formateado.
- `product.url`: URL del producto.
- `product.featured_image`: URL de la imagen destacada.
- `product.images`: Array de todas las imágenes del producto. Cada imagen es un objeto con `.url` y `.alt`.
- `product.variants`: Array de las variantes del producto.
- `product.available`: `true` si el producto tiene stock.

### Objeto `cart`

Contiene información sobre el carrito de compras del usuario.

- `cart.item_count`: Número total de ítems en el carrito.
- `cart.total_price`: Precio total del carrito, formateado.
- `cart.items`: Array de los ítems en el carrito.

### Objeto `linklists`

Permite acceder a los menús de navegación creados en el panel de administración.

```liquid
{% comment %}
  Para un menú con el handle 'main-menu'
{% endcomment %}
<ul>
  {% for link in linklists['main-menu'].links %}
    <li><a href="{{ link.url }}">{{ link.title }}</a></li>
  {% endfor %}
</ul>
```

### Objeto `paginate`

Este objeto solo existe dentro de un bloque `{% paginate %}` y contiene toda la información de la paginación.

- `paginate.previous.url`: URL de la página anterior.
- `paginate.next.url`: URL de la página siguiente.
- `paginate.current_page`: Número de la página actual (si la paginación es numérica).
- `paginate.total_pages`: Número total de páginas (si la paginación es numérica).
- `paginate.parts`: Array para construir los enlaces de paginación numerados.

---

## Etiquetas Personalizadas (Tags)

### `{% paginate %}`

Esta es la etiqueta más importante para dividir grandes listas de ítems (como productos o colecciones) en varias páginas.

**Uso:**

```liquid
{% paginate collection.products by 12 %}
  <div class="product-grid">
    {% for product in collection.products %}
      {% render 'product-card', product: product %}
    {% endfor %}
  </div>

  {% comment %} El filtro `default_pagination` genera los enlaces de Siguiente/Anterior {% endcomment %}
  {{ collection | default_pagination }}
{% endpaginate %}
```

La etiqueta `paginate` es inteligente:

- Detecta si estás paginando `collection.products` o `shop.collections`.
- Llama al `fetcher` correspondiente para obtener solo los ítems de la página actual.
- Inyecta el objeto `paginate` en el contexto.

### `{% schema %}`

Define la estructura de las opciones de personalización de una sección en el editor de temas. Debe contener un objeto JSON válido.

```liquid
{% schema %}
{
  "name": "Banner con Imagen",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Título",
      "default": "Mi Banner"
    },
    {
      "type": "color",
      "id": "background",
      "label": "Color de Fondo",
      "default": "#FFFFFF"
    }
  ]
}
{% endschema %}
```

### `{% section %}`

Incluye y renderiza una sección en una plantilla. Las secciones se encuentran en la carpeta `/sections`.

```liquid
{% comment %} Esto renderizará el archivo /sections/header.liquid {% endcomment %}
{% section 'header' %}
```

### `{% render %}`

Incluye un "snippet" o fragmento de código reutilizable. Es ideal para componentes como tarjetas de producto, iconos, etc. Los snippets están en la carpeta `/snippets`.

```liquid
{% comment %}
  Renderiza el archivo /snippets/product-card.liquid
  y le pasa el objeto `product` como una variable local.
{% endcomment %}
{% render 'product-card', product: my_product %}
```

### `{% style %}`

Permite escribir CSS directamente en tus archivos de sección. El motor recolectará todo el CSS de las diferentes secciones y lo inyectará en el `<head>` de la página, optimizado y sin duplicados.

```liquid
{% style %}
  .my-section {
    background-color: {{ section.settings.background }};
    color: {{ section.settings.text_color }};
  }
{% endstyle %}
```

### `{% javascript %}`

Similar a `{% style %}`, pero para código JavaScript. El JS se recolectará y se inyectará al final del `<body>`.

```javascript
{% javascript %}
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Sección cargada: {{ section.id }}');
  });
{% endjavascript %}
```

### `{% form %}`

Crea una etiqueta `<form>` con los atributos correctos para diferentes propósitos (añadir al carrito, contacto, etc.).

```liquid
{% form 'product', product %}
  <input type="hidden" name="id" value="{{ product.variants.first.id }}">
  <button type="submit">Añadir al carrito</button>
{% endform %}
```

---

## Filtros Personalizados (Filters)

Los filtros modifican la salida de una variable. Se usan con el carácter `|`.

### Filtros de URL

- `asset_url`: Genera la URL para un archivo en la carpeta `/assets` del tema.
  `{{ 'theme.css' | asset_url }}` -> `//cdn.tu-tienda.com/assets/theme.css`
- `image_url`: Genera una URL para una imagen, con la posibilidad de especificar un tamaño.
  `{{ product.featured_image | image_url: '400x400' }}`
- `product_url`: Devuelve la URL canónica de un producto.
- `collection_url`: Devuelve la URL canónica de una colección.

### Filtros de HTML

- `default_pagination`: Renderiza los controles de paginación (Siguiente/Anterior) para un bloque `paginate`.
  `{{ collection | default_pagination }}`
- `stylesheet_tag`: Crea una etiqueta `<link rel="stylesheet">` completa.
  `{{ 'theme.css' | asset_url | stylesheet_tag }}`
- `script_tag`: Crea una etiqueta `<script>` completa.
  `{{ 'theme.js' | asset_url | script_tag }}`
- `link_to`: Crea un enlace `<a>`.
  `{{ 'Ver producto' | link_to: product.url }}`
- `img_tag`: Crea una etiqueta `<img>` completa.
  `{{ product.featured_image | image_url: '300x' | img_tag: product.title }}`

### Filtros de Dinero

- `money`: Formatea un número como un precio con el símbolo de la moneda.
  `{{ product.price | money }}` -> `$1,250.00`
- `money_without_currency`: Formatea un número como un precio sin el símbolo de la moneda.
  `{{ product.price | money_without_currency }}` -> `1,250.00`

### Filtros de Texto

- `handleize`: Convierte un texto a un formato "handle" (minúsculas, guiones).
  `{{ 'Mi Nuevo Artículo' | handleize }}` -> `mi-nuevo-articulo`
- `truncate`: Acorta un texto a una longitud específica.
  `{{ product.description | truncate: 100, '...' }}`
- `default`: Proporciona un valor por defecto si una variable es nula o vacía.
  `{{ settings.title | default: 'Mi Título por Defecto' }}`
