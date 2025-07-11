# Estrategia de Paginación para Páginas con Múltiples Secciones

En páginas complejas como la de inicio (`index.json`), es común tener múltiples secciones que muestran listas de productos o colecciones. Sin embargo, nuestro motor de renderizado tiene una regla fundamental sobre la paginación que debe entenderse bien para evitar comportamientos inesperados.

## El Principio Clave: Una Única Fuente de Verdad para la Paginación

Para cada tipo de recurso que desees paginar (por ejemplo, productos o colecciones), **solo puede haber un único tag `{% paginate %}` activo en toda la página**. Esto significa que si tu página de inicio ya tiene una sección que usa `{% paginate products %}`, ninguna otra sección en esa misma página puede usar otro tag `{% paginate products %}`.

### ¿Por qué esta restricción?

El backend de nuestro motor de renderizado está diseñado para cargar los datos paginados de un recurso (ej. productos) con un único límite de paginación y un único `nextToken` (token de paginación) por cada solicitud de página. Si hubiera múltiples tags `{% paginate %}` para el mismo recurso, entrarían en conflicto sobre qué límite usar y cómo manejar el `nextToken`, llevando a resultados impredecibles o incorrectos.

El límite de paginación para el recurso principal (el que se está paginando con `{% paginate %}`) se define en el bloque `settings` de la sección principal que lo contiene en el archivo JSON de la plantilla (ej. `products_per_page` en `index.json` o `collection.json`).

## Escenarios Comunes en Páginas con Múltiples Secciones

Consideremos una página de inicio (`templates/index.json`) con varias secciones que necesitan mostrar productos:

### Escenario 1: Una Sección Contiene la Paginación Principal de un Recurso

Supongamos que tienes una sección, por ejemplo, `sections/all-products-grid.liquid`, cuyo propósito es mostrar una lista completa de productos con controles de paginación (Siguiente/Anterior).

- **Esta sección DEBE usar el tag `{% paginate products %}`**.
- El límite de productos por página (ej. `products_per_page`) para esta paginación se debe definir en los `settings` de esta sección en tu archivo `index.json`.

  **Ejemplo en `templates/index.json` (para la sección principal de paginación de productos):**

  ```json
  {
    "sections": {
      "main-product-pagination": {
        "type": "sections/all-products-grid",
        "settings": {
          "type": "number",
          "id": "products_per_page",
          "label": "Products per page",
          "default": 12
        }
      }
    },
    "order": ["main-product-pagination"]
  }
  ```

### Escenario 2: Otras Secciones Muestran el MISMO Recurso, pero Sin Paginación

Ahora, imagina que en la misma página de inicio, también quieres tener una sección de "Productos Destacados" (`sections/featured-products.liquid`) que muestre solo los primeros 4 productos, sin controles de paginación.

- **Esta sección NO DEBE usar el tag `{% paginate products %}`.**
- En su lugar, debe utilizar un bucle `{% for %}` con el filtro `limit` para obtener un número específico de productos.
- Los productos se accederán a través del objeto global `products` (o `collection.products` si estás en una página de colección).

  **Ejemplo en `sections/featured-products.liquid` (para una sección sin paginación):**

  ```liquid
  {% comment %}
    sections/featured-products.liquid
    Esta sección muestra un número limitado de productos sin paginación.
  {% endcomment %}

  <div class="featured-products">
    <h2>Productos Destacados</h2>
    <div class="product-list">
      {% for product in products limit: 4 %}
        {% render 'product-card', product: product %}
      {% endfor %}
    </div>
  </div>
  ```

  (Para más detalles sobre esta técnica, consulta: [Cómo Mostrar un Número Específico de Ítems sin Paginación](displaying-limited-items.md))

### Escenario 3: Paginación para Diferentes Tipos de Recursos

Si tu página necesita paginar tanto productos como colecciones (lo cual es menos común en una misma página, pero posible):

- Puedes tener un tag `{% paginate products %}` en una sección (con su `products_per_page` definido en el JSON de esa sección).
- Y también un tag `{% paginate collections %}` en OTRA sección (con su `collections_per_page` definido en el JSON de esa sección).

  **La clave es que solo haya un tag `{% paginate %}` por TIPO de recurso.**

## Cómo Identificar el Tag `{% paginate %}` Principal

Para los desarrolladores de temas, es fundamental:

1.  **Designar una única sección** en el JSON de la plantilla como la "sección de paginación principal" para productos y otra para colecciones (si aplica).
2.  **Documentar claramente** qué sección es responsable de la paginación para cada tipo de recurso en la plantilla.

## Ejemplo Completo en `templates/index.json` (Estrategia Mixta)

Este ejemplo ilustra cómo podrías configurar tu `index.json` para tener una sección de productos paginada y otra de productos destacados no paginada:

```json
{
  "sections": {
    "hero-banner": {
      "type": "sections/hero-banner",
      "settings": {
        "title": "Bienvenido a Nuestra Tienda"
      }
    },
    "featured-products": {
      "type": "sections/featured-products-limited",
      "settings": {
        "title": "Nuestros Favoritos"
      }
    },
    "all-products": {
      "type": "sections/all-products-grid",
      "settings": {
        "title": "Explora Todos los Productos",
        "type": "number",
        "id": "products_per_page",
        "label": "Products per page",
        "default": 8
      }
    },
    "latest-collections": {
      "type": "sections/latest-collections-limited",
      "settings": {
        "title": "Últimas Colecciones"
      }
    }
  },
  "order": ["hero-banner", "featured-products", "all-products", "latest-collections"]
}
```

En este `index.json`:

- `all-products` es la sección designada para la paginación de productos (tiene `products_per_page`). Su archivo Liquid (`sections/all-products-grid.liquid`) contendría el tag `{% paginate products %}`.
- `featured-products` es una sección que muestra productos, pero no los pagina. Su archivo Liquid (`sections/featured-products-limited.liquid`) usaría un bucle `{% for product in products limit: X %}`.
- `latest-collections` muestra colecciones, probablemente con un bucle `{% for collection in collections limit: Y %}`.

## Conclusión

Al diseñar tus plantillas, siempre ten en cuenta la regla de **"un solo tag `{% paginate %}` por tipo de recurso por página"**. Para mostrar subconjuntos de ítems sin paginación completa, utiliza los bucles `{% for %}` con el filtro `limit` en las secciones apropiadas. Esta estrategia asegura que tu paginación funcione de manera predecible y que tu código Liquid sea claro y eficiente.
