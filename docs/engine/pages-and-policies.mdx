# Guía de Páginas y Políticas

Esta guía explica cómo trabajar con páginas de contenido (como "Sobre nosotros" o "Contacto") y la funcionalidad especial de páginas de políticas (Términos de Servicio, Política de Privacidad, etc.) en los temas de Fasttify.

## 1. El Objeto `page`

Cuando un visitante se encuentra en la URL de una página estándar (por ejemplo, `/pages/about-us`), tienes acceso al objeto `page` en tus plantillas Liquid. Este objeto contiene toda la información de la página que se está visualizando.

| Propiedad   | Tipo     | Descripción                                         |
| :---------- | :------- | :-------------------------------------------------- |
| `title`     | `String` | El título de la página.                             |
| `content`   | `String` | El contenido de la página, que puede incluir HTML.  |
| `createdAt` | `String` | La fecha de creación de la página en formato ISO.   |
| `updatedAt` | `String` | La fecha de la última actualización en formato ISO. |

**Ejemplo: Crear una plantilla de página básica**

Para renderizar una página estándar, normalmente usarías un archivo `templates/page.json` para definir la estructura y `sections/page-content.liquid` para el contenido.

1.  **`templates/page.json`**:

    ```json
    {
      "sections": {
        "main": {
          "type": "sections/page-content"
        }
      },
      "order": ["main"]
    }
    ```

2.  **`sections/page-content.liquid`**:

    ```liquid
    <article class="page">
      <header class="page-header">
        <h1>{{ page.title }}</h1>
      </header>
      <div class="page-content rte">
        {{ page.content }}
      </div>
    </article>

    {% style %}
      .page {
        max-width: 800px;
        margin: 40px auto;
        padding: 0 20px;
      }
      .page-header {
        margin-bottom: 30px;
        text-align: center;
      }
      .rte { /* Rich Text Editor styles */
        line-height: 1.7;
      }
    {% endstyle %}
    ```

## 2. Acceso a Páginas Específicas por Handle

Similar a como funciona con productos y colecciones, puedes acceder a los datos de cualquier página desde cualquier parte de tu tema usando su `handle`. Esto es extremadamente útil para menús, pies de página o secciones que necesitan enlazar a contenido específico.

La sintaxis es:

- `{{ pages['el-handle-de-mi-pagina'] }}`
- `{{ pages.el-handle-de-mi-pagina }}`

**Ejemplo Práctico: Enlazar a la página "Sobre Nosotros" en el footer**

```liquid
{% comment %}
  En snippets/footer.liquid o sections/footer.liquid
{% endcomment %}

{% assign about_us_page = pages['about-us'] %}
{% if about_us_page %}
  <a href="{{ about_us_page.url }}">{{ about_us_page.title }}</a>
{% endif %}
```

El motor detectará esta sintaxis y cargará eficientemente los datos de la página `about-us` para que estén disponibles en el renderizado.

---

## 3. La Página Unificada de Políticas

Fasttify ofrece una manera especial y automatizada para manejar las páginas de políticas legales (Términos de Servicio, Política de Privacidad, Política de Devoluciones, etc.).

- Cualquier página que crees en el panel de administración con el `pageType` establecido en `'policies'` se incluirá automáticamente en este sistema.
- Existe una URL dedicada, `/policies`, que agrupa y muestra todas estas páginas de políticas. No necesitas crear rutas o plantillas individuales para cada una.

### El Objeto `policies`

Cuando un usuario visita la URL `/policies`, tu tema obtiene acceso a un objeto Liquid especial llamado `policies`. Este objeto es un **array** que contiene todos los objetos `page` que han sido marcados como políticas.

```liquid
{% comment %}
  En la ruta /policies, el objeto 'policies' está disponible:
{% endcomment %}

{{ policies }}
<!-- Resultado (ejemplo):
[
  { "title": "Términos de Servicio", "content": "...", "url": "/policies/terms-of-service" },
  { "title": "Política de Privacidad", "content": "...", "url": "/policies/privacy-policy" },
  { "title": "Política de Devoluciones", "content": "...", "url": "/policies/refund-policy" }
]
-->
```

### Cómo Crear un Tema para la Página de Políticas

Para mostrar la página de políticas, solo necesitas dos cosas: un archivo de plantilla JSON y una sección Liquid.

**1. `templates/policies.json`**

Este archivo le indica al motor qué sección debe usar para renderizar la ruta `/policies`.

```json
{
  "sections": {
    "main": {
      "type": "sections/policy-list"
    }
  },
  "order": ["main"]
}
```

**2. `sections/policy-list.liquid` (Ejemplo con Acordeón)**

Aquí es donde diseñas la visualización de las políticas. Un patrón de diseño común y efectivo es un acordeón, donde el título de cada política es un encabezado interactivo que muestra el contenido al hacer clic.

