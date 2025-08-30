# Tag `{% filters %}` - Filtros Automáticos

El tag `{% filters %}` genera automáticamente una interfaz completa de filtros de productos basándose en los datos reales de tu tienda. **No necesitas configurar nada** - el tag detecta qué filtros crear automáticamente.

## 🚀 **Uso Básico**

```liquid
<!-- Genera filtros automáticamente -->
{% filters %}
```

¡Y eso es todo! El tag genera automáticamente:

- ✅ Filtro de precio (slider de rango)
- ✅ Filtros de categorías (checkboxes)
- ✅ Filtros de etiquetas (pills)
- ✅ Filtro de disponibilidad (solo productos en stock)
- ✅ Filtro de productos destacados
- ✅ Ordenamiento (dropdown)
- ✅ Grid de productos con carga AJAX
- ✅ JavaScript incluido (funciona inmediatamente)
- ✅ CSS base incluido

## 🎨 **Opciones de Estilo**

### Sidebar (por defecto)

```liquid
{% filters style: 'sidebar' %}
```

Filtros a la izquierda, productos a la derecha.

### Horizontal

```liquid
{% filters style: 'horizontal' %}
```

Filtros arriba, productos abajo.

### Modal (próximamente)

```liquid
{% filters style: 'modal' %}
```

Filtros en un modal/popup.

## ⚙️ **Opciones de Configuración**

### Limitar Categorías y Tags

```liquid
{% filters max_categories: 8, max_tags: 10 %}
```

### Solo Algunos Filtros

```liquid
{% filters only: 'price|category|availability' %}
```

### Excluir Filtros

```liquid
{% filters except: 'tags|featured' %}
```

### Combinando Opciones

```liquid
{% filters style: 'sidebar', max_categories: 5, only: 'price|category|availability' %}
```

## 🎯 **Ejemplos de Uso por Template**

### Página de Colección

```liquid
<!-- templates/collection.liquid -->
<div class="page-width">
  <h1>{{ collection.title }}</h1>
  <p>{{ collection.description }}</p>

  {% filters style: 'sidebar', max_categories: 10 %}
</div>
```

### Página de Búsqueda

```liquid
<!-- templates/search.liquid -->
<div class="page-width">
  <h1>Resultados para "{{ search.terms }}"</h1>

  {% filters only: 'price|category|sort', style: 'horizontal' %}
</div>
```

### Página Personalizada

```liquid
<!-- templates/page.custom-products.liquid -->
<div class="custom-layout">
  <div class="hero-section">
    <h1>Nuestros Productos</h1>
  </div>

  {% filters max_categories: 5, except: 'featured' %}
</div>
```

### Sección Personalizada

```liquid
<!-- sections/filterable-products.liquid -->
<div class="filterable-products-section">
  {% if section.settings.show_filters %}
    {% filters
       style: section.settings.filter_style,
       max_categories: section.settings.max_categories
    %}
  {% else %}
    <!-- Mostrar productos sin filtros -->
  {% endif %}
</div>

{% schema %}
{
  "name": "Productos Filtrables",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_filters",
      "label": "Mostrar filtros",
      "default": true
    },
    {
      "type": "select",
      "id": "filter_style",
      "label": "Estilo de filtros",
      "options": [
        {"value": "sidebar", "label": "Barra lateral"},
        {"value": "horizontal", "label": "Horizontal"}
      ],
      "default": "sidebar"
    },
    {
      "type": "range",
      "id": "max_categories",
      "label": "Máximo categorías",
      "min": 3,
      "max": 15,
      "default": 8
    }
  ]
}
{% endschema %}
```

## 🎨 **Personalización con CSS**

El tag genera CSS base funcional, pero puedes personalizarlo completamente:

### CSS Base Generado

```css
/* Clases principales */
.auto-filters                    /* Contenedor principal */
.auto-filters--sidebar           /* Estilo sidebar */
.auto-filters--horizontal        /* Estilo horizontal */
.auto-filters__sidebar           /* Barra lateral de filtros */
.auto-filters__main              /* Área principal */
.auto-filters__products          /* Grid de productos */

/* Grupos de filtros */
.filter-group                    /* Cada grupo de filtros */
.filter-group--price             /* Filtro de precio específico */
.filter-group--category          /* Filtro de categorías */
.filter-group__title             /* Título de grupo */

/* Opciones de filtro */
.filter-option                   /* Cada opción clickeable */
.filter-option__text             /* Texto de la opción */
.filter-checkbox                 /* Checkboxes */

/* Filtros específicos */
.price-inputs                    /* Inputs de precio */
.price-input                     /* Input individual */
.price-slider                    /* Slider de rango */
.filter-tags                     /* Contenedor de tags */
.filter-tag                      /* Tag individual */
.filter-tag.active               /* Tag seleccionado */
```

### Ejemplos de Personalización

#### Tema Oscuro

```css
.auto-filters {
  --filter-bg: #1a1a1a;
  --filter-text: #ffffff;
  --filter-border: #333;
  --filter-accent: #007bff;
}

.auto-filters__sidebar {
  background: var(--filter-bg);
  color: var(--filter-text);
  border: 1px solid var(--filter-border);
}

.filter-option:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

#### Estilo Minimalista

```css
.auto-filters__sidebar {
  background: transparent;
  padding: 0;
}

