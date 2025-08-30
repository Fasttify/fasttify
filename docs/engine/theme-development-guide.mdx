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

    #### Configuración de Paginación en las Secciones

    Para controlar la paginación de colecciones o productos, debes definir el límite de ítems por página (como `products_per_page` o `collections_per_page`) dentro del bloque `settings` de la sección en tu archivo JSON de plantilla. El motor detectará estos IDs y los usará para cargar los datos paginados para ese recurso.

    _Ejemplo de `templates/index.json` con configuración de paginación para colecciones en la sección `home-collections`:_

    ```json
    {
      "sections": {
        "home-collections": {
          "type": "sections/home-collections",
          "settings": {
            "type": "number",
            "id": "collections_per_page",
            "label": "Collections per page",
            "default": 12
          }
        }
      },
      "order": ["home-collections"]
    }
    ```

    En este ejemplo:
    - `collections_per_page`: Es el `id` (identificador) que el motor buscará dentro de `settings` para determinar el límite de paginación para las colecciones en esta sección.
    - Otros IDs como `products_per_page` se manejarán de manera similar para productos.
    - `type` es el tipo de campo que se va a mostrar en el editor de temas.
    - `id` es el identificador del campo.
    - `label` es el label del campo.
    - `default` es el valor por defecto del campo.

    **Importante:** Para cada tipo de recurso (ej. productos, colecciones) en una página, solo se debe definir **un único límite de paginación**. Si defines, por ejemplo, `products_per_page` en varias secciones de la misma página, el motor priorizará el último valor encontrado, lo que puede llevar a resultados inesperados. Es crucial evitar duplicar estas configuraciones para un mismo recurso dentro del mismo archivo JSON de plantilla.

    **Además, solo se permite un único tag `{% paginate %}` por tipo de recurso (productos o colecciones) por página.** Si necesitas mostrar una lista limitada de ítems sin paginación, consulta la guía "Cómo Mostrar un Número Específico de Ítems sin Paginación".

    **¡Importante! Uso de límites pares**: Es crucial que los límites de paginación (ej. `products_per_page`, `collections_per_page`) que configures en el JSON de tu plantilla sean **números pares**. Esto se debe a una limitación conocida en la paginación con `nextToken` en Amplify Gen 2, que puede causar que el botón "Siguiente" aparezca incorrectamente en la última página si se usan límites impares.

- **`order`**: Un array de strings que define el orden exacto en que se renderizarán las secciones.
  - **Es un campo obligatorio**: Cada plantilla `.json` debe tener un array `order`, incluso si solo contiene un elemento.
  - Los strings en el array deben corresponder a las claves (identificadores únicos) definidas en el objeto `sections`.
  - Este campo es especialmente poderoso en `templates/index.json`, donde normalmente se combinan múltiples secciones para construir la página de inicio.

**Importante:** El motor solo soporta **un nivel de subcarpetas** para la organización de archivos. No puedes crear carpetas dentro de otras carpetas en directorios como `/sections` o `/snippets`. Por ejemplo, la ruta `sections/product/details/info.liquid` no es válida.

- **`sections/*.liquid`**: Son los bloques de construcción de tu tema. Cada archivo de sección es un componente independiente que contiene su propio HTML (Liquid), estilos (`{% style %}`) y JavaScript (`{% javascript %}`). Además, definen su propia configuración a través de la etiqueta `{% schema %}`.

- **`config/settings_schema.json`**: Define la configuración global del tema que los comerciantes pueden modificar en el editor de temas (por ejemplo: colores, tipografía, etc.).

## 3. El Flujo de Renderizado Completo

Comprender cómo Fasttify renderiza una página es clave para un desarrollo eficiente. El proceso sigue un pipeline claro que involucra múltiples componentes trabajando en conjunto:

### 3.1. Pipeline de Renderizado (Técnico)

El `dynamic-page-renderer.ts` es el motor que orquesta todo el proceso. Sigue estos pasos:

1. **Resolución de Ruta**: Cuando un usuario visita una URL, el motor la mapea a un tipo de página específico (ej. `/products/mi-producto` se convierte en `pageType: 'product'`).

2. **Análisis de Plantillas**: El motor analiza los archivos `.json` y `.liquid` requeridos para esa página (layout, secciones, snippets) y determina qué datos necesita para renderizarla (ej. el objeto `product`, una colección específica, etc.).

3. **Carga de Datos**: Basándose en el análisis, el motor consulta la base de datos para obtener toda la información necesaria en paralelo, optimizando los tiempos de carga.

4. **Construcción de Contexto**: Todos los datos cargados (información de la tienda, productos, navegación, etc.) se agrupan en un **contexto** global que se hace accesible a través de Liquid.

5. **Renderizado de Secciones**: Si la plantilla es de tipo JSON, el motor renderiza cada sección definida en el archivo, inyectando los datos y configuraciones correspondientes.

6. **Renderizado del Layout**: El contenido generado en el paso anterior se inyecta en el `layout/theme.liquid` a través de la variable `content_for_layout`.

7. **Inyección de Assets**: El CSS y JavaScript de todas las secciones renderizadas (definido en las etiquetas `{% style %}` y `{% javascript %}`) se recolectan, combinan e inyectan en el `<head>` y antes del cierre del `</body>` respectivamente.

### 3.2. Cómo Funciona `theme.liquid` (El Layout Principal)

El archivo `layout/theme.liquid` es el **wrapper principal** de todas las páginas de tu tienda. Actúa como el esqueleto HTML que envuelve todo el contenido dinámico.

#### 🔧 **Variables Especiales Inyectadas Automáticamente**

El motor inyecta automáticamente estas variables especiales en tu `theme.liquid`:

```liquid
<html lang="{{ shop.locale }}">
<head>
  <!-- Tu contenido del head aquí -->

  <!-- ⚡ CONTENIDO AUTOMÁTICO DEL MOTOR -->
  {{ content_for_header }}
  <!-- Aquí se inyecta automáticamente:
       - Meta tags SEO generados
       - CSS recolectado de todas las etiquetas {% style %}
       - Enlaces a archivos CSS externos
       - Scripts de inicialización del tema
  -->
</head>

<body>
  <!-- Tu header, navegación, etc. -->

  <!-- ⚡ CONTENIDO PRINCIPAL DE LA PÁGINA -->
  {{ content_for_layout }}
  <!-- Aquí se inyecta automáticamente:
       - El contenido renderizado de tu template (index.json, product.json, etc.)
       - Las secciones procesadas con sus datos
       - El HTML final de la página específica
  -->

  <!-- Tu footer, scripts, etc. -->

  <!-- ⚡ JAVASCRIPT AUTOMÁTICO DEL MOTOR -->
  <!-- Aquí se inyecta automáticamente al final del </body>:
       - JavaScript recolectado de todas las etiquetas {% javascript %}
       - Scripts de funcionalidad del tema
       - Código de seguimiento y analytics
  -->
</body>
</html>
```

#### 🎯 **¿Cómo se Genera el Contenido?**

**Para `content_for_header`:**

- El motor recolecta todos los CSS de las etiquetas `{% style %}` de las secciones renderizadas
- Combina todo el CSS en un solo `<style>` tag
- Agrega meta tags SEO basados en la página actual
- Inyecta scripts de inicialización necesarios

**Para `content_for_layout`:**

- Si la página usa un template JSON (ej. `index.json`), renderiza todas las secciones en orden
- Si la página usa un template Liquid directo (ej. `404.liquid`), renderiza ese template
- Procesa todas las variables Liquid con los datos del contexto
- Genera el HTML final de la página

### 3.3. Ejemplo Práctico: Renderizando la Página de Inicio

Supongamos que un usuario visita la página de inicio. Esto es lo que sucede:

#### **Paso 1: Análisis del Template**

```json
// templates/index.json
{
  "sections": {
    "banner": {
      "type": "sections/banner",
      "settings": {
        "title": "Bienvenido a nuestra tienda",
        "background_color": "#f0f0f0"
      }
    },
    "featured-products": {
      "type": "sections/product-grid",
      "settings": {
        "products_to_show": 8
      }
    }
  },
  "order": ["banner", "featured-products"]
}
```

#### **Paso 2: Renderizado de Secciones**

**Banner Section:**

```liquid
<!-- sections/banner.liquid -->
<section class="banner">
  <h1>{{ section.settings.title }}</h1>
</section>

{% style %}
  .banner {
    background-color: {{ section.settings.background_color }};
    padding: 60px 0;
  }
  .banner h1 {
    font-size: 48px;
    text-align: center;
  }
{% endstyle %}
```

**Product Grid Section:**

```liquid
<!-- sections/product-grid.liquid -->
<section class="product-grid">
  {% for product in products limit: section.settings.products_to_show %}
    <div class="product-card">
      <h3>{{ product.title }}</h3>
      <p>{{ product.price | money }}</p>
    </div>
  {% endfor %}
</section>

{% style %}
  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
{% endstyle %}
```

#### **Paso 3: Inyección en theme.liquid**

El motor combina todo y genera:

```html
<!-- El HTML final que ve el usuario -->
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Mi Tienda</title>

    <!-- CONTENT_FOR_HEADER - Generado automáticamente -->
    <style data-fasttify-assets="true">
      .banner {
        background-color: #f0f0f0;
        padding: 60px 0;
      }
      .banner h1 {
        font-size: 48px;
        text-align: center;
      }
      .product-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
      }
    </style>
  </head>

  <body>
    <header><!-- Tu header aquí --></header>

    <!-- CONTENT_FOR_LAYOUT - Generado automáticamente -->
    <section class="banner">
      <h1>Bienvenido a nuestra tienda</h1>
    </section>

    <section class="product-grid">
      <div class="product-card">
        <h3>Producto 1</h3>
        <p>$25.000</p>
      </div>
      <!-- Más productos... -->
    </section>

    <footer><!-- Tu footer aquí --></footer>
  </body>
</html>
```

### 3.4. Flujo de Assets (CSS y JavaScript)

Una de las características más potentes del motor es la **recolección automática de assets**:

#### **📦 Recolección de CSS**

1. Durante el renderizado, cada `{% style %}` en las secciones se procesa
2. Las variables Liquid se evalúan (ej. `{{ section.settings.color }}`)
3. Todo el CSS se recolecta en el `AssetCollector`
4. Se combina en un solo bloque CSS
5. Se inyecta en el `<head>` vía `content_for_header`

#### **⚡ Recolección de JavaScript**

1. Cada `{% javascript %}` en las secciones se procesa
2. Las variables Liquid se evalúan
3. Todo el JS se recolecta en el `AssetCollector`
4. Se combina en un solo bloque JavaScript
5. Se inyecta antes del `</body>`

#### **🎯 Ventajas de Este Sistema**

- **Rendimiento**: Un solo request de CSS y JS, sin archivos múltiples
- **Dinámico**: El CSS puede usar variables de configuración del tema
- **Modular**: Cada sección mantiene su CSS/JS encapsulado
- **Automático**: No necesitas importar manualmente archivos CSS/JS

### 3.5. Debugging del Flujo de Renderizado

Si algo no funciona correctamente, puedes debuggear cada paso:

1. **Verificar el template JSON**: ¿Están las secciones bien definidas?
2. **Revisar las secciones Liquid**: ¿Tienen sintaxis correcta?
3. **Comprobar los datos**: ¿Están disponibles los objetos que usas (product, collection, etc.)?
4. **Assets**: ¿Se están recolectando e inyectando los CSS/JS?
5. **Layout final**: ¿Se están inyectando `content_for_header` y `content_for_layout`?

El motor incluye logging detallado que te ayudará a identificar problemas en cada paso.

## 4. Métodos de Carga de CSS y JavaScript

Fasttify ofrece múltiples formas de incluir estilos y scripts en tu tema. Cada método tiene sus ventajas y casos de uso específicos.

### 4.1. Comparación de Métodos

| Método                                            | Ubicación Final             | Dinámico | Caso de Uso                                    |
| ------------------------------------------------- | --------------------------- | -------- | ---------------------------------------------- |
| `{% style %}`                                     | `<head>` (combinado)        | ✅ Sí    | CSS específico de sección con variables Liquid |
| `{{ 'file.css' \| asset_url \| stylesheet_tag }}` | Donde se coloque            | ❌ No    | CSS estático grande, reutilizable              |
| CSS en `theme.liquid`                             | `<head>`                    | ❌ No    | CSS global base del tema                       |
| `{% javascript %}`                                | Antes `</body>` (combinado) | ✅ Sí    | JS específico de sección con variables Liquid  |
| `{{ 'file.js' \| asset_url \| script_tag }}`      | Donde se coloque            | ❌ No    | JS estático grande, librerías                  |

### 4.2. Método 1: `{% style %}` - CSS Dinámico de Sección

**✅ Úsalo cuando:**

- El CSS es específico para una sección
- Necesitas usar variables Liquid: `{{ section.settings.color }}`
- El CSS cambia según la configuración del usuario
- Quieres mantener los estilos encapsulados con la sección

```liquid
<!-- sections/banner.liquid -->
<section class="banner" style="background: url({{ section.settings.image }})">
  <h1 class="banner-title">{{ section.settings.title }}</h1>
</section>

{% style %}
  .banner {
    background-color: {{ section.settings.background_color }};
    padding: {{ section.settings.padding_top }}px 0 {{ section.settings.padding_bottom }}px;
    text-align: {{ section.settings.text_alignment }};
  }

  .banner-title {
    color: {{ section.settings.text_color }};
    font-size: {{ section.settings.title_size }}px;
  }

  @media (max-width: 768px) {
    .banner {
      padding: {{ section.settings.mobile_padding }}px 0;
    }
  }
{% endstyle %}
```

**🎯 Ventajas:**

