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
- ✅ **Datos siempre frescos** sin cache para máxima confiabilidad
- ✅ **Arquitectura modular** con separación de responsabilidades
- ✅ **Soporte para atributos de producto** (color, talla, etc.)
- ✅ **Integración automática con header** para contadores
- ✅ **Sistema de templates** para generación de HTML
- ✅ **Helpers reutilizables** para formateo y utilidades

## Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Tema Liquid   │    │   Módulos JS    │    │   API REST      │
│                 │    │                 │    │                 │
│ (Botones, HTML) │◄──►│ (Cart System)   │◄──►│ (Gestión Carrito)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │   Eventos DOM   │    │   Base de Datos │
         │              │                 │    │                 │
         │              │ (cart:open, etc)│    │ (Cart Items)    │
         └──────────────└─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cart API      │    │  Cart Helpers   │    │ Cart Templates  │
│                 │    │                 │    │                 │
│ (API calls)     │    │ (Utilities)     │    │ (HTML gen)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │   Cart UI       │    │   Side Cart     │
         │              │                 │    │                 │
         │              │ (UI controls)   │    │ (Main logic)    │
         └──────────────└─────────────────┘    └─────────────────┘
```

**Nota**: El sistema NO utiliza cache para garantizar que los datos del carrito estén siempre actualizados y frescos desde la base de datos.

## Componentes del Sistema

### 1. API REST del Carrito

**Endpoint base**: `/api/stores/[storeId]/cart`

**Características de la API**:

- 🚫 **Sin cache**: Todos los datos se obtienen directamente de la base de datos
- 🔄 **Siempre fresco**: Garantiza que los datos estén actualizados
- 📊 **Logging detallado**: Para debugging en producción
- 🍪 **Gestión de sesiones**: Con cookies persistentes

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

### 2. Arquitectura Modular del JavaScript

El sistema de carrito ha sido refactorizado en una arquitectura modular para mejorar la mantenibilidad y separación de responsabilidades. Los módulos se cargan en el siguiente orden:

#### Módulos del Sistema de Carrito

**1. `cart-api.js` - Gestión de API**

```javascript
class CartAPI {
  constructor() {
    this.baseURL = '/api/stores';
  }

  async getCart() {
    /* Obtener carrito actual */
  }
  async addToCart(productId, quantity, selectedAttributes) {
    /* Agregar producto */
  }
  async updateCartItem(itemId, quantity) {
    /* Actualizar cantidad */
  }
  async removeCartItem(itemId) {
    /* Eliminar item */
  }
  async clearCart() {
    /* Limpiar carrito */
  }
}

window.cartAPI = new CartAPI();
```

**2. `cart-helpers.js` - Utilidades y Helpers**

```javascript
class CartHelpers {
  static formatMoney(amount) {
    /* Formatear moneda */
  }
  static getSelectedAttributes() {
    /* Obtener atributos seleccionados */
  }
  static capitalizeFirst(str) {
    /* Capitalizar texto */
  }
  static showError(message) {
    /* Mostrar error */
  }
  static showSuccess(message) {
    /* Mostrar éxito */
  }
  static debounce(func, wait) {
    /* Debounce para inputs */
  }
}

window.CartHelpers = CartHelpers;
```

**3. `cart-templates.js` - Generación de HTML**

```javascript
class CartTemplates {
  static generateCartItemHtml(item) {
    /* HTML de item */
  }
  static generateCartFooterHtml(cart) {
    /* HTML de footer */
  }
  static generateEmptyCartHtml() {
    /* HTML de carrito vacío */
  }
  static generateErrorStateHtml() {
    /* HTML de error */
  }
  static generateLoadingStateHtml() {
    /* HTML de carga */
  }
}

window.CartTemplates = CartTemplates;
```

**4. `cart-ui.js` - Controles de Interfaz**

```javascript
class CartUI {
  constructor(sidebar) {
    /* Inicializar UI */
  }

  setLoadingState(loading) {
    /* Estado de carga */
  }
  updateCartDisplay(cart) {
    /* Actualizar display */
  }
  updateCartCounters(cart) {
    /* Actualizar contadores */
  }
  renderCartItems(cart) {
    /* Renderizar items */
  }
  setupQuantityControls() {
    /* Configurar controles */
  }
  setupRemoveButtons() {
    /* Configurar botones */
  }
}

window.CartUI = CartUI;
```

**5. `side-cart.js` - Lógica Principal**

```javascript
class SideCart {
  constructor() {
    /* Inicializar carrito */
  }

