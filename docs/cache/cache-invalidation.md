# Documentación tecnica

Fasttify es una plataforma de e-commerce headless que integra un potente motor de renderizado Liquid (compatible con Shopify), arquitectura multi-tenant y automatización avanzada para la gestión de tiendas online modernas.

Esta documentación cubre desde la personalización de temas y plantillas, hasta la integración de dominios personalizados, automatización de flujos y mejores prácticas para desarrolladores y equipos técnicos.

## 📚 Índice de Documentación

### 🏗️ Arquitectura del Sistema

- [Database Sharding](./architecture/database-sharding.md) - Estrategias de particionamiento de base de datos

### 🌐 Dominios y SSL

- [Automated Custom Domains](./domains/automated-custom-domains.md) - Sistema automatizado de dominios personalizados
- [CloudFront Multi-tenant Setup](./domains/cloudfront-multitenant-setup.md) - Configuración de CloudFront multi-tenant
- [Deployment](./domains/deployment.md) - Guía de despliegue

### 🔧 Motor de Renderizado

- [Amplify Gen 2 Pagination Gotchas](./engine/amplify-gen2-pagination-gotchas.md) - Problemas conocidos de paginación
- [Cart System](./engine/cart-system.md) - **Sistema completo de carrito** - Guía para implementar carrito lateral en temas
- [Filters System](./engine/filters-system.md) - **Sistema de filtros de productos** - Guía completa para implementar filtros avanzados
- [Filters & Tags](./engine/filters-tags.md) - Filtros y tags Liquid disponibles
- [Liquid Data Access](./engine/liquid-data-access.md) - Acceso a datos en templates Liquid
- [Pages and Policies](./engine/pages-and-policies.md) - Sistema de páginas y políticas
- [Render Engine](./engine/render-engine.md) - Arquitectura del motor de renderizado
- [Theme Development Guide](./engine/theme-development-guide.md) - Guía de desarrollo de temas
- [Theme Visual Guide](./engine/theme-visual-guide.md) - Guía visual de temas
- [Shopify URL Compatibility](./engine/shopify-url-compatibility.md) - Compatibilidad con URLs de Shopify

### 🔍 Sistema de Búsqueda (Nuevo)

- [Search System](./engine/search-system.md) - **Guía para desarrolladores de temas** - Cómo implementar y configurar el sistema de búsqueda automática
- [Search System Architecture](./engine/search-system-architecture.md) - **Documentación técnica** - Arquitectura interna y extensibilidad del sistema

### 📄 Templates

- [Displaying Limited Items](./templates/displaying-limited-items.md) - Cómo mostrar elementos limitados
- [Dynamic Template Analysis](./templates/dynamic-template-analysis.md) - Análisis dinámico de plantillas
- [Multiple Sections Pagination Strategy](./templates/multiple-sections-pagination-strategy.md) - Estrategia de paginación para múltiples secciones

## 🚀 Características Principales

### Mejoras Recientes del Sistema de Carrito

**Refactorización Modular (Enero 2025)**

El sistema de carrito ha sido completamente refactorizado para mejorar la mantenibilidad y escalabilidad:

#### 🏗️ Nueva Arquitectura Modular

- **`cart-api.js`**: Gestión centralizada de todas las operaciones API
- **`cart-helpers.js`**: Utilidades reutilizables (formateo, validación, etc.)
- **`cart-templates.js`**: Generación de HTML mediante templates
- **`cart-ui.js`**: Controles de interfaz y gestión de eventos
- **`side-cart.js`**: Lógica principal y coordinación de módulos

#### 🎨 Soporte para Atributos de Producto

- **Captura automática** de atributos seleccionados (color, talla, etc.)
- **Almacenamiento** en el carrito con los productos
- **Visualización** en el carrito lateral
- **Integración** con páginas de producto

#### 🔗 Integración Automática con Header

- **Contadores en tiempo real** en el header
- **Sincronización automática** entre carrito y header
- **Eventos personalizados** para comunicación entre componentes

#### 📱 Mejoras de UX

- **Estados de carga** mejorados
- **Manejo de errores** más robusto
- **Animaciones** más fluidas
- **Responsive design** optimizado

### Sistema de Carrito Completo

Sistema de carrito lateral con funcionalidad completa para e-commerce:

- ✅ **Carrito lateral deslizable** con overlay y animaciones
- ✅ **Controles de cantidad** con botones +/- e input manual
- ✅ **Eliminación individual** y limpieza completa del carrito
- ✅ **Actualización en tiempo real** sin recargar página
- ✅ **API REST completa** para todas las operaciones
- ✅ **Eventos personalizados** para integración con temas
- ✅ **Arquitectura modular** con separación de responsabilidades
- ✅ **Soporte para atributos de producto** (color, talla, etc.)
- ✅ **Integración automática con header** para contadores
- ✅ **Sistema de templates** para generación de HTML
- ✅ **Helpers reutilizables** para formateo y utilidades

### Sistema de Filtros Avanzado

Sistema de filtros de productos con funcionalidad completa:

- ✅ **Filtros dinámicos** por categorías, tags, vendors y colecciones
- ✅ **Filtro de precio** con rango configurable
- ✅ **Ordenamiento múltiple** (nombre, precio, fecha, relevancia)
- ✅ **Scroll infinito** con carga automática de productos
- ✅ **URL persistente** que mantiene los filtros aplicados
- ✅ **Token oculto** para paginación sin contaminar la URL
- ✅ **Formateo automático de moneda** usando función global
- ✅ **Ocultar paginación** automáticamente cuando hay filtros
- ✅ **Diseño responsive** con sidebar adaptativo
- ✅ **Loading states** y manejo de errores robusto

### Sistema de Búsqueda Automática

El nuevo sistema de búsqueda automática permite que los productos se muestren en el diálogo de búsqueda del header sin configuración manual. Características:

- ✅ **Automático**: No requiere configuración manual por tienda
- ✅ **Configurable**: Límites ajustables desde `settings_schema.json`
- ✅ **Eficiente**: Solo carga los productos necesarios
- ✅ **Flexible**: Funciona en cualquier página

### Motor de Renderizado Liquid

Motor de renderizado completo con soporte para:

- Templates Liquid dinámicos
- Análisis automático de dependencias
- Carga inteligente de datos
- Paginación optimizada

### Dominios Personalizados

Sistema automatizado para:

- Configuración de dominios personalizados
- SSL automático
- Verificación DNS/HTTP
- Gestión multi-tenant

## 🛠️ Desarrollo

### Para Desarrolladores de Temas

Si estás desarrollando un tema para Fasttify, comienza con:

1. [Cart System](./engine/cart-system.md) - **Sistema completo de carrito** - Implementación de carrito lateral
2. [Filters System](./engine/filters-system.md) - **Sistema de filtros de productos** - Implementación de filtros avanzados
3. [Search System](./engine/search-system.md) - Sistema de búsqueda automática
4. [Theme Development Guide](./engine/theme-development-guide.md) - Guía de desarrollo
5. [Filters & Tags](./engine/filters-tags.md) - Filtros disponibles

### Para Desarrolladores del Core

Si estás trabajando en el motor de renderizado:

1. [Search System Architecture](./engine/search-system-architecture.md) - Arquitectura técnica
2. [Render Engine](./engine/render-engine.md) - Motor de renderizado
3. [Dynamic Template Analysis](./templates/dynamic-template-analysis.md) - Análisis de plantillas

## 📖 Guías Rápidas

### Implementar Carrito en un Tema

```liquid
<!-- Incluir assets en layout/theme.liquid -->
{{ 'cart.css' | asset_url | stylesheet_tag }}
{{ 'side-cart.js' | asset_url | script_tag }}

<!-- Botón para abrir carrito -->
<button type="button" data-open-cart>
  Carrito ({{ cart.item_count }})
</button>

<!-- Agregar producto al carrito -->
<button onclick="addToCart('{{ product.id }}', 1)">
  Agregar al Carrito
</button>
```

### Implementar Filtros en un Tema

```liquid
<!-- En product-list-view.liquid -->
<div class="product-page">
  {% filters
    storeId: store.id,
    cssClass: 'product-filters',
    title: 'Filtrar Productos',
    showPriceRange: true,
    showSortOptions: true,
    infiniteScroll: true
  %}

  <div class="product-grid" id="products-container" data-products>
    {% for product in products %}
      <div class="product-card" data-product-id="{{ product.id }}">
        <img src="{{ product.featured_image | image_url: width: 300 }}">
        <h3>{{ product.title }}</h3>
        <p>{{ product.price | money }}</p>
      </div>
    {% endfor %}
  </div>
</div>
```

### Configurar Búsqueda en un Tema

```json
// En template/config/settings_schema.json
{
  "name": "Search Settings",
  "settings": [
    {
      "type": "range",
      "id": "search_products_limit",
      "label": "Search Products Limit",
      "min": 4,
      "max": 20,
      "step": 2,
      "default": 8
    }
  ]
}
```

### Usar Productos de Búsqueda en Liquid

```liquid
{% for product in search_products limit: search_products_limit %}
  <div class="product-card">
    <a href="{{ product.url }}">
      <img src="{{ product.featured_image | image_url: width: 100 }}">
      <h3>{{ product.title }}</h3>
      <p>{{ product.price | money }}</p>
    </a>
  </div>
{% endfor %}
```

## 🤝 Contribuir

Para contribuir a la documentación:

1. Mantén un estilo consistente
2. Incluye ejemplos prácticos
3. Actualiza el índice cuando agregues nuevos archivos
4. Usa enlaces relativos para referencias internas

## 📞 Soporte

Para preguntas sobre la documentación o el sistema:

1. Revisa la documentación relevante
2. Consulta los ejemplos de implementación
3. Revisa los logs del sistema para debugging
4. Contacta al equipo de desarrollo

---

**Última actualización**: Sistema de filtros monolítico restaurado y optimizado, sistema de carrito modular, y documentación completa actualizada (Enero 2025)
