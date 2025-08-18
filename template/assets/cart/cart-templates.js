/**
 * Cart Templates Module
 * Plantillas HTML para el carrito
 */

class CartTemplates {
  static generateCartItemHtml(item) {
    const itemPrice = CartHelpers.formatMoney(item.price);
    const itemLinePrice = CartHelpers.formatMoney(item.line_price);
    const variantHtml = item.variant_title ? `<p class="cart-item-variant">${item.variant_title}</p>` : '';

    // Generate selected attributes HTML
    let selectedAttributesHtml = '';
    if (item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0) {
      const attributesList = Object.entries(item.selectedAttributes)
        .map(([key, value]) => {
          const attributeName = CartHelpers.capitalizeFirst(key);
          const attributeValue = CartHelpers.capitalizeFirst(value);
          return `<span class="cart-item-attribute">${attributeName}: ${attributeValue}</span>`;
        })
        .join('');

      selectedAttributesHtml = `<div class="cart-item-attributes">${attributesList}</div>`;
    }

    return `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item-image">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" loading="lazy">` : '<div class="cart-item-image-placeholder"></div>'}
        </div>
        <div class="cart-item-details">
          <a href="${item.url}" class="cart-item-title">${item.title}</a>
          ${variantHtml}
          ${selectedAttributesHtml}
          <div class="cart-item-price">
            <span>${itemPrice}</span>
            ${item.quantity > 1 ? `<span class="cart-item-line-price"> / ${itemLinePrice}</span>` : ''}
          </div>
          <div class="cart-item-quantity-controls">
            <button class="quantity-button minus" data-quantity-minus data-item-id="${item.id}" aria-label="Disminuir cantidad">-</button>
            <input
              type="number"
              class="quantity-input"
              value="${item.quantity}"
              min="0"
              data-item-id="${item.id}"
              aria-label="Cantidad de producto"
            >
            <button class="quantity-button plus" data-quantity-plus data-item-id="${item.id}" aria-label="Aumentar cantidad">+</button>
          </div>
          <button class="cart-item-remove" data-remove-item data-item-id="${item.id}" aria-label="Eliminar producto">
            <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-close" viewBox="0 0 16 16">
              <path d="M14.7 1.3c-.4-.4-1-.4-1.4 0L8 6.6 2.7 1.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4L6.6 8l-5.3 5.3c-.4.4-.4 1 0 1.4s1 .4 1.4 0L8 9.4l5.3 5.3c.4.4 1 .4 1.4 0s.4-1 0-1.4L9.4 8l5.3-5.3c.4-.4.4-1 0-1.4z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  static generateCartFooterHtml(cart) {
    const subtotal = CartHelpers.formatMoney(cart.total_price);
    const totalItems = cart.item_count;

    return `
      <div class="cart-footer-summary">
        <p>Subtotal (${totalItems} artículos)</p>
        <p>${subtotal}</p>
      </div>
      <div class="cart-actions">
        <button type="button" class="button button--primary cart-checkout-btn" data-checkout-direct>Finalizar Compra</button>
        <button type="button" class="button button--danger cart-clear-btn" data-clear-cart>Limpiar Carrito</button>
      </div>
    `;
  }

  static generateEmptyCartHtml() {
    return `
      <div class="cart-empty">
        <h3 class="cart-empty-title">Tu carrito está vacío</h3>
        <p class="cart-empty-text">¿Tienes una cuenta?
          <a href="/account/login" class="cart-empty-link">Inicia sesión</a>
          para pagar más rápido.
        </p>
        <button
          type="button"
          class="cart-continue-shopping"
          data-cart-close>Seguir comprando</button>
      </div>
    `;
  }

  static generateErrorStateHtml() {
    return `
      <div class="cart-error-state">
        <p>Error al cargar el carrito</p>
        <button type="button" onclick="window.sideCart?.refresh()" class="retry-btn">
          Reintentar
        </button>
      </div>
    `;
  }

  static generateLoadingStateHtml() {
    return `
      <div class="cart-loading-overlay active">
        <div class="cart-loading-spinner"></div>
      </div>
    `;
  }
}

// Exportar como global
window.CartTemplates = CartTemplates;