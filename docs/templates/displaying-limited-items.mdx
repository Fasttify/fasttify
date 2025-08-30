# Cómo Mostrar un Número Específico de Ítems sin Paginación

En ocasiones, puede que necesites mostrar un número fijo de productos o colecciones en una página, sin la necesidad de controles de paginación (como "Siguiente" o "Anterior"). Esto es ideal para secciones como "Productos Destacados", "Nuestras Últimas Colecciones", o cualquier lista curada que no deba paginarse.

## Cuándo Usar Esta Técnica

Utiliza este método cuando:

- Quieras mostrar un subconjunto estático de elementos (ej. los primeros 4 productos).
- No necesites que los usuarios naveguen a través de múltiples páginas de resultados.
- La lista de ítems es más bien una "vista previa" o un bloque de contenido destacado.

## Cómo Funciona

Para mostrar un número limitado de ítems sin paginación, debes seguir estos pasos:

1.  **No uses el tag `{% paginate %}`**: Este tag está diseñado específicamente para manejar la paginación y sus controles. Para listas estáticas, es innecesario.

2.  **Usa un bucle `{% for %}` con el filtro `limit`**: Puedes especificar el número máximo de elementos directamente en el filtro `limit` de tu bucle `{% for %}`.

## Ejemplo Práctico: Mostrar 4 Productos Destacados

Supongamos que quieres crear una sección en tu página de inicio que muestre siempre los primeros 4 productos de tu tienda. Para esto, simplemente defines el límite directamente en tu archivo de sección Liquid.

### Paso 1: Crear el Archivo de Sección `sections/featured-products.liquid`

En tu archivo Liquid de sección, usa el filtro `limit` en tu bucle `{% for %}` con el número deseado.

```liquid
{% comment %}
  sections/featured-products.liquid
  Esta sección muestra un número limitado de productos de la tienda.
{% endcomment %}

<div class="featured-products-grid">
  <h2>Productos Destacados</h2>

  <div class="product-grid">
    {% for product in collection.products limit: 4 %}
      {% render 'product-card', product: product %}
    {% else %}
      <p>No hay productos disponibles para mostrar.</p>
    {% endfor %}
  </div>
</div>

{% schema %}
{
  "name": "Productos Destacados (Fijo)",
  "presets": [
    {
      "name": "Productos Destacados (Límite Fijo)",
      "category": "Productos"
    }
  ]
}
{% endschema %}
```

En este ejemplo:

- `collection.products` se usa para acceder a todos los productos de la colección (ajusta esto según el recurso que quieras mostrar).
- `limit: 4` aplica directamente el límite de 4 productos.
- El bloque `{% schema %}` se simplifica, ya que no necesita definir un ajuste para el límite.

## Consideraciones Finales

- Este enfoque es puramente para visualización limitada y no ofrece las funcionalidades de navegación de una paginación completa.
- Si los ítems necesitan ser filtrados o clasificados de alguna manera, esa lógica debe manejarse antes de que los datos lleguen a la plantilla, o a través de otros filtros Liquid si la complejidad lo permite.
- **Cuándo NO usar este método (y preferir el JSON)**: Si necesitas que el número de ítems a mostrar sea configurable por el usuario final (por ejemplo, desde un editor de temas), entonces **debes** definir el límite en el bloque `settings` de tu `schema` en el JSON de la plantilla, como se explicó en la versión anterior de esta guía. Esto permite una mayor flexibilidad sin necesidad de editar el código Liquid directamente.
