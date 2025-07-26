# Sistema de Carrito para Desarrolladores de Temas

## Resumen

El sistema de carrito de Fasttify proporciona una funcionalidad completa de carrito de compras con interfaz lateral (side cart) que se integra perfectamente con los temas Liquid. El sistema incluye gestión de productos, controles de cantidad, eliminación de items y limpieza completa del carrito.

## Características Principales

- ✅ **Carrito lateral deslizable** con overlay
- ✅ **Controles de cantidad** con botones +/- e input manual
- ✅ **Eliminación individual** de productos
- ✅ **Limpieza completa** del carrito
- ✅ **Actualización en tiempo real** sin recargar página
- ✅ **Estados de carga** con spinner
- ✅ **Persistencia por sesión** con cookies
- ✅ **API REST completa** para todas las operaciones
- ✅ **Eventos personalizados** para integración con temas

## Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Tema Liquid   │    │   Side Cart JS  │    │   API REST      │
│                 │    │                 │    │                 │
│ (Botones, HTML) │◄──►│ (Lógica Frontend)│◄──►│ (Gestión Carrito)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │   Eventos DOM   │    │   Base de Datos │
         │              │                 │    │                 │
         │              │ (cart:open, etc)│    │ (Cart Items)    │
         └──────────────└─────────────────┘    └─────────────────┘
```

## Componentes del Sistema

### 1. API REST del Carrito

**Endpoint base**: `/api/stores/[storeId]/cart`

#### GET - Obtener carrito actual

```http
GET /api/stores/STORE_ID/cart
```

**Respuesta**:

```json
{
  "success": true,
  "cart": {
    "items": [
      {
        "id": "item_123",
        "product_id": "prod_456",
        "variant_id": "var_789",
        "title": "Camiseta Básica",
        "price": 2500,
        "line_price": 5000,
        "quantity": 2,
        "image": "https://...",
        "url": "/products/camiseta-basica",
        "variant_title": "Talla M - Azul"
      }
    ],
    "item_count": 2,
    "total_price": 5000
  }
}
```

#### POST - Agregar producto al carrito

```http
POST /api/stores/STORE_ID/cart
Content-Type: application/json

{
  "productId": "prod_456",
  "variantId": "var_789",
  "quantity": 1
}
```

#### PATCH - Actualizar cantidad

```http
PATCH /api/stores/STORE_ID/cart
Content-Type: application/json

{
  "itemId": "item_123",
  "quantity": 3
}
```

#### DELETE - Limpiar carrito completo

```http
DELETE /api/stores/STORE_ID/cart
```

### 2. JavaScript del Carrito Lateral

El archivo `template/assets/side-cart.js` contiene toda la lógica del carrito:

#### Clase Principal: `SideCart`

```javascript
class SideCart {
  constructor() {
    this.overlay = document.querySelector('[data-cart-overlay]');
    this.sidebar = document.querySelector('[data-cart-sidebar]');
    this.cartContentContainer = this.sidebar?.querySelector('.cart-content');
    this.cartTotalElements = document.querySelectorAll('[data-cart-total]');
    this.cartCountElements = document.querySelectorAll('[data-cart-count]');

    this.isOpen = false;
    this.isUpdating = false;

    this.init();
  }
}
```

#### Métodos Principales

- `open()` - Abre el carrito lateral
- `close()` - Cierra el carrito lateral
- `updateQuantity(itemId, quantity)` - Actualiza cantidad de un item
- `removeItem(itemId)` - Elimina un item específico
- `clearCart()` - Limpia todo el carrito
- `refresh()` - Recarga el carrito desde la API

### 3. Eventos Personalizados

El sistema emite eventos DOM para integración con temas:

```javascript
// Abrir carrito
document.dispatchEvent(new CustomEvent('cart:open'));

// Cerrar carrito
document.dispatchEvent(new CustomEvent('cart:close'));