  open() {
    /* Abrir carrito */
  }
  close() {
    /* Cerrar carrito */
  }
  updateQuantity(itemId, quantity) {
    /* Actualizar cantidad */
  }
  removeItem(itemId) {
    /* Eliminar item */
  }
  clearCart() {
    /* Limpiar carrito */
  }
  refresh() {
    /* Recargar carrito */
  }
}

// Funciones globales
window.openCart = () => document.dispatchEvent(new CustomEvent('cart:open'));
window.closeCart = () => document.dispatchEvent(new CustomEvent('cart:close'));
window.addProductToCart = async (productId, quantity) => {
  /* Agregar producto */
};
```

#### Orden de Carga de Módulos

```liquid
<!-- En layout/theme.liquid -->
{{ 'cart/cart-api.js' | asset_url | script_tag }}
{{ 'cart/cart-helpers.js' | asset_url | script_tag }}
{{ 'cart/cart-templates.js' | asset_url | script_tag }}
{{ 'cart/cart-ui.js' | asset_url | script_tag }}
{{ 'cart/side-cart.js' | asset_url | script_tag }}
```

### 3. JavaScript del Carrito Lateral (Legacy)

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

### 3. Soporte para Atributos de Producto

El sistema ahora soporta la captura y almacenamiento de atributos de producto seleccionados (como color, talla, etc.) cuando se agregan productos al carrito.

#### Captura de Atributos

Los atributos se capturan automáticamente desde elementos HTML con los siguientes atributos:

```html
<!-- Para colores -->
<button class="color-swatch" data-option-name="color" data-option-value="red" onclick="selectOption(this)"></button>

<!-- Para tallas u otros atributos -->
<button class="attribute-value-item" data-option-name="size" data-option-value="large" onclick="selectOption(this)">
  Large
</button>
```

#### Función de Selección de Atributos

```javascript
// En product-details.js
function selectOption(element) {
  // Remover selección previa
  const siblings = Array.from(element.parentNode.children);
  siblings.forEach((sibling) => {
    if (sibling.classList.contains('attribute-value-item') || sibling.classList.contains('color-swatch')) {
      sibling.classList.remove('selected');
    }
  });

  // Seleccionar elemento actual
  element.classList.add('selected');
}
```

#### Obtención de Atributos Seleccionados

```javascript
// En cart-helpers.js
static getSelectedAttributes() {
  const selectedAttributes = {};
  const selectedOptions = document.querySelectorAll(
    '.product-option-group .selected, .attribute-values-list .selected'
  );

  selectedOptions.forEach(option => {
    const optionName = option.dataset.optionName;
    const optionValue = option.dataset.optionValue;
    if (optionName && optionValue) {
      selectedAttributes[optionName] = optionValue;
    }
  });

  return selectedAttributes;
}
```

#### Visualización en el Carrito

Los atributos seleccionados se muestran en el carrito:

```html
<div class="cart-item-attributes">
  <span class="cart-item-attribute">Color: Red</span>
  <span class="cart-item-attribute">Size: Large</span>
</div>
```

### 4. Eventos Personalizados

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

### 1. Integración Automática con Header

El sistema ahora incluye integración automática con el header para actualizar contadores de carrito en tiempo real.

#### Configuración del Header

```javascript
// En header.js
const cartCountElement = document.querySelector('[data-cart-count]');

if (cartCountElement) {
  // Escuchar actualizaciones del carrito
  document.addEventListener('cart:updated', function (event) {
    const cart = event.detail.cart;
    if (cart && typeof cart.item_count !== 'undefined') {
      cartCountElement.textContent = cart.item_count;
    }
  });

  // Actualización inicial del carrito
  if (window.sideCart) {
    window.sideCart
      .refresh()
      .then(() => {
        console.log('Initial cart refresh completed');
      })
      .catch((error) => {
        console.error('Error refreshing cart on header load:', error);
      });
  }
}
```

#### HTML del Header

```liquid
<!-- En snippets/header.liquid -->
<button type="button" class="header-icon header-cart" aria-label="cart" onclick="openCart()">
  <span class="cart-icon-wrapper">
    <img src="{{ 'icon-cart.svg' | asset_url }}" alt="Cart" width="24" height="24" loading="lazy">
    <span class="cart-count" data-cart-count>{{ cart.item_count }}</span>
  </span>
</button>
```

### 2. Estructura HTML Requerida

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

**Nota**: La sección del carrito ahora es completamente dinámica. Todo el contenido se genera mediante JavaScript usando los templates del sistema modular, eliminando la necesidad de HTML estático de Liquid.

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
</head>

<body>
  <!-- ... contenido de la página ... -->

  <!-- Módulos del Carrito (orden específico) -->
  {{ 'cart/cart-api.js' | asset_url | script_tag }}
  {{ 'cart/cart-helpers.js' | asset_url | script_tag }}
  {{ 'cart/cart-templates.js' | asset_url | script_tag }}
  {{ 'cart/cart-ui.js' | asset_url | script_tag }}
  {{ 'cart/side-cart.js' | asset_url | script_tag }}

  <!-- JavaScript del header (para integración de contadores) -->
  {{ 'header.js' | asset_url | script_tag }}
</body>
```