```liquid
<div class="policy-list-container">
  <h1>{{ 'policies.general.title' | t: default: 'Nuestras Políticas' }}</h1>

  {% if policies.size > 0 %}
    <div class="accordion">
      {% for policy in policies %}
        <div class="accordion-item">
          <button class="accordion-header" aria-expanded="false" aria-controls="accordion-content-{{ forloop.index }}">
            <span class="accordion-title">{{ policy.title }}</span>
            <span class="icon-arrow" aria-hidden="true"></span>
          </button>
          <div id="accordion-content-{{ forloop.index }}" class="accordion-content" hidden>
            <div class="rte">
              {{ policy.content }}
            </div>
          </div>
        </div>
      {% endfor %}
    </div>
  {% else %}
    <p>{{ 'policies.general.no_policies' | t: default: 'Aún no se han configurado políticas.' }}</p>
  {% endif %}
</div>

{% style %}
  .policy-list-container {
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
  }
  .accordion-item {
    border-bottom: 1px solid #e5e5e5;
  }
  .accordion-header {
    width: 100%;
    padding: 20px 15px;
    background: none;
    border: none;
    text-align: left;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .accordion-header:hover {
    background-color: #f9f9f9;
  }
  .icon-arrow {
    width: 10px;
    height: 10px;
    border-right: 2px solid #333;
    border-bottom: 2px solid #333;
    transform: rotate(45deg);
    transition: transform 0.2s ease-in-out;
  }
  .accordion-header[aria-expanded="true"] .icon-arrow {
    transform: rotate(225deg);
  }
  .accordion-content {
    padding: 0 20px 20px;
  }
  .rte {
    line-height: 1.6;
  }
  .rte h2, .rte h3 {
    margin-top: 1.5em;
  }
{% endstyle %}

{% javascript %}
  document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const isExpanded = header.getAttribute('aria-expanded') === 'true';

        // Opcional: Cerrar otros acordeones
        // accordionHeaders.forEach(otherHeader => {
        //   if (otherHeader !== header) {
        //     otherHeader.setAttribute('aria-expanded', 'false');
        //     otherHeader.nextElementSibling.hidden = true;
        //   }
        // });

        header.setAttribute('aria-expanded', String(!isExpanded));
        content.hidden = isExpanded;
      });
    });
  });
{% endjavascript %}
```

¡Y eso es todo! Con estos elementos, has habilitado una página de políticas robusta y fácil de gestionar para los comerciantes, manteniendo un diseño limpio y profesional en tu tema.

# Gestión de Páginas y Políticas

Este documento explica cómo el motor de plantillas maneja las páginas y políticas en la tienda.

## Tipos de Páginas

El motor soporta varios tipos de páginas:

- `index` - Página de inicio
- `product` - Páginas de productos individuales
- `collection` - Páginas de listado de colecciones
- `page` - Páginas estáticas (Acerca de, Contacto, etc.)
- `cart` - Página del carrito de compras
- `search` - Página de resultados de búsqueda

## Políticas

Las páginas de políticas se generan automáticamente para:

- Política de Privacidad
- Términos de Servicio
- Política de Devoluciones
- Política de Envíos

## Mejores Prácticas de Paginación

### ⚠️ Importante: Usar Números Pares para Límites de Paginación

**Problema Identificado**: Amplify Gen 2 con DynamoDB tiene generación inconsistente de tokens cuando se usan números impares como límites de paginación.

**Síntomas**:

- Con límites impares (1, 3, 5, 7, 9, etc.): La última página muestra incorrectamente el botón "Siguiente"
- Con límites pares (2, 4, 6, 8, 10, 20, 50, 100, etc.): La paginación funciona correctamente

**Causa Raíz**:
Amplify Gen 2/DynamoDB parece tener optimizaciones internas o algoritmos que funcionan mejor con límites de números pares, causando comportamiento inconsistente del `nextToken` con números impares.

**Solución**:
Siempre usar números pares para paginación en tus plantillas Liquid:

```liquid
<!-- ✅ BUENO: Usar números pares -->
{% paginate products by 2 %}
{% paginate products by 10 %}
{% paginate products by 20 %}

<!-- ❌ EVITAR: Los números impares causan problemas con nextToken -->
{% paginate products by 1 %}
{% paginate products by 3 %}
{% paginate products by 9 %}
```

**Límites de Paginación Recomendados**:

- **Grillas pequeñas**: 4, 6, 8 productos por página
- **Listas estándar**: 10, 20 productos por página
- **Catálogos grandes**: 50, 100 productos por página

### Detalles Técnicos

Esta limitación afecta:

- Listados de productos (`{% paginate products by X %}`)
- Listados de colecciones
- Listados de páginas
- Cualquier contenido que use el sistema de paginación

El problema NO afecta:

- La funcionalidad de la aplicación (sigue funcionando, solo muestra el botón "Siguiente" extra)
- La carga de datos o el rendimiento
- El SEO o la experiencia de usuario significativamente

### Notas de Implementación

Al diseñar temas, considera:

1. **Diseños en grilla**: Usar números que crean grillas visuales agradables (4, 6, 8, 12)
2. **Rendimiento**: Números pares más grandes (20, 50) para mejor rendimiento
3. **Experiencia de usuario**: No exceder 100 elementos por página para usabilidad

Este comportamiento ha sido probado y confirmado en múltiples tiendas y es consistente con la implementación actual de Amplify Gen 2.
