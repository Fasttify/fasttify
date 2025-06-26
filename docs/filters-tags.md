# Guía del Desarrollador de Temas Liquid

¡Bienvenido a la guía de referencia del motor de plantillas Liquid! Este documento es tu recurso principal para crear, personalizar y extender temas en nuestra plataforma. Aquí encontrarás explicaciones detalladas y ejemplos prácticos de todos los objetos, etiquetas y filtros disponibles.

## Filosofía del Motor

Nuestro motor utiliza **Liquid**, el popular lenguaje de plantillas de Shopify, por su simplicidad y seguridad. Hemos extendido el Liquid estándar con objetos, etiquetas y filtros optimizados para e-commerce, permitiéndote construir temas ricos y dinámicos de manera eficiente. La clave es la **separación de responsabilidades**: los **fetchers** obtienen los datos, y las **plantillas** se encargan únicamente de la presentación.

---

## 1. Objetos Globales

Estos son los objetos principales que contienen los datos de la tienda. Están disponibles en casi todas las plantillas.

### Objeto `shop`

Representa los datos globales de la tienda. También es accesible a través de la variable `store`.

| Propiedad      | Tipo     | Descripción                                             |
| :------------- | :------- | :------------------------------------------------------ |
| `name`         | `String` | El nombre de la tienda.                                 |
| `description`  | `String` | La descripción SEO de la tienda.                        |
| `domain`       | `String` | El dominio principal de la tienda (ej: `mitienda.com`). |
| `url`          | `String` | La URL completa a la página de inicio (`https://...`).  |
| `currency`     | `String` | El código de la moneda (ej: `COP`, `USD`).              |
| `money_format` | `String` | El formato para mostrar los precios.                    |
| `logo`         | `String` | URL de la imagen del logo.                              |
| `banner`       | `String` | URL de la imagen del banner principal.                  |

**Ejemplo Práctico: Crear un encabezado**

```liquid
<header class="site-header">
  <a href="{{ shop.url }}" title="{{ shop.name }}">
    <img src="{{ shop.logo | image_url: '200x' }}" alt="{{ shop.name }} logo">
  </a>
  <p>{{ shop.description }}</p>
</header>
```

### Objeto `collection`

Disponible en las plantillas de colección (`collection.liquid`). Contiene la información de la colección que se está visualizando.

| Propiedad     | Tipo     | Descripción                                                      |
| :------------ | :------- | :--------------------------------------------------------------- |
| `id`          | `String` | El ID único de la colección.                                     |
| `title`       | `String` | El título de la colección.                                       |
| `description` | `String` | La descripción (puede contener HTML).                            |
| `image`       | `String` | URL de la imagen principal de la colección.                      |
| `url`         | `String` | La URL canónica de la colección.                                 |
| `products`    | `Array`  | Un array de los objetos `product` pertenecientes a la colección. |
| `nextToken`   | `String` | Token para la paginación. Usado internamente por `paginate`.     |

**Ejemplo Práctico: Encabezado de una página de colección**

```liquid
<div class="collection-header">
  {% if collection.image %}
    <img src="{{ collection.image | image_url: '1200x' }}" alt="Banner de {{ collection.title }}">
  {% endif %}
  <h1>{{ collection.title }}</h1>
  <div class="collection-description">
    {{ collection.description }}
  </div>
</div>
```

### Objeto `product`

Representa un producto individual. Disponible en `product.liquid` y dentro de bucles `{% for product in collection.products %}`.

| Propiedad          | Tipo      | Descripción                                     |
| :----------------- | :-------- | :---------------------------------------------- |
| `id`               | `String`  | El ID único del producto.                       |
| `title`            | `String`  | El nombre del producto.                         |
| `description`      | `String`  | La descripción completa (HTML).                 |
| `price`            | `String`  | El precio ya formateado (ej: `$1,250.00`).      |
| `compare_at_price` | `String`  | El precio de comparación (antes del descuento). |
| `url`              | `String`  | La URL canónica del producto.                   |
| `featured_image`   | `String`  | La URL de la imagen destacada.                  |
| `images`           | `Array`   | Un array de todas las imágenes del producto.    |
| `variants`         | `Array`   | Un array de las variantes del producto.         |
| `available`        | `Boolean` | `true` si el producto tiene stock.              |

**Ejemplo Práctico: Mostrar el precio y un descuento**

```liquid
<div class="price-box">
  <span class="final-price">{{ product.price | money }}</span>
  {% if product.compare_at_price > product.price %}
    <s class="original-price">{{ product.compare_at_price | money }}</s>
    <span class="discount-badge">¡Oferta!</span>
  {% endif %}
</div>
```

---

## 2. Etiquetas Personalizadas (Tags)

Las etiquetas controlan el flujo y la lógica de las plantillas.

### `{% paginate %}`

Es la etiqueta más importante para la paginación. Divide un array de ítems (productos, colecciones, etc.) en múltiples páginas.

- **Sintaxis**: `{% paginate expression by number %}`
- **Cómo funciona**: La etiqueta es inteligente. Detecta el tipo de recurso en la `expression` (ej: `.products`, `.collections`) y llama al `fetcher` correspondiente en el backend para obtener solo los ítems de la página actual de forma eficiente. No carga todos los ítems en memoria.

**Ejemplo Práctico Completo: Paginando una colección de productos**

