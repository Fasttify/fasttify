# Guía de Desarrollo de Temas para Fasttify

## 1. Introducción al Motor de Temas

Bienvenido a la guía de desarrollo de temas para Fasttify. Esta guía te proporcionará toda la información que necesitas para crear temas potentes, rápidos y flexibles para la plataforma.

El motor de temas de Fasttify utiliza **Liquid**, un lenguaje de plantillas de código abierto creado por Shopify. Hemos extendido Liquid con objetos, filtros y tags personalizados para facilitar el acceso a los datos de la plataforma y ofrecer funcionalidades de e-commerce avanzadas.

La filosofía de nuestros temas se basa en una arquitectura de **secciones**. Esto permite a los comerciantes construir y personalizar sus páginas de forma modular y flexible a través del editor de temas.

## 2. Anatomía de un Tema

Un tema de Fasttify es una colección de archivos que definen la apariencia de una tienda online. La estructura de carpetas es fundamental para el correcto funcionamiento del motor.

### 2.1. Estructura de Carpetas

Tu tema debe seguir la siguiente estructura de directorios:

```
/
├── assets/         # CSS, JavaScript, imágenes y otros archivos estáticos
├── config/         # Archivos de configuración del tema
│   └── settings_schema.json
├── layout/         # Archivo de layout principal del tema
│   └── theme.liquid
├── locales/        # Archivos de traducción para internacionalización
│   └── en.default.json
├── sections/       # Componentes modulares y reutilizables de la página
│   └── ...
├── snippets/       # Fragmentos de código reutilizables
│   └── ...
└── templates/      # Plantillas para cada tipo de página
    ├── 404.json
    ├── cart.json
    ├── collection.json
    ├── index.json
    ├── product.json
    └── search.json
```

### 2.2. Archivos Fundamentales

- **`layout/theme.liquid`**: Es el archivo de diseño principal que envuelve todas las plantillas de página. Contiene el `<html>`, `<head>` y `<body>` y es donde se renderiza el contenido dinámico.

- **`templates/*.json`**: Definen la estructura de las páginas principales (inicio, producto, colección, etc.) utilizando un conjunto de secciones. El motor utiliza estos archivos para componer dinámicamente las páginas.

  _Ejemplo de `templates/index.json`:_

  ```json
  {
    "sections": {
      "banner": {
        "type": "sections/banner",
        "settings": {
          "title": "Bienvenido a nuestra tienda"
        }
      },
      "featured-products": {
        "type": "sections/product-list-view",
        "settings": {
          "title": "Productos Destacados"
        }
      },
      "product-list-view": {
        "type": "snippets/product-list-view",
        "settings": {
          "title": "Productos Destacados"
        }
      }
    },
    "order": ["banner", "featured-products", "product-list-view"]
  }
  ```

### 2.3. Componiendo Páginas con JSON

Las plantillas JSON, como `index.json` o `collection.json`, actúan como un plano para construir páginas a partir de múltiples secciones. Su estructura principal se compone de dos campos clave: `sections` y `order`.

- **`sections`**: Un objeto donde cada clave es un identificador único para una instancia de sección en la página (ej. `"banner"`, `"featured-products"`). El valor asociado a cada clave define:

  - `"type"`: La **ruta completa desde la raíz del tema** al archivo `.liquid` de la sección (ej. `"sections/banner"`). Este mecanismo es genérico y funciona para cualquier archivo Liquid que se desee cargar.
  - `"settings"` (Opcional): Un objeto que permite sobrescribir los valores por defecto definidos en el `{% schema %}` de la sección. Esto te da control a nivel de plantilla sobre la configuración de cada instancia de sección.

- **`order`**: Un array de strings que define el orden exacto en que se renderizarán las secciones.
  - **Es un campo obligatorio**: Cada plantilla `.json` debe tener un array `order`, incluso si solo contiene un elemento.
  - Los strings en el array deben corresponder a las claves (identificadores únicos) definidas en el objeto `sections`.
  - Este campo es especialmente poderoso en `templates/index.json`, donde normalmente se combinan múltiples secciones para construir la página de inicio.