.filter-group {
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.filter-tag {
  border-radius: 2px;
  border: none;
  background: #f5f5f5;
}

.filter-tag.active {
  background: #000;
  color: #fff;
}
```

#### Grid Personalizado

```css
.auto-filters__products {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .auto-filters__products {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
}
```

## 📱 **Responsive Automático**

El tag es responsive por defecto:

- **Desktop**: Sidebar con filtros a la izquierda
- **Tablet**: Filtros arriba, grid adaptado
- **Mobile**: Filtros colapsables, una columna

### Personalizar Breakpoints

```css
@media (max-width: 1024px) {
  .auto-filters--sidebar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .auto-filters__sidebar {
    order: 2; /* Productos primero en móvil */
  }

  .auto-filters__main {
    order: 1;
  }
}
```

## ⚡ **Funcionalidad JavaScript Incluida**

El tag incluye JavaScript completo automáticamente:

### Funciones Disponibles

- ✅ **Filtrado en tiempo real** - AJAX sin recargar página
- ✅ **Debouncing** - Evita múltiples requests
- ✅ **URL sync** - URLs navegables con filtros
- ✅ **Loading states** - Indicadores de carga
- ✅ **Error handling** - Manejo de errores
- ✅ **Mobile responsive** - Funciona en móviles

### Eventos Personalizados

```javascript
// Escuchar cuando se aplican filtros
document.addEventListener('filters:applied', (event) => {
  console.log('Filtros aplicados:', event.detail.filters);
  console.log('Productos encontrados:', event.detail.products.length);
});

// Escuchar cuando se cargan productos
document.addEventListener('products:loaded', (event) => {
  console.log('Productos cargados:', event.detail.products);
});
```

### Integración con Analytics

```javascript
// Agregar tracking automático
document.addEventListener('filters:applied', (event) => {
  gtag('event', 'filter_applied', {
    filter_type: event.detail.filterType,
    filter_value: event.detail.filterValue,
    products_found: event.detail.products.length,
  });
});
```

## 🔧 **Integración con Carrito**

El tag se integra automáticamente con tu sistema de carrito existente:

```javascript
// Si tienes window.addToCart definido, funciona automáticamente
window.addToCart = async function (productId, quantity = 1) {
  // Tu lógica de carrito existente
};

// El tag llamará esta función automáticamente
```

## 🚀 **Casos de Uso Avanzados**

### Múltiples Instancias

```liquid
<!-- Productos destacados con filtros simples -->
<section class="featured-section">
  <h2>Productos Destacados</h2>
  {% filters only: 'price|sort', style: 'horizontal' %}
</section>

<!-- Catálogo completo con todos los filtros -->
<section class="catalog-section">
  <h2>Catálogo Completo</h2>
  {% filters style: 'sidebar', max_categories: 15 %}
</section>
```

### Filtros Contextuales

```liquid
{% if template.name == 'collection' %}
  {% filters style: 'sidebar', max_categories: 10 %}
{% elsif template.name == 'search' %}
  {% filters only: 'price|category|sort', style: 'horizontal' %}
{% else %}
  {% filters only: 'price|sort' %}
{% endif %}
```

## 📊 **Performance**

### Optimizaciones Incluidas

- ✅ **Lazy loading** - Productos se cargan según necesidad
- ✅ **Debouncing** - Evita requests innecesarios
- ✅ **Cache-friendly** - Aprovecha caché del navegador
- ✅ **Minimal payload** - Solo transfiere datos necesarios

### Métricas Típicas

- **Tiempo de carga inicial**: ~200-400ms
- **Filtrado en tiempo real**: ~100-300ms
- **Transferencia de datos**: 70-90% menos vs carga completa

## 🐛 **Troubleshooting**

### Filtros No Aparecen

```liquid
<!-- Verificar que hay productos en la tienda -->
{% if shop.products_count > 0 %}
  {% filters %}
{% else %}
  <p>No hay productos para filtrar</p>
{% endif %}
```

### JavaScript No Funciona

```liquid
<!-- Verificar que no hay conflictos -->
<script>
  console.log('Store ID:', '{{ shop.id }}');
  console.log('Auto filters container:', document.querySelector('.auto-filters'));
</script>
```

### Estilos No Se Aplican

El CSS base siempre se incluye. Si no ves estilos:

1. Verifica que no hay CSS conflictivo
2. Usa `!important` si es necesario
3. Revisa la consola del navegador

## 🎯 **Mejores Prácticas**

### ✅ Do

- Usa el tag en páginas de productos/colecciones
- Personaliza con CSS para que coincida con tu tema
- Limita categorías/tags si tienes muchos
- Prueba en móviles

### ❌ Don't

- No uses múltiples tags `{% filters %}` en la misma página
- No modifiques el JavaScript generado directamente
- No olvides probar sin JavaScript habilitado

## 🔮 **Próximas Funciones**

- [ ] Filtros por rango de fechas
- [ ] Filtros por colores (color picker)
- [ ] Filtros por tallas (selector visual)
- [ ] Infinite scroll automático
- [ ] Filtros por ratings/reseñas
- [ ] Filtros geográficos
- [ ] A/B testing de layouts

---

¿Necesitas ayuda? El tag `{% filters %}` está diseñado para funcionar automáticamente, pero si tienes preguntas específicas sobre personalización, revisa los ejemplos arriba o consulta la documentación de CSS/JavaScript.