- CSS se inyecta automáticamente en el `<head>`
- Variables Liquid se procesan dinámicamente
- CSS se combina con otras secciones (mejor rendimiento)
- Mantenimiento fácil (CSS junto con HTML)

**⚠️ Limitaciones:**

- Solo para CSS específico de sección
- No debe usarse para CSS muy grande (>500 líneas)

### 4.3. Método 2: `asset_url | stylesheet_tag` - CSS Estático

**✅ Úsalo cuando:**

- CSS estático grande sin variables Liquid
- CSS reutilizable en múltiples secciones/páginas
- Librerías CSS de terceros
- CSS que no cambia según configuración

```liquid
<!-- En cualquier archivo .liquid -->
{{ 'product-grid.css' | asset_url | stylesheet_tag }}
{{ 'slick-carousel.css' | asset_url | stylesheet_tag }}
```

**Ubicación recomendada:**

```liquid
<!-- layout/theme.liquid en el <head> -->
<head>
  <!-- CSS global del tema -->
  {{ 'theme.css' | asset_url | stylesheet_tag }}
  {{ 'header.css' | asset_url | stylesheet_tag }}

  <!-- CSS condicional por tipo de página -->
  {% if template contains 'product' %}
    {{ 'product-page.css' | asset_url | stylesheet_tag }}
  {% endif %}

  {% if template contains 'collection' %}
    {{ 'collection-grid.css' | asset_url | stylesheet_tag }}
  {% endif %}
</head>
```

**🎯 Ventajas:**

- Archivos CSS separados (mejor organización)
- Cache del navegador para archivos estáticos
- Fácil mantenimiento de CSS grande
- Reutilizable en múltiples lugares

**⚠️ Consideraciones:**

- Request HTTP adicional (aunque se cachea)
- No puede usar variables Liquid
- Ubicación en el DOM depende de dónde lo coloques

### 4.4. Método 3: `{% javascript %}` - JavaScript Dinámico

**✅ Úsalo cuando:**

- JavaScript específico para una sección
- Necesitas usar variables Liquid en el JS
- Funcionalidad que depende de configuración de sección

```liquid
<!-- sections/image-slider.liquid -->
<div class="slider" id="slider-{{ section.id }}">
  {% for image in section.settings.images %}
    <div class="slide">
      <img src="{{ image | img_url: '800x600' }}" alt="Slide {{ forloop.index }}">
    </div>
  {% endfor %}
</div>

{% javascript %}
  document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('slider-{{ section.id }}');
    const autoplay = {{ section.settings.autoplay | json }};
    const speed = {{ section.settings.slide_speed | default: 3000 }};

    if (autoplay) {
      setInterval(function() {
        // Lógica del slider aquí
      }, speed);
    }

    // Event listeners específicos para esta instancia
    slider.addEventListener('click', function(e) {
      if (e.target.classList.contains('slide')) {
        console.log('Clicked slide in section {{ section.id }}');
      }
    });
  });
{% endjavascript %}
```

**🎯 Ventajas:**

- Variables Liquid disponibles en JavaScript
- Se inyecta automáticamente antes del `</body>`
- Scoped a la sección específica
- Se combina con otros scripts

### 4.5. Método 4: `asset_url | script_tag` - JavaScript Estático

**✅ Úsalo cuando:**

- Librerías JavaScript de terceros
- Scripts globales del tema
- JavaScript grande sin variables Liquid

```liquid
<!-- layout/theme.liquid antes del </body> -->
<body>
  <!-- Tu contenido aquí -->

  <!-- Scripts globales -->
  {{ 'cart-functionality.js' | asset_url | script_tag }}
  {{ 'theme-utilities.js' | asset_url | script_tag }}

  <!-- Scripts condicionales -->
  {% if template == 'product' %}
    {{ 'product-variants.js' | asset_url | script_tag }}
  {% endif %}
</body>
```

### 4.6. Estrategia Recomendada: Híbrida

Para obtener el mejor rendimiento y mantenibilidad, usa una **estrategia híbrida**:

#### **En `layout/theme.liquid`:**

```liquid
<head>
  <!-- CSS base global -->
  {{ 'theme.css' | asset_url | stylesheet_tag }}
  {{ 'header.css' | asset_url | stylesheet_tag }}

  <!-- CSS condicional por tipo de página -->
  {% if template contains 'product' %}
    {{ 'product-page.css' | asset_url | stylesheet_tag }}
  {% endif %}

  <!-- CSS dinámico se inyecta automáticamente aquí -->
  {{ content_for_header }}
</head>

<body>
  {{ content_for_layout }}

  <!-- Scripts globales -->
  {{ 'theme-core.js' | asset_url | script_tag }}

  <!-- JavaScript dinámico se inyecta automáticamente aquí -->
</body>
```