**Importante:** El motor solo soporta **un nivel de subcarpetas** para la organización de archivos. No puedes crear carpetas dentro de otras carpetas en directorios como `/sections` o `/snippets`. Por ejemplo, la ruta `sections/product/details/info.liquid` no es válida.

- **`sections/*.liquid`**: Son los bloques de construcción de tu tema. Cada archivo de sección es un componente independiente que contiene su propio HTML (Liquid), estilos (`{% style %}`) y JavaScript (`{% javascript %}`). Además, definen su propia configuración a través de la etiqueta `{% schema %}`.

- **`config/settings_schema.json`**: Define la configuración global del tema que los comerciantes pueden modificar en el editor de temas (por ejemplo: colores, tipografía, etc.).

## 3. El Flujo de Renderizado

Comprender cómo Fasttify renderiza una página es clave para un desarrollo eficiente. El proceso sigue un pipeline claro:

1.  **Resolución de Ruta**: Cuando un usuario visita una URL, el motor la mapea a un tipo de página específico (ej. `/products/mi-producto` se convierte en `pageType: 'product'`).

2.  **Análisis de Plantillas**: El motor analiza los archivos `.json` y `.liquid` requeridos para esa página (layout, secciones, snippets) y determina qué datos necesita para renderizarla (ej. el objeto `product`, una colección específica, etc.).

3.  **Carga de Datos**: Basándose en el análisis, el motor consulta la base de datos para obtener toda la información necesaria en paralelo, optimizando los tiempos de carga.

4.  **Construcción de Contexto**: Todos los datos cargados (información de la tienda, productos, navegación, etc.) se agrupan en un **contexto** global que se hace accesible a través de Liquid.

5.  **Renderizado de Secciones**: Si la plantilla es de tipo JSON, el motor renderiza cada sección definida en el archivo, inyectando los datos y configuraciones correspondientes.

6.  **Renderizado del Layout**: El contenido generado en el paso anterior se inyecta en el `layout/theme.liquid` a través de la variable `content_for_layout`.

7.  **Inyección de Assets**: El CSS y JavaScript de todas las secciones renderizadas (definido en las etiquetas `{% style %}` y `{% javascript %}`) se recolectan, combinan e inyectan en el `<head>` y antes del cierre del `</body>` respectivamente.

## 4. Contexto Global de Liquid

En cualquier archivo de tu tema, tienes acceso a un conjunto de objetos globales.

### `shop`

Contiene información sobre la tienda.

| Propiedad      | Tipo     | Descripción                                |
| -------------- | -------- | ------------------------------------------ |
| `name`         | `string` | Nombre de la tienda.                       |
| `description`  | `string` | Descripción de la tienda.                  |
| `domain`       | `string` | Dominio principal de la tienda.            |
| `url`          | `string` | URL completa de la tienda (`https://...`). |
| `currency`     | `string` | Código de la moneda (ej. 'COP').           |
| `money_format` | `string` | Formato para mostrar los precios.          |
| `email`        | `string` | Correo de contacto de la tienda.           |
| `logo`         | `string` | URL del logo de la tienda.                 |

_Acceso en Liquid:_ `{{ shop.name }}`

### `cart`

Representa el carrito de compras del usuario actual.

| Propiedad     | Tipo     | Descripción                              |
| ------------- | -------- | ---------------------------------------- |
| `item_count`  | `number` | Número total de artículos en el carrito. |
| `total_price` | `number` | Precio total del carrito.                |
| `items`       | `array`  | Array de objetos `line_item`.            |

_Acceso en Liquid:_ `{{ cart.item_count }}`

### `linklists`

Permite acceder a los menús de navegación.

**Importante:** Para acceder a los menús de navegación, debes usar el nombre del menú como clave del objeto `linklists`. Por ejemplo, si el menú se llama "main-menu", debes acceder a él como `linklists['main-menu']`.

_Acceso en Liquid:_

```liquid
{% for link in linklists['main-menu'].links %}
  <a href="{{ link.url }}">{{ link.title }}</a>
{% endfor %}
```

### `collections`