// Carrito actualizado
document.dispatchEvent(
  new CustomEvent('cart:updated', {
    detail: { cart: cartData },
  })
);
```

## Implementación en Temas

### 1. Estructura HTML Requerida

#### Carrito Lateral (Obligatorio)

```liquid
<!-- sections/cart.liquid -->
<div id="cart-overlay" class="cart-overlay" data-cart-overlay>
  <div class="cart-sidebar" data-cart-sidebar>
    <!-- Loading Overlay -->
    <div class="cart-loading-overlay">
      <div class="cart-loading-spinner"></div>
    </div>

    <!-- Header -->
    <div class="cart-header">
      <h2 class="cart-title">Tu carrito</h2>
      <button type="button" class="cart-close" data-cart-close>
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
    </div>

    <!-- Contenido dinámico -->
    <div class="cart-content">
      <!-- El contenido se genera dinámicamente por JavaScript -->
    </div>
  </div>
</div>
```

#### Botones para Abrir Carrito

```liquid
<!-- En cualquier parte del tema -->
<button type="button" data-open-cart>
  Carrito ({{ cart.item_count }})
</button>

<!-- O usando función global -->
<button type="button" onclick="openCart()">
  Ver Carrito
</button>
```

#### Contadores de Carrito

```liquid
<!-- Contador de items -->
<span data-cart-count>{{ cart.item_count }}</span>

<!-- Total del carrito -->
<span data-cart-total>{{ cart.total_price | money }}</span>
```

### 2. Botones de Producto

#### Agregar al Carrito

```liquid
<!-- En product-card.liquid o product.liquid -->
<button
  type="button"
  onclick="addToCart('{{ product.id }}', 1)"
  class="add-to-cart-btn">
  Agregar al Carrito
</button>

<!-- Con variante específica -->
<button
  type="button"
  onclick="addToCart('{{ product.id }}', 1, '{{ variant.id }}')"
  class="add-to-cart-btn">
  Agregar al Carrito
</button>
```

### 3. Inclusión de Assets

#### En layout/theme.liquid

```liquid
<head>
  <!-- ... otros elementos ... -->

  <!-- CSS del carrito -->
  {{ 'cart.css' | asset_url | stylesheet_tag }}

  <!-- JavaScript del carrito -->
  {{ 'side-cart.js' | asset_url | script_tag }}
</head>
```

## Funcionalidades Disponibles

### 1. Controles de Cantidad

El sistema genera automáticamente controles de cantidad para cada item:

```html
<div class="cart-item-quantity-controls">
  <button class="quantity-button minus" data-quantity-minus data-item-id="item_123">-</button>
  <input type="number" class="quantity-input" value="2" data-item-id="item_123" />
  <button class="quantity-button plus" data-quantity-plus data-item-id="item_123">+</button>
</div>
```

**Comportamiento**:

- **Botón +**: Incrementa cantidad
- **Botón -**: Decrementa cantidad (si llega a 0, elimina el item)
- **Input**: Cambio manual con debounce de 500ms

### 2. Eliminación de Items

```html
<button class="cart-item-remove" data-remove-item data-item-id="item_123">
  <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-close" viewBox="0 0 16 16">
    <path
      d="M14.7 1.3c-.4-.4-1-.4-1.4 0L8 6.6 2.7 1.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4L6.6 8l-5.3 5.3c.4.4 1 .4 1.4 0s.4-1 0-1.4L9.4 8l5.3-5.3c.4-.4.4-1 0-1.4z" />
  </svg>
</button>
```

### 3. Limpieza Completa

El botón "Limpiar Carrito" aparece en el footer del carrito y solicita confirmación antes de eliminar todos los items.

## Personalización CSS

### Variables CSS Disponibles

```css
:root {
  --font-heading: 'Your Heading Font', sans-serif;
  --font-body: 'Your Body Font', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
}
```

### Clases CSS Principales

```css
/* Contenedor principal */
.cart-overlay {
  /* Overlay de fondo */
}
.cart-sidebar {
  /* Panel lateral */
}