```liquid
{% comment %}
  Paginaremos los productos de la colección actual, mostrando 12 por página.
{% endcomment %}
{% paginate collection.products by 12 %}

  <h2>{{ collection.title }}</h2>

  <div class="product-grid">
    {% for product in collection.products %}
      {% render 'product-card', product: product %}
    {% else %}
      <p>No hay productos en esta colección.</p>
    {% endfor %}
  </div>

  {% comment %}
    El filtro `default_pagination` es la forma más fácil de renderizar
    los enlaces de "Siguiente" y "Anterior".
  {% endcomment %}
  {{ collection | default_pagination }}

{% endpaginate %}
```

### `{% schema %}`

Define las opciones de personalización de una sección que aparecerán en el editor de temas. Debe ser un JSON válido. Los valores definidos aquí son accesibles en Liquid a través del objeto `section.settings`.

**Ejemplo Práctico: Una sección de banner personalizable**

```liquid
{% comment %}
  En tu sección .liquid
{% endcomment %}
<div class="banner" style="background-color: {{ section.settings.bg_color }};">
  <h2>{{ section.settings.title }}</h2>
  <p>{{ section.settings.subtitle }}</p>
</div>

{% schema %}
{
  "name": "Banner",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Título Principal",
      "default": "¡Bienvenido a nuestra tienda!"
    },
    {
      "type": "text",
      "id": "subtitle",
      "label": "Subtítulo"
    },
    {
      "type": "color",
      "id": "bg_color",
      "label": "Color de Fondo",
      "default": "#f5f5f5"
    }
  ]
}
{% endschema %}
```

### `{% render %}`

Inserta un "snippet" (fragmento de código reutilizable) de la carpeta `/snippets`. Es la forma preferida de crear componentes modulares. Puedes pasarle variables para hacer el snippet más dinámico.

**Ejemplo Práctico: Crear y usar una tarjeta de producto**

**1. Archivo `/snippets/product-card.liquid`:**

```liquid
<div class="card">
  <a href="{{ card_product.url }}">
    <img src="{{ card_product.featured_image | image_url: '300x' }}" alt="{{ card_product.title }}">
    <h3>{{ card_product.title }}</h3>
    <p>{{ card_product.price | money }}</p>
  </a>
</div>
```

**2. Usarlo en `collection.liquid`:**

```liquid
{% for product in collection.products %}
  {% comment %}
    Pasamos la variable `product` del bucle al snippet.
    Dentro del snippet, se accederá a ella como `card_product`.
  {% endcomment %}
  {% render 'product-card', card_product: product %}
{% endfor %}
```

### Otras Etiquetas

- `{% section 'nombre-seccion' %}`: Renderiza una sección completa desde la carpeta `/sections`.
- `{% style %}` y `{% javascript %}`: Permiten escribir CSS y JS directamente en los archivos de sección. El motor los agrupa y los optimiza.
- `{% form 'tipo', objeto %}`: Crea formularios HTML con los atributos correctos para acciones como `product` (añadir al carrito) o `contact`.

---

## 3. Filtros Personalizados (Filters)

Los filtros son funciones simples que modifican la salida de una variable.

### Filtros de URL

- `asset_url`: Genera la URL para un archivo estático del tema.

  - **Uso**: `{{ 'logo.png' | asset_url }}`
  - **Resultado**: `//cdn.tudominio.com/assets/logo.png`

- `image_url`: Genera una URL para una imagen, permitiendo recortes.
  - **Uso**: `{{ product.featured_image | image_url: '450x450_crop_center' }}`
  - **Resultado**: Una URL de imagen procesada y optimizada.

### Filtros de HTML

- `default_pagination`: Renderiza un bloque de paginación simple (enlaces "Anterior" y "Siguiente"). Se aplica al objeto que contiene el `nextToken`.

  - **Uso**: `{{ collection | default_pagination }}`
  - **Resultado**: `<div class="pagination"><a href="?token=...">Siguiente</a></div>`

- `stylesheet_tag`: Crea una etiqueta `<link>` completa para una hoja de estilos.

  - **Uso**: `{{ 'theme.css' | asset_url | stylesheet_tag }}`
  - **Resultado**: `<link href="..." rel="stylesheet" type="text/css" media="all" />`

- `script_tag`: Crea una etiqueta `<script>` completa para un archivo JS.
  - **Uso**: `{{ 'theme.js' | asset_url | script_tag }}`
  - **Resultado**: `<script src="..."></script>`

### Filtros de Dinero

- `money`: Formatea un número como precio con el símbolo de la moneda.
  - **Uso**: `{{ 12345.67 | money }}`
  - **Resultado**: `$12,345.67`

### Filtros de Texto

- `handleize`: Convierte un string en un "handle" amigable para URL.

  - **Uso**: `{{ "¡Mi Súper Artículo!" | handleize }}`
  - **Resultado**: `mi-super-articulo`

- `truncate`: Acorta un texto y añade una elipsis.

  - **Uso**: `{{ "Este es un texto muy largo" | truncate: 15, '...' }}`
  - **Resultado**: `Este es un te...`

- `default`: Proporciona un valor por defecto si la variable está vacía.
  - **Uso**: `{{ collection.description | default: 'No hay descripción disponible.' }}`
  - **Resultado**: Muestra la descripción o el texto por defecto si no existe.