#### **En cada sección:**

```liquid
<!-- sections/custom-section.liquid -->
<section class="custom-section">
  <!-- HTML de la sección -->
</section>

{% style %}
  /* Solo CSS específico con variables Liquid */
  .custom-section {
    background: {{ section.settings.bg_color }};
    padding: {{ section.settings.padding }}px;
  }
{% endstyle %}

{% javascript %}
  // Solo JS específico con variables Liquid
  const sectionId = '{{ section.id }}';
  const settings = {{ section.settings | json }};
  // Lógica específica aquí
{% endjavascript %}
```

### 4.7. ⚡ Optimización de Rendimiento

**Para CSS:**

- Usa `{% style %}` para CSS pequeño y dinámico (<200 líneas)
- Usa archivos externos para CSS grande y estático (>200 líneas)
- Agrupa CSS relacionado en un solo archivo
- Carga CSS condicional solo cuando sea necesario

**Para JavaScript:**

- Usa `{% javascript %}` para funcionalidad específica de sección
- Usa archivos externos para librerías y utilidades globales
- Evita JavaScript inline en HTML
- Carga scripts de forma asíncrona cuando sea posible

**Resultado:** Menos requests HTTP, mejor cache, CSS/JS optimizado automáticamente.

## 5. Contexto Global de Liquid

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

## 6. Objetos Específicos por Página

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

## 7. Filtros Liquid Personalizados

Hemos añadido una serie de filtros a Liquid para facilitar el desarrollo.

### `asset_url`

Genera la URL para un archivo en la carpeta `assets`.
**Ejemplo:** `{{ 'theme.css' | asset_url }}`

### `money`

Formatea un número como precio con el símbolo de la moneda.
**Ejemplo:** `{{ product.price | money }}`

### `money_without_currency`

Formatea un número como precio sin el símbolo de la moneda.
**Ejemplo:** `{{ product.price | money_without_currency }}`

### `img_url`

Genera una URL optimizada para una imagen.
**Ejemplo:** `{{ product.featured_image | img_url: '400x' }}`

### `handleize`

Convierte un string a un formato "handle" (minúsculas, guiones).
**Ejemplo:** `{{ 'Mi Título' | handleize }}`

### `date`

Formatea una fecha.
**Ejemplo:** `{{ article.published_at | date: '%d %b, %Y' }}`

### `stylesheet_tag`

Genera una etiqueta `<link>` para una hoja de estilos.
**Ejemplo:** `{{ 'theme.css' | asset_url | stylesheet_tag }}`

### `script_tag`

Genera una etiqueta `<script>` para un archivo JavaScript.
**Ejemplo:** `{{ 'theme.js' | asset_url | script_tag }}`

### `product_url`

Genera la URL para un producto.
**Ejemplo:** `{{ product | product_url }}`

### `collection_url`

Genera la URL para una colección.
**Ejemplo:** `{{ collection | collection_url }}`

## 8. Tags Liquid Personalizados

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
Ahora, la etiqueta `{% paginate %}` **es pasiva y ya no requiere la cláusula `by number`**. La cantidad de ítems por página se define en el `schema` del template JSON (por ejemplo, en `templates/collection.json` o en la sección que contenga la lista de productos/colecciones).

**Solo se permite un único tag `{% paginate %}` por tipo de recurso (productos o colecciones) por página.** Si necesitas mostrar una lista limitada de ítems sin paginación, consulta la guía "Cómo Mostrar un Número Específico de Ítems sin Paginación".

Puedes usar el filtro `default_pagination` para mostrar el paginador de manera predeterminada, o acceder directamente al objeto `paginate` para construir un paginador personalizado.

**Ejemplo: Paginación personalizada de productos**

```liquid
{% paginate collection.products %}
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

### `{% form 'type', object %}`

Crea formularios HTML con los atributos y campos ocultos necesarios.

- **Tipos soportados**: `product`, `contact`, `newsletter`, `login`, `register`.

```liquid
{% form 'product', product %}
  <input type="hidden" name="id" value="{{ product.variants.first.id }}">
  <button type="submit">Agregar al carrito</button>
{% endform %}
```

## 9. Arquitectura Interna del Motor (Para Desarrolladores Avanzados)

Esta sección explica cómo funciona internamente el motor de renderizado, útil para debugging y desarrollo avanzado.

### 9.1. Componentes del Motor

El sistema está compuesto por varios módulos especializados:

#### **🔄 `dynamic-page-renderer.ts` - El Orquestador Principal**

Es el motor central que coordina todo el proceso de renderizado:

```typescript
// Pipeline de renderizado en 8 pasos
const renderingPipeline: RenderStep[] = [
  resolveStoreStep, // 1. Resuelve dominio → tienda
  initializeEngineStep, // 2. Inicializa AssetCollector
  loadDataStep, // 3. Carga datos en paralelo
  buildContextStep, // 4. Construye contexto Liquid
  renderContentStep, // 5. Renderiza secciones
  renderLayoutStep, // 6. Aplica layout principal
  generateMetadataStep, // 7. Genera metadata SEO
];
```

#### **`AssetCollector` - Recolector de CSS/JS**

Recolecta y combina todos los assets de las secciones:

```typescript
// Cada vez que se renderiza una sección con {% style %}
assetCollector.addCss(processedCSS, sectionId);