/* Header */
.cart-header {
  /* Encabezado del carrito */
}
.cart-title {
  /* Título "Tu carrito" */
}
.cart-close {
  /* Botón de cerrar */
}

/* Items */
.cart-item {
  /* Contenedor de cada item */
}
.cart-item-image {
  /* Imagen del producto */
}
.cart-item-details {
  /* Detalles del producto */
}
.cart-item-title {
  /* Título del producto */
}
.cart-item-price {
  /* Precio del producto */
}

/* Controles */
.cart-item-quantity-controls {
  /* Contenedor de controles */
}
.quantity-button {
  /* Botones +/- */
}
.quantity-input {
  /* Input de cantidad */
}
.cart-item-remove {
  /* Botón de eliminar */
}

/* Footer */
.cart-footer {
  /* Pie del carrito */
}
.cart-actions {
  /* Botones de acción */
}
.cart-checkout-btn {
  /* Botón de checkout */
}
.cart-clear-btn {
  /* Botón de limpiar */
}

/* Estados */
.cart-loading-overlay {
  /* Overlay de carga */
}
.cart-loading-spinner {
  /* Spinner de carga */
}
```

## Funciones JavaScript Globales

### `openCart()`

Abre el carrito lateral.

### `closeCart()`

Cierra el carrito lateral.

### `addToCart(productId, quantity, variantId)`

Agrega un producto al carrito.

**Parámetros**:

- `productId` (string): ID del producto
- `quantity` (number): Cantidad (opcional, default: 1)
- `variantId` (string): ID de la variante (opcional)

**Ejemplo**:

```javascript
// Agregar 1 unidad del producto
addToCart('prod_123');

// Agregar 3 unidades de una variante específica
addToCart('prod_123', 3, 'var_456');
```

## Estados del Carrito

### Estados de Carga

- **Cargando**: Muestra spinner y deshabilita botones
- **Actualizando**: Previene múltiples operaciones simultáneas
- **Error**: Muestra mensaje de error y recarga estado

### Estados del Carrito

- **Vacío**: Muestra mensaje "Tu carrito está vacío"
- **Con items**: Muestra lista de productos y totales
- **Error**: Muestra mensaje de error con opción de recargar

## Mejores Prácticas

### 1. **Siempre Verificar Existencia**

```liquid
{% if cart and cart.items.size > 0 %}
  <!-- Mostrar carrito con items -->
{% else %}
  <!-- Mostrar carrito vacío -->
{% endif %}
```

### 2. **Usar Eventos para Sincronización**

```javascript
// Escuchar actualizaciones del carrito
document.addEventListener('cart:updated', (e) => {
  const cart = e.detail.cart;
  // Actualizar contadores en el header
  updateCartCounters(cart);
});
```

### 3. **Manejar Errores Gracefully**

```javascript
try {
  await addToCart(productId, quantity);
} catch (error) {
  console.error('Error adding to cart:', error);
  // Mostrar mensaje de error al usuario
}
```

### 4. **Optimizar para Móvil**

```css
@media (max-width: 480px) {
  .cart-sidebar {
    max-width: 100%;
  }

  .cart-item-image img {
    width: 60px;
    height: 60px;
  }
}
```

## Troubleshooting

### Problemas Comunes

#### 1. Carrito no se abre

- Verificar que `side-cart.js` esté incluido
- Verificar que existan los elementos `[data-cart-overlay]` y `[data-cart-sidebar]`
- Revisar consola para errores JavaScript

#### 2. Controles de cantidad no funcionan

- Verificar que los elementos tengan los atributos `data-quantity-plus`, `data-quantity-minus`
- Verificar que el `data-item-id` esté presente
- Revisar que `STORE_ID` esté definido globalmente

#### 3. API retorna errores

- Verificar que la tienda exista en la base de datos
- Revisar logs del servidor para errores específicos
- Verificar configuración de CORS

#### 4. Carrito no persiste entre páginas

- Verificar que las cookies estén habilitadas
- Revisar configuración de cookies en el servidor
- Verificar que el `sessionId` se esté generando correctamente

### Debugging

#### Logs del Cliente

```javascript
// Habilitar logs detallados
localStorage.setItem('cart-debug', 'true');