**Importante**: Los módulos del carrito deben cargarse en el orden especificado para garantizar que las dependencias estén disponibles.

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

#### 5. **Items no cargan en producción (Problema Crítico) - SOLUCIONADO**

**Síntomas:**

- El carrito aparece vacío aunque tenga productos
- Solo se muestran items después de agregar un nuevo producto
- Los items desaparecen al recargar la página

**Causa Raíz Identificada:**

El problema principal era el **cache inconsistente** que causaba que los datos del carrito no se actualizaran correctamente en producción.

**Solución Definitiva Implementada:**

**🚫 ELIMINACIÓN COMPLETA DEL CACHE DEL CARRITO**

El sistema ahora **NO utiliza cache** para el carrito, garantizando que todos los datos se obtengan directamente de la base de datos:

```typescript
// ANTES (con cache problemático):
const cached = cacheManager.getCached(cacheKey);
if (cached) {
  return NextResponse.json({ success: true, cart: cached });
}

// AHORA (sin cache, siempre fresco):
const cart = await cartFetcher.getCart(storeId, sessionId);
const transformedCart = cartFetcher.transformCartToContext(cart);
return NextResponse.json({ success: true, cart: transformedCart });
```

**Beneficios de la Eliminación del Cache:**

- ✅ **Datos siempre actualizados** - No hay riesgo de cache desactualizado
- ✅ **Sin problemas de invalidación** - No hay cache que limpiar
- ✅ **Simplicidad** - Menos complejidad en el código
- ✅ **Confiabilidad** - Garantiza que los datos sean frescos
- ✅ **Debugging más fácil** - Menos variables que puedan fallar

**Configuración Mejorada de Cookies (Mantenida):**

```typescript
export const getCartCookieOptions = () => {
  const isProduction = process.env.APP_ENV === 'production';

  return {
    httpOnly: false, // Accesible desde JavaScript
    secure: isProduction,
    sameSite: isProduction ? 'strict' : ('lax' as 'strict' | 'lax'),
    maxAge: 60 * 60 * 24 * 90, // 90 días para carritos
    path: '/',
  };
};
```

**Logging Detallado (Mantenido):**

```typescript
logger.info(`[Cart API] GET request - storeId: ${storeId}, sessionId: ${sessionId || 'NOT_FOUND'}`, null, 'CartAPI');
logger.info(`[Cart API] Fetching fresh cart from database for sessionId: ${sessionId}`, null, 'CartAPI');
logger.info(
  `[Cart API] Fresh cart data retrieved for sessionId: ${sessionId}, items: ${transformedCart?.item_count || 0}`,
  null,
  'CartAPI'
);
```

**Estado Actual:**

🎉 **PROBLEMA RESUELTO** - El carrito ahora funciona de manera confiable en producción sin problemas de carga de items.
}
}
} catch (error) {
// Mostrar estado de error con botón de reintentar
this.showErrorState();
}
}

````

**E. Scripts de Diagnóstico y Prueba:**

```javascript
// Habilitar debug desde consola
window.enableCartDebug();

// Ver información de debug
window.sideCart?.showDebugInfo();

// Ejecutar tests de verificación (requiere cart-test.js)
window.runCartTests();
````

**Pasos de Verificación:**

1. **Verificar Cookies:**

   ```javascript
   // En consola del navegador
   console.log('Cart Cookie:', document.cookie.includes('fasttify_cart_session_id'));
   ```

2. **Verificar Cache:**

   ```javascript
   // Habilitar debug
   localStorage.setItem('cart-debug', 'true');
   location.reload();
   ```

3. **Verificar Logs del Servidor:**

   ```bash
   # En CloudWatch Logs
   grep "Cart API" /aws/lambda/your-function-name
   ```

4. **Verificar Base de Datos:**
   ```sql
   -- Verificar carritos existentes
   SELECT * FROM Cart WHERE sessionId = 'your-session-id';
   ```

**Variables de Entorno Requeridas:**

```bash
# En producción
APP_ENV=production
COOKIE_DOMAIN=.tudominio.com  # Opcional, para cookies de dominio
```

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

#### Script de Diagnóstico Avanzado

```javascript
// Habilitar modo debug completo
window.enableCartDebug();

// Ver información detallada
window.sideCart?.showDebugInfo();

// Forzar refresh del carrito
window.sideCart?.refresh();
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
