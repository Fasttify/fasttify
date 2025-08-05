# Personalización de Templates para el Sistema de Filtros

El sistema de filtros permite a cada tienda personalizar completamente cómo se renderizan los productos filtrados. Esto asegura que los productos filtrados mantengan el mismo diseño y funcionalidad que los productos originales.

## Cómo Funciona

El sistema utiliza un `TemplateManager` que:

1. **Primero intenta cargar un template personalizado** desde `https://cdn.fasttify.com/templates/{storeId}/product-template.js`
2. **Si no encuentra un template personalizado**, usa el template existente en la página actual
3. **Como fallback**, usa un template básico pero completo

## Opciones de Personalización

### 1. Template Personalizado (Recomendado)

Crea un archivo `product-template.js` en tu CDN con la siguiente estructura:

```javascript
// https://cdn.fasttify.com/templates/{tu-store-id}/product-template.js

export default {
  render: function (product) {
    // Tu HTML personalizado aquí
    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image-wrapper">
          <a href="${product.url}" class="product-link">
            <img class="product-image" src="${product.images?.[0]?.url || ''}" alt="${product.name}">
          </a>

          <div class="product-badges">
            ${this.renderBadges(product)}
          </div>

          <div class="product-overlay">
            <div class="product-overlay-content">
              <a href="${product.url}" class="product-btn product-btn-primary">
                <span>VER PRODUCTO</span>
              </a>
              <button class="product-btn product-btn-secondary" onclick="addProductToCart('${product.id}', 1)">
                <span>AÑADIR AL CARRITO</span>
              </button>
            </div>
          </div>
        </div>

        <div class="product-info">
          <div class="product-vendor">${product.vendor?.toUpperCase() || ''}</div>
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">
            ${this.renderPrice(product)}
          </div>
          ${this.renderAttributes(product)}
        </div>
      </div>
    `;
  },

  renderBadges: function (product) {
    const badges = [];

    // Badge NEW
    const createdAt = new Date(product.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (product.tags?.includes('new') || createdAt > thirtyDaysAgo) {
      badges.push('<span class="product-badge badge-new">NEW</span>');
    }

    // Badge SALE
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      const discountPercent = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
      badges.push(`<span class="product-badge badge-sale">SAVE ${discountPercent}%</span>`);
    }

    return badges.join('');
  },

  renderPrice: function (product) {
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      return `
        <span class="price-compare">${this.formatMoney(product.compareAtPrice)}</span>
        <span class="price-current price-sale">${this.formatMoney(product.price)}</span>
      `;
    }
    return `<span class="price-current">${this.formatMoney(product.price)}</span>`;
  },

  renderAttributes: function (product) {
    if (!product.attributes?.length) return '';

    let html = '<div class="product-attributes-summary">';

    product.attributes.forEach((attribute) => {
      html += `
        <div class="attribute-display attribute-display--${attribute.name.toLowerCase().replace(/\s+/g, '-')}">
          <div class="attribute-values-list">
      `;

      if (attribute.name.toLowerCase() === 'color') {
        attribute.values.slice(0, 4).forEach((value) => {
          html += `<span class="color-swatch" style="background-color: ${value.toLowerCase()};" title="${value}"></span>`;
        });
        if (attribute.values.length > 4) {
          html += `<span class="attribute-more">+${attribute.values.length - 4}</span>`;
        }
      } else {
        attribute.values.slice(0, 3).forEach((value) => {
          html += `<span class="attribute-value-item">${value}</span>`;
        });
        if (attribute.values.length > 3) {
          html += `<span class="attribute-more">+${attribute.values.length - 3}</span>`;
        }
      }

      html += `
          </div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  },

  formatMoney: function (amount) {
    if (!amount) return '';
    return window.formatMoney ? window.formatMoney(amount) : amount.toString();
  },
};
```

### 2. Usar el Template Existente (Automático)

Si no tienes un template personalizado, el sistema automáticamente:

1. Busca un elemento `.product-card` en la página
2. Clona ese elemento y actualiza su contenido
3. Mantiene todos los estilos y clases CSS existentes

### 3. Template Básico (Fallback)

Si no hay template existente, el sistema usa un template básico pero completo que incluye:

- ✅ Múltiples imágenes con indicadores
- ✅ Badges (NEW, BESTSELLER, TRENDING, SAVE %)
- ✅ Overlay con botones de acción
- ✅ Información del vendedor
- ✅ Atributos del producto (colores, etc.)
- ✅ Precios con descuentos
- ✅ Formateo de moneda

## Variables Disponibles

En tu template personalizado, tienes acceso a todas estas propiedades del producto:

```javascript
{
  id: "product-id",
  name: "Nombre del Producto",
  description: "Descripción del producto",
  price: 100000,
  compareAtPrice: 150000,
  quantity: 10,
  category: "Ropa",
  images: [
    { url: "https://...", alt: "..." },
    { url: "https://...", alt: "..." }
  ],
  status: "active",
  slug: "nombre-del-producto",
  featured: true,
  tags: ["nuevo", "destacado"],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  vendor: "Nombre del Vendedor",
  sales_count: 50,
  url: "/products/nombre-del-producto",
  attributes: [
    {
      name: "Color",
      values: ["Rojo", "Azul", "Verde"]
    },
    {
      name: "Talla",
      values: ["S", "M", "L", "XL"]
    }
  ]
}
```

## Funciones de Utilidad

El sistema proporciona estas funciones de utilidad:

```javascript
// Formateo de moneda usando la función global de la tienda
window.formatMoney(amount);

// Función para agregar al carrito
window.addProductToCart(productId, quantity);

// Función para parsear tags
this.parseTags(tags); // Convierte string o array a array
```

## Ejemplo de Implementación

Para implementar un template personalizado:

1. **Crea el archivo** `product-template.js` con tu diseño
2. **Sube el archivo** a tu CDN en la ruta: `https://cdn.fasttify.com/templates/{tu-store-id}/product-template.js`
3. **El sistema automáticamente** detectará y usará tu template

## Ventajas

- ✅ **Consistencia visual**: Los productos filtrados se ven igual que los originales
- ✅ **Personalización completa**: Cada tienda puede tener su propio diseño
- ✅ **Fallback robusto**: Siempre hay un template funcional
- ✅ **Mantenimiento fácil**: Los cambios en el template se aplican automáticamente
- ✅ **Performance**: Los templates se cargan dinámicamente solo cuando es necesario

## Troubleshooting

### Los productos filtrados no se ven igual

1. Verifica que tu template personalizado esté en la URL correcta
2. Revisa la consola del navegador para errores
3. Asegúrate de que el template exporte una función `render`

### El template no se carga

1. Verifica que la URL del template sea accesible
2. Asegúrate de que el archivo sea un módulo ES6 válido
3. Revisa que el storeId en la URL sea correcto

### Errores de JavaScript

1. Verifica que todas las funciones de utilidad estén disponibles
2. Asegúrate de que el template maneje casos donde los datos pueden ser undefined
3. Usa try-catch para manejar errores en el template
