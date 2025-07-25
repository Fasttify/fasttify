# Sistema de Búsqueda Automática

## Descripción General

El sistema de búsqueda automática permite que los productos se muestren en el diálogo de búsqueda del header sin necesidad de configuración manual. El motor de renderizado carga automáticamente los productos necesarios y los inyecta en el contexto Liquid.

## Arquitectura del Sistema

### Componentes Principales

```
renderer-engine/services/page/data-loader/
├── search-limits-extractor.ts    # Extrae límites de settings_schema.json
├── search-data-loader.ts         # Carga productos/colecciones para búsqueda
├── core-data-loader.ts           # Carga datos principales de la página
└── dynamic-data-loader.ts        # Orquestador principal
```

### Flujo de Datos

1. **Análisis de Plantillas**: El motor analiza qué datos necesita cargar
2. **Extracción de Límites**: Lee configuración de `settings_schema.json`
3. **Carga de Datos**: Obtiene productos y colecciones con límites aplicados
4. **Inyección en Contexto**: Los datos están disponibles en Liquid como variables globales

## Configuración para Desarrolladores de Temas

### 1. Configurar Límites en settings_schema.json

Agrega una sección de configuración en tu `template/config/settings_schema.json`:

```json
{
  "name": "Search Settings",
  "settings": [
    {
      "type": "range",
      "id": "search_products_limit",
      "label": "Search Products Limit",
      "info": "Maximum number of products to show in search results",
      "min": 4,
      "max": 20,
      "step": 2,
      "unit": "products",
      "default": 8
    },
    {
      "type": "range",
      "id": "search_collections_limit",
      "label": "Search Collections Limit",
      "info": "Maximum number of collections to show in search results",
      "min": 2,
      "max": 10,
      "step": 1,
      "unit": "collections",
      "default": 4
    }
  ]
}
```

**Nota**: Los límites deben ser números pares para evitar problemas de paginación con Amplify Gen 2.

### 2. Variables Disponibles en Liquid

Una vez configurado, las siguientes variables estarán disponibles en todos los templates Liquid:

#### Productos de Búsqueda

```liquid
{{ search_products }}           # Array de productos para búsqueda
{{ search_products_limit }}     # Límite configurado de productos
```

#### Colecciones de Búsqueda (opcional)

```liquid
{{ search_collections }}        # Array de colecciones para búsqueda
{{ search_collections_limit }}  # Límite configurado de colecciones
```

### 3. Implementación en el Header

Ejemplo de implementación en `template/snippets/header.liquid`:

```liquid
<div class="search-dialog-products-grid">
  {% if search_products and search_products.size > 0 %}
    {% for product in search_products limit: search_products_limit %}
      <div class="product-card">
        <a href="{{ product.url }}" class="product-card-link">
          <img src="{{ product.featured_image | image_url: width: 100 }}"
               alt="{{ product.title }}" loading="lazy">
          <h3>{{ product.title }}</h3>
          <p>{{ product.price | money }}</p>
        </a>
      </div>
    {% endfor %}
  {% else %}
    <div class="search-no-products">
      <p>No hay productos disponibles</p>
    </div>
  {% endif %}
</div>
```

## Características del Sistema

### ✅ Automático

- No requiere configuración manual por tienda
- Los productos se cargan automáticamente en cada página
- Los límites se aplican según la configuración del tema

### ✅ Configurable

- Límites ajustables desde `settings_schema.json`
- Soporte para productos y colecciones
- Valores por defecto seguros

### ✅ Eficiente

- Solo carga los productos necesarios
- Usa caché del motor de renderizado
- Respeta límites de paginación

### ✅ Flexible

- Funciona en cualquier página
- Variables disponibles globalmente
- Compatible con cualquier estructura de tema

## Estructura de Datos de Productos

Los productos cargados incluyen los siguientes campos:

```liquid
{{ product.id }}              # ID único del producto
{{ product.title }}           # Título del producto
{{ product.url }}             # URL del producto
{{ product.featured_image }}  # Imagen destacada
{{ product.price }}           # Precio (formatear con | money)
{{ product.compare_at_price }} # Precio comparativo
{{ product.handle }}          # Handle/Slug del producto
```

## Ejemplos de Uso

### Mostrar Productos con Límite Personalizado

```liquid
{% for product in search_products limit: 6 %}
  <!-- Mostrar solo 6 productos independientemente del límite configurado -->
{% endfor %}
```

### Verificar Disponibilidad

```liquid
{% if search_products.size > 0 %}
  <p>Encontramos {{ search_products.size }} productos</p>
{% else %}
  <p>No hay productos disponibles</p>
{% endif %}
```

### Mostrar Colecciones (si están configuradas)

```liquid
{% if search_collections and search_collections.size > 0 %}
  <h3>Colecciones</h3>
  {% for collection in search_collections limit: search_collections_limit %}
    <a href="{{ collection.url }}">{{ collection.title }}</a>
  {% endfor %}
{% endif %}
```

## Troubleshooting

### Los productos no aparecen

1. Verifica que `search_products_limit` esté configurado en `settings_schema.json`
2. Asegúrate de que la tienda tenga productos activos
3. Revisa los logs del motor para errores de carga

### Los límites no se aplican

1. Verifica que los valores en `settings_schema.json` sean números válidos
2. Usa números pares para evitar problemas de paginación
3. Reinicia el motor de renderizado después de cambios en la configuración

### Performance lenta

1. Reduce el `search_products_limit` si es muy alto
2. Verifica que los productos tengan imágenes optimizadas
3. Considera usar lazy loading para las imágenes

## Mejores Prácticas

### Configuración

- Usa límites razonables (4-12 productos)
- Mantén números pares para los límites
- Documenta la configuración en tu tema

### Rendimiento

- Limita el número de productos mostrados
- Usa imágenes optimizadas
- Implementa lazy loading

### UX

- Proporciona feedback cuando no hay productos
- Usa enlaces claros a los productos
- Mantén consistencia visual con el resto del tema

## Extensibilidad

El sistema está diseñado para ser extensible. Puedes:

1. **Agregar nuevos tipos de datos**: Modificar `search-data-loader.ts`
2. **Personalizar filtros**: Agregar lógica de filtrado en el cargador
3. **Implementar búsqueda en tiempo real**: Usar los datos como base para búsquedas dinámicas
4. **Agregar más configuraciones**: Extender `settings_schema.json` con nuevas opciones

## Soporte

Para problemas o preguntas sobre el sistema de búsqueda:

1. Revisa los logs del motor de renderizado
2. Verifica la configuración en `settings_schema.json`
3. Consulta la documentación de Liquid para filtros adicionales
4. Revisa los ejemplos de implementación en este documento