Un array con las colecciones de la tienda.
_Acceso en Liquid:_ `{% for collection in collections %}`

### `products`

Un array con los productos destacados de la tienda.
_Acceso en Liquid:_ `{% for product in products %}`

## 5. Objetos Específicos por Página

Dependiendo de la plantilla que se esté renderizando, tendrás acceso a objetos adicionales.

### `product` (en `product.json`)

Contiene toda la información de un producto específico.

| Propiedad          | Tipo     | Descripción                          |
| ------------------ | -------- | ------------------------------------ |
| `id`               | `string` | ID único del producto.               |
| `title`            | `string` | Nombre del producto.                 |
| `description`      | `string` | Descripción del producto (HTML).     |
| `price`            | `string` | Precio formateado.                   |
| `compare_at_price` | `string` | Precio de comparación formateado.    |
| `url`              | `string` | URL canónica del producto.           |
| `images`           | `array`  | Array de objetos de imagen.          |
| `variants`         | `array`  | Array de variantes del producto.     |
| `featured_image`   | `string` | URL de la imagen destacada.          |
| `quantity`         | `number` | Cantidad de productos en stock.      |
| `attributes`       | `array`  | Array de atributos del producto.     |
| `storeId`          | `string` | ID de la tienda.                     |
| `slug`             | `string` | Slug del producto.                   |
| `status`           | `string` | Estado del producto.                 |
| `category`         | `string` | Categoría del producto.              |
| `createdAt`        | `string` | Fecha de creación del producto.      |
| `updatedAt`        | `string` | Fecha de actualización del producto. |

### `collection` (en `collection.json`)

Contiene la información de una colección y sus productos.

| Propiedad     | Tipo      | Descripción                                          |
| ------------- | --------- | ---------------------------------------------------- |
| `id`          | `string`  | ID único de la colección.                            |
| `title`       | `string`  | Nombre de la colección.                              |
| `description` | `string`  | Descripción de la colección.                         |
| `image`       | `string`  | URL de la imagen de la colección.                    |
| `products`    | `array`   | Array de objetos de producto dentro de la colección. |
| `url`         | `string`  | URL canónica de la colección.                        |
| `owner`       | `string`  | ID del propietario de la colección.                  |
| `sortOrder`   | `string`  | Orden de clasificación de la colección.              |
| `isActive`    | `boolean` | Indica si la colección está activa.                  |
| `createdAt`   | `string`  | Fecha de creación de la colección.                   |
| `updatedAt`   | `string`  | Fecha de actualización de la colección.              |
| `slug`        | `string`  | Slug de la colección.                                |
| `nextToken`   | `string`  | Token de la siguiente página.                        |
| `storeId`     | `string`  | ID de la tienda.                                     |

## 6. Filtros Liquid Personalizados

Hemos añadido una serie de filtros a Liquid para facilitar el desarrollo.

| Filtro                   | Descripción                                                      | Ejemplo                    |
| ------------------------ | ---------------------------------------------------------------- | -------------------------- | -------------------------- | ------------------ |
| `asset_url`              | Genera la URL para un archivo en la carpeta `assets`.            | `{{ 'theme.css'            | asset_url }}`              |
| `money`                  | Formatea un número como precio con el símbolo de la moneda.      | `{{ product.price          | money }}`                  |
| `money_without_currency` | Formatea un número como precio sin el símbolo de la moneda.      | `{{ product.price          | money_without_currency }}` |
| `img_url`                | Genera una URL optimizada para una imagen.                       | `{{ product.featured_image | img_url: '400x' }}`        |
| `handleize`              | Convierte un string a un formato "handle" (minúsculas, guiones). | `{{ 'Mi Título'            | handleize }}`              |
| `date`                   | Formatea una fecha.                                              | `{{ article.published_at   | date: '%d %b, %Y' }}`      |
| `stylesheet_tag`         | Genera una etiqueta `<link>` para una hoja de estilos.           | `{{ 'theme.css'            | asset_url                  | stylesheet_tag }}` |
| `script_tag`             | Genera una etiqueta `<script>` para un archivo JavaScript.       | `{{ 'theme.js'             | asset_url                  | script_tag }}`     |
| `product_url`            | Genera la URL para un producto.                                  | `{{ product                | product_url }}`            |
| `collection_url`         | Genera la URL para una colección.                                | `{{ collection             | collection_url }}`         |