// Ver logs en consola
console.log('Cart state:', window.cartState);
```

#### Logs del Servidor

```bash
# Ver logs de la API del carrito
tail -f logs/api-cart.log

# Ver logs de errores
grep "cart" logs/error.log
```

## Ejemplos Completos

### 1. Header con Contador de Carrito

```liquid
<!-- sections/header.liquid -->
<header class="site-header">
  <div class="header-cart">
    <button type="button" data-open-cart class="cart-button">
      <svg class="cart-icon" viewBox="0 0 24 24">
        <path d="M9 22c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm8 0c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1z"/>
      </svg>
      <span class="cart-count" data-cart-count>{{ cart.item_count }}</span>
    </button>
  </div>
</header>
```

### 2. Producto con Botón de Agregar

```liquid
<!-- snippets/product-card.liquid -->
<div class="product-card">
  <img src="{{ product.featured_image }}" alt="{{ product.title }}">
  <h3>{{ product.title }}</h3>
  <p>{{ product.price | money }}</p>

  <button
    type="button"
    onclick="addToCart('{{ product.id }}', 1)"
    class="add-to-cart-btn">
    Agregar al Carrito
  </button>
</div>
```

### 3. Página de Producto Completa

```liquid
<!-- templates/product.liquid -->
<div class="product-page">
  <div class="product-images">
    <img src="{{ product.featured_image }}" alt="{{ product.title }}">
  </div>

  <div class="product-info">
    <h1>{{ product.title }}</h1>
    <p class="price">{{ product.price | money }}</p>
    <div class="description">{{ product.description }}</div>

    <div class="product-actions">
      <div class="quantity-selector">
        <button type="button" onclick="updateQuantity(-1)">-</button>
        <input type="number" id="quantity" value="1" min="1">
        <button type="button" onclick="updateQuantity(1)">+</button>
      </div>

      <button
        type="button"
        onclick="addToCart('{{ product.id }}', document.getElementById('quantity').value)"
        class="add-to-cart-btn">
        Agregar al Carrito
      </button>
    </div>
  </div>
</div>

<script>
function updateQuantity(change) {
  const input = document.getElementById('quantity')
  const newValue = Math.max(1, parseInt(input.value) + change)
  input.value = newValue
}
</script>
```

## Integración con Temas Existentes

### Migración desde Shopify

1. Reemplazar `{{ cart | json }}` con el sistema de eventos
2. Actualizar botones para usar `addToCart()`
3. Incluir `side-cart.js` y `cart.css`
4. Adaptar contadores para usar `data-cart-count` y `data-cart-total`

### Migración desde Otros Sistemas

1. Implementar estructura HTML del carrito lateral
2. Configurar botones con `data-open-cart`
3. Adaptar funciones de agregar al carrito
4. Personalizar estilos CSS según el diseño

## Consideraciones de Performance

### Optimizaciones Implementadas

- **Debounce** en inputs de cantidad (500ms)
- **Cache** de datos del carrito
- **Lazy loading** de imágenes
- **Event delegation** para controles dinámicos

### Recomendaciones

- Usar imágenes optimizadas para el carrito
- Implementar skeleton loading para mejor UX
- Considerar preload de assets críticos
- Monitorear métricas de Core Web Vitals

---

**Última actualización**: Sistema de carrito completamente funcional con todas las características implementadas.

El sistema está listo para usar en producción y proporciona una experiencia de carrito completa y profesional para cualquier tema de Fasttify.