// Al final del renderizado
const combinedCSS = assetCollector.getCombinedCss();
// Se inyecta en <head> vía content_for_header
```

#### **`LiquidEngine` - Motor de Templates**

Procesa todo el Liquid con extensiones personalizadas:

```typescript
// Registra tags personalizados
this.liquid.registerTag('style', StyleTag);
this.liquid.registerTag('javascript', JavaScriptTag);
this.liquid.registerTag('section', SectionTag);

// Registra filtros personalizados
this.liquid.registerFilter('money', moneyFilter);
this.liquid.registerFilter('asset_url', assetUrlFilter);
```

### 9.2. Flujo de Datos Detallado

#### **Paso 1: Análisis de Template**

```
URL: /products/mi-producto
↓
pageType: 'product'
↓
Template: templates/product.json
↓
Análisis: ¿Qué secciones y datos necesito?
```

#### **Paso 2: Carga de Datos (Paralela)**

```javascript
// El motor determina qué datos necesita y los carga en paralelo
Promise.all([loadProduct(productId), loadRelatedProducts(productId), loadStoreMenus(storeId), loadLayout(storeId)]);
```

#### **Paso 3: Construcción de Contexto**

```javascript
// Combina todos los datos en un contexto global
const context = {
  shop: storeData,
  product: productData,
  collections: collectionsData,
  linklists: menuData,
  // + datos específicos de la página
};
```

#### **Paso 4: Renderizado de Secciones**

```javascript
// Para cada sección en el template JSON
for (const sectionId of templateConfig.order) {
  const sectionConfig = templateConfig.sections[sectionId];

  // 1. Cargar archivo .liquid de la sección
  const sectionTemplate = await loadTemplate(sectionConfig.type);

  // 2. Renderizar con contexto + settings específicos
  const renderedHTML = await liquidEngine.render(sectionTemplate, {
    ...context,
    section: {
      id: sectionId,
      settings: sectionConfig.settings,
    },
  });

  // 3. Durante el renderizado, {% style %} y {% javascript %}
  //    automáticamente agregan CSS/JS al AssetCollector
}
```

#### **Paso 5: Inyección en Layout**

```javascript
// Combinar todo el contenido renderizado
const pageContent = renderedSections.join('\n');

// Renderizar layout principal
const finalHTML = await liquidEngine.render(layoutTemplate, {
  ...context,
  content_for_layout: pageContent,
  content_for_header: generateHeaders(),
});