## 7. Tags Liquid Personalizados

### `{% schema %}`

Define la estructura de configuración de una sección. Debe estar en cada archivo de `sections/*.liquid`.

```liquid
{% schema %}
{
  "name": "Banner de Imagen",
  "settings": [
    {
      "type": "image_picker",
      "id": "image",
      "label": "Imagen"
    },
    {
      "type": "text",
      "id": "title",
      "label": "Título",
      "default": "Anuncia algo importante"
    }
  ]
}
{% endschema %}
```

Dentro del Liquid de la sección, puedes acceder a estos valores con `{{ section.settings.image }}` y `{{ section.settings.title }}`.

### `{% style %}`

Permite escribir CSS específico para una sección. El motor lo recolecta y lo inyecta en el `<head>` de la página.

```liquid
{% style %}
  .banner-title {
    color: {{ section.settings.text_color }};
  }
{% endstyle %}
```

### `{% javascript %}`

Similar a `{% style %}`, pero para JavaScript. El código se agrupa y se inyecta al final del `<body>`.

```javascript
{% javascript %}
  const banner = document.getElementById('banner-{{ section.id }}');
  // ... tu código
{% endjavascript %}
```

### `{% paginate %}`

Facilita la paginación de colecciones y productos. Nuestro motor utiliza una paginación basada en tokens para un rendimiento superior.

**Importante:** El motor solo soporta la paginación de colecciones y productos. No se puede paginar en otras secciones.
tambien puedes usar el filtro `default_pagination` para mostrar el paginador de manera predeterminada. Opcionalmente puedes usar el filtro `paginate` para mostrar el paginador de manera personalizada. ejemplo:

```liquid
{% paginate collection.products by 12 %}
{% if paginate.previous or paginate.next %}
      <nav class="custom-pagination" aria-label="Paginación">
        {% if paginate.previous %}
          <a class="custom-pagination__link" href="{{ paginate.previous.url }}">
            &larr; Anterior
          </a>
        {% else %}
          <span class="custom-pagination__link custom-pagination__link--disabled">&larr; Anterior</span>
        {% endif %}

        {% if paginate.next %}
          <a class="custom-pagination__link" href="{{ paginate.next.url }}">
            Siguiente &rarr;
          </a>
        {% else %}
          <span class="custom-pagination__link custom-pagination__link--disabled">Siguiente &rarr;</span>
        {% endif %}
      </nav>
    {% endif %}
{% endpaginate %}

```

```liquid
{% paginate collection.products by 12 %}
  <div class="product-grid">
    {% for product in collection.products %}
      {% render 'product-card', product: product %}
    {% endfor %}
  </div>

  {{ paginate | default_pagination }}
{% endpaginate %}
```

### `{% form 'type', object %}`

Crea formularios HTML con los atributos y campos ocultos necesarios.

- **Tipos soportados**: `product`, `contact`, `newsletter`, `login`, `register`.

```liquid
{% form 'product', product %}
  <input type="hidden" name="id" value="{{ product.variants.first.id }}">
  <button type="submit">Agregar al carrito</button>
{% endform %}
```

## 8. Buenas Prácticas

- **Modularidad**: Construye tu tema con secciones pequeñas y reutilizables.
- **Rendimiento**: Utiliza el filtro `img_url` para optimizar imágenes. Minimiza el uso de JavaScript pesado.
- **CSS**: Escribe todo el CSS de las secciones dentro de etiquetas `{% style %}` para mantenerlo encapsulado y mejorar el rendimiento.
- **Nomenclatura**: Sigue una convención clara para tus clases CSS (ej. BEM) para evitar colisiones.
- **Accesibilidad**: Asegúrate de que tu tema sea accesible, utilizando HTML semántico y atributos ARIA cuando sea necesario.
- **Evita la lógica compleja en Liquid**: Liquid es para renderizar. La lógica de negocio compleja debe estar en el motor.
