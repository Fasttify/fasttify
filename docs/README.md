# Documentación de Fasttify

Bienvenido a la documentación de Fasttify, una plataforma completa de e-commerce con motor de renderizado Liquid y funcionalidades avanzadas.

## 📚 Índice de Documentación

### 🏗️ Arquitectura del Sistema

- [Database Sharding](./architecture/database-sharding.md) - Estrategias de particionamiento de base de datos

### 🌐 Dominios y SSL

- [Automated Custom Domains](./domains/automated-custom-domains.md) - Sistema automatizado de dominios personalizados
- [CloudFront Multi-tenant Setup](./domains/cloudfront-multitenant-setup.md) - Configuración de CloudFront multi-tenant
- [Deployment](./domains/deployment.md) - Guía de despliegue

### 🔧 Motor de Renderizado

- [Amplify Gen 2 Pagination Gotchas](./engine/amplify-gen2-pagination-gotchas.md) - Problemas conocidos de paginación
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

1. [Search System](./engine/search-system.md) - Sistema de búsqueda automática
2. [Theme Development Guide](./engine/theme-development-guide.md) - Guía de desarrollo
3. [Filters & Tags](./engine/filters-tags.md) - Filtros disponibles

### Para Desarrolladores del Core

Si estás trabajando en el motor de renderizado:

1. [Search System Architecture](./engine/search-system-architecture.md) - Arquitectura técnica
2. [Render Engine](./engine/render-engine.md) - Motor de renderizado
3. [Dynamic Template Analysis](./templates/dynamic-template-analysis.md) - Análisis de plantillas

## 📖 Guías Rápidas

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

**Última actualización**: Sistema de búsqueda automática implementado y documentado