// Inyectar assets recolectados
const htmlWithAssets = injectAssets(finalHTML, assetCollector);
```

### 9.3. Debugging del Motor

#### **🔍 Logs de Debug**

El motor incluye logging detallado en cada paso. Puedes seguir el proceso completo:

```bash
# Logs típicos durante el renderizado
[DynamicPageRenderer] Starting render for product page
[TemplateLoader] Loading template: sections/product-details.liquid
[StyleTag] Parsed CSS content: .product-title { color: #333...
[AssetCollector] Added CSS asset: css-product-details, length: 1250
[AssetCollector] Combined CSS from 3 assets, total length: 4520
[DynamicPageRenderer] CSS injected successfully
```

#### **Puntos de Debugging Comunes**

**1. ¿No se cargan los datos?**

```javascript
// Verificar en buildContextStep
console.log('Context data:', Object.keys(context));
```

**2. ¿No se inyecta el CSS?**

```javascript
// Verificar en AssetCollector
console.log('CSS assets collected:', assetCollector.cssAssets.length);
console.log('Combined CSS length:', assetCollector.getCombinedCss().length);
```

**3. ¿No funciona una sección?**

```javascript
// Verificar el JSON del template
console.log('Template config:', templateConfig);
console.log('Section order:', templateConfig.order);
```

### 9.4. Variables de Inyección Automática

El motor inyecta automáticamente estas variables en todos los templates:

#### **En `content_for_header`:**

```html
<!-- Meta tags SEO -->
<meta name="description" content="..." />
<meta property="og:title" content="..." />

<!-- CSS combinado de todas las secciones -->
<style data-fasttify-assets="true">
  /* CSS de section 1 */
  .banner {
    background: #f0f0f0;
  }

  /* CSS de section 2 */
  .product-grid {
    display: grid;
  }

  /* etc... */
</style>

<!-- Otros headers necesarios -->
```

#### **En `content_for_layout`:**

```html
<!-- Contenido renderizado de las secciones en orden -->
<section class="banner">...</section>
<section class="product-grid">...</section>
<section class="footer">...</section>
```

#### **Antes del `</body>`:**

```html
<!-- JavaScript combinado de todas las secciones -->
<script data-fasttify-assets="true">
  // JS de section 1
  const banner = document.getElementById('banner-abc123');

  // JS de section 2
  const productGrid = document.querySelector('.product-grid');

  // etc...
</script>
```

### 9.5. Optimizaciones del Motor

#### **⚡ Carga Paralela**

- Todos los datos se cargan en paralelo (productos, menús, layout)
- Las secciones se analizan antes de cargar datos
- Requests optimizados según las necesidades reales

#### **🗄️ Cache Inteligente**

- Templates se cachean en memoria
- Contextos se reutilizan cuando es posible
- Assets se combinan para reducir requests

#### **🔄 Renderizado Eficiente**

- Solo se renderizan las secciones que realmente se usan
- CSS/JS se combina automáticamente
- HTML se genera una sola vez por request

### 9.6. Extendiendo el Motor

Si necesitas agregar funcionalidad personalizada:

#### **Nuevo Filtro Liquid:**

```typescript
// En liquid/filters/
export const customFilter: LiquidFilter = {
  name: 'my_custom_filter',
  filter: (input: string) => {
    return input.toUpperCase();
  },
};
```

#### **Nueva Tag Liquid:**

```typescript
// En liquid/tags/
export class CustomTag extends Tag {
  *render(ctx: Context): Generator<any, void, unknown> {
    // Tu lógica aquí
    return `<div>Custom content</div>`;
  }
}
```

#### **Nuevo Tipo de Datos:**

```typescript
// En services/fetchers/
export const customDataFetcher = {
  async loadCustomData(storeId: string) {
    // Tu lógica de carga de datos
    return customData;
  },
};
```

Con esta comprensión del motor interno, puedes debuggear problemas eficientemente y extender la funcionalidad según las necesidades de tu proyecto.

## 10. Buenas Prácticas

- **Modularidad**: Construye tu tema con secciones pequeñas y reutilizables.
- **Rendimiento**: Utiliza el filtro `img_url` para optimizar imágenes. Minimiza el uso de JavaScript pesado.
- **CSS**: Escribe todo el CSS de las secciones dentro de etiquetas `{% style %}` para mantenerlo encapsulado y mejorar el rendimiento.
- **Nomenclatura**: Sigue una convención clara para tus clases CSS (ej. BEM) para evitar colisiones.
- **Accesibilidad**: Asegúrate de que tu tema sea accesible, utilizando HTML semántico y atributos ARIA cuando sea necesario.
- **Evita la lógica compleja en Liquid**: Liquid es para renderizar. La lógica de negocio compleja debe estar en el motor.

---

## Resumen Ejecutivo para Desarrolladores

### Lo Más Importante que Debes Saber

1. **`theme.liquid` es tu esqueleto base** - Todo el contenido se inyecta automáticamente aquí
2. **`{% style %}` y `{% javascript %}` son automáticos** - Se recolectan e inyectan sin que hagas nada
3. **Los templates JSON definen la estructura** - Compones páginas usando secciones
4. **El motor carga datos inteligentemente** - Analiza tus templates y carga solo lo necesario

### Flujo de Trabajo Recomendado

#### **Para temas nuevos:**

```bash
1. Crear layout/theme.liquid (esqueleto HTML)
2. Crear templates/*.json (estructura de páginas)
3. Crear sections/*.liquid (componentes modulares)
4. Usar {% style %} para CSS dinámico
5. Usar {{ 'file.css' | asset_url | stylesheet_tag }} para CSS estático grande
```

#### **Para debugging:**

```bash
1. Verificar que el template JSON esté bien formado
2. Comprobar que las secciones existen y tienen sintaxis correcta
3. Revisar que los datos necesarios estén disponibles en el contexto
4. Verificar que los assets CSS/JS se estén recolectando
5. Confirmar que content_for_header y content_for_layout se inyecten
```

### ⚡ Decisiones Rápidas de CSS/JS

| **¿Qué necesitas?**                                       | **Usa esto**                                      | **Ubicación**   |
| --------------------------------------------------------- | ------------------------------------------------- | --------------- |
| CSS con variables Liquid (`{{ section.settings.color }}`) | `{% style %}`                                     | En la sección   |
| CSS estático grande (>200 líneas)                         | `{{ 'file.css' \| asset_url \| stylesheet_tag }}` | En theme.liquid |
| JS con variables Liquid                                   | `{% javascript %}`                                | En la sección   |
| Librerías JS estáticas                                    | `{{ 'file.js' \| asset_url \| script_tag }}`      | En theme.liquid |

### 🔧 Variables Mágicas del Motor

Estas variables se inyectan automáticamente - **no las definas tú**:

- `{{ content_for_header }}` → CSS combinado + meta tags SEO
- `{{ content_for_layout }}` → Contenido de la página renderizada
- `{{ shop }}` → Información de la tienda
- `{{ cart }}` → Carrito del usuario
- `{{ collections }}` → Colecciones de la tienda
- `{{ products }}` → Productos destacados
- `{{ linklists }}` → Menús de navegación

### 📁 Estructura de Archivos Esencial

```
theme/
├── layout/
│   └── theme.liquid           ← Esqueleto principal
├── templates/
│   ├── index.json             ← Página de inicio
│   ├── product.json           ← Página de producto
│   └── collection.json        ← Página de colección
├── sections/
│   ├── banner.liquid          ← Componente banner
│   ├── product-grid.liquid    ← Componente grid productos
│   └── footer.liquid          ← Componente footer
├── snippets/
│   └── product-card.liquid    ← Fragmento reutilizable
└── assets/
    ├── theme.css              ← CSS global
    └── theme.js               ← JS global
```

### Anatomía de una Sección Perfecta

```liquid
<!-- sections/mi-seccion.liquid -->

<!-- 1. HTML con variables Liquid -->
<section class="mi-seccion">
  <h2>{{ section.settings.title }}</h2>
  <p style="color: {{ section.settings.text_color }}">
    {{ section.settings.description }}
  </p>
</section>

<!-- 2. CSS dinámico con variables -->
{% style %}
  .mi-seccion {
    background: {{ section.settings.background_color }};
    padding: {{ section.settings.padding }}px;
  }

  @media (max-width: 768px) {
    .mi-seccion {
      padding: {{ section.settings.mobile_padding }}px;
    }
  }
{% endstyle %}

<!-- 3. JavaScript dinámico con variables -->
{% javascript %}
  document.addEventListener('DOMContentLoaded', function() {
    const section = document.querySelector('.mi-seccion');
    const autoplay = {{ section.settings.autoplay | json }};

    if (autoplay) {
      // Tu lógica aquí
    }
  });
{% endjavascript %}

<!-- 4. Configuración de la sección -->
{% schema %}
{
  "name": "Mi Sección",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Título",
      "default": "Mi título por defecto"
    },
    {
      "type": "color",
      "id": "background_color",
      "label": "Color de fondo",
      "default": "#ffffff"
    }
  ]
}
{% endschema %}
```

### 🚨 Errores Comunes a Evitar

❌ **NO hagas esto:**

```liquid
<!-- Definir content_for_header manualmente -->
{{ content_for_header }} = "Mi CSS"  ❌

<!-- CSS muy grande en {% style %} -->
{% style %}
  /* 500+ líneas de CSS... */  ❌
{% endstyle %}

<!-- JavaScript complejo en templates -->
{% javascript %}
  // Lógica de negocio compleja...  ❌
{% endjavascript %}
```

✅ **SÍ haz esto:**

```liquid
<!-- Usar las variables automáticas -->
{{ content_for_header }}  ✅

<!-- CSS grande en archivos externos -->
{{ 'large-stylesheet.css' | asset_url | stylesheet_tag }}  ✅

<!-- JavaScript simple y específico -->
{% javascript %}
  // Solo funcionalidad específica de la sección  ✅
{% endjavascript %}
```

### 🔍 Troubleshooting Rápido

**"Mi CSS no aparece"**

1. ¿Está usando `{% style %}` dentro de una sección?
2. ¿La sección se está renderizando en el template JSON?
3. ¿Está `{{ content_for_header }}` en theme.liquid?

**"Mi JavaScript no funciona"**

1. ¿Está usando `{% javascript %}` dentro de una sección?
2. ¿Las variables Liquid están bien escritas?
3. ¿El JavaScript se inyecta antes del `</body>`?

**"No veo los datos del producto"**

1. ¿Estás en una página de producto (product.json)?
2. ¿El objeto `product` está disponible en esa plantilla?
3. ¿La sintaxis Liquid es correcta (`{{ product.title }}`)?

Con esta guía, tienes todo lo que necesitas para crear temas potentes y eficientes en Fasttify. El motor se encarga de la complejidad técnica, tú te enfocas en crear experiencias increíbles.
