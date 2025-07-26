/**
 * Cart UI Module
 * Maneja la interfaz de usuario del carrito
 */

class CartUI {
  constructor(sidebar) {
    this.sidebar = sidebar;
    this.cartContentContainer = sidebar?.querySelector('.cart-content');
    this.cartTotalElements = document.querySelectorAll('[data-cart-total]');
    this.cartCountElements = document.querySelectorAll('[data-cart-count]');
  }

  setLoadingState(loading) {
    const updateBtn = this.sidebar.querySelector('.cart-update-btn');
    const checkoutBtn = this.sidebar.querySelector('.cart-checkout-btn');
    const loadingOverlay = this.sidebar.querySelector('.cart-loading-overlay');

    if (loading) {
      updateBtn?.setAttribute('disabled', '');
      checkoutBtn?.setAttribute('disabled', '');
      this.sidebar.style.pointerEvents = 'none';
      loadingOverlay?.classList.add('active');
    } else {
      updateBtn?.removeAttribute('disabled');
      checkoutBtn?.removeAttribute('disabled');
      this.sidebar.style.pointerEvents = '';
      loadingOverlay?.classList.remove('active');
    }
  }

  updateCartDisplay(cart) {
    if (!this.cartContentContainer) return;

    if (!cart || !Array.isArray(cart.items)) {
      console.error('updateCartDisplay received invalid cart object or missing items array:', cart);
      this.cartContentContainer.innerHTML = CartTemplates.generateErrorStateHtml();
      this.hideCartFooter();
      return;
    }

    this.updateCartCounters(cart);

    if (cart.item_count === 0) {
      this.cartContentContainer.innerHTML = CartTemplates.generateEmptyCartHtml();
      this.hideCartFooter();
    } else {
      this.renderCartItems(cart);
      this.showCartFooter();
    }

  }

  updateCartCounters(cart) {
    this.cartCountElements.forEach(el => {
      el.textContent = cart.item_count;
    });
    this.cartTotalElements.forEach(el => {
      el.textContent = CartHelpers.formatMoney(cart.total_price);
    });
  }

  renderCartItems(cart) {
    const itemsHtml = cart.items.map(item => CartTemplates.generateCartItemHtml(item)).join('');
    const footerHtml = CartTemplates.generateCartFooterHtml(cart);

    this.cartContentContainer.innerHTML = `
      <div class="cart-items">${itemsHtml}</div>
      <div class="cart-footer">${footerHtml}</div>
    `;

    // Setup controls after rendering
    this.setupQuantityControls();
    this.setupRemoveButtons();
  }

  showCartFooter() {
    const cartFooter = this.sidebar.querySelector('.cart-footer');
    if (cartFooter) cartFooter.style.display = 'block';
  }

  hideCartFooter() {
    const cartFooter = this.sidebar.querySelector('.cart-footer');
    if (cartFooter) cartFooter.style.display = 'none';
  }

  setupQuantityControls() {
    this.setupQuantityButtons();
    this.setupQuantityInputs();
  }

  setupQuantityButtons() {
    // Plus buttons
    const plusButtons = this.sidebar.querySelectorAll('[data-quantity-plus]');
    plusButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const itemId = button.getAttribute('data-item-id');
        const input = this.sidebar.querySelector(`input[data-item-id="${itemId}"]`);
        if (input) {
          const currentQuantity = parseInt(input.value) || 0;
          window.sideCart.updateQuantity(itemId, currentQuantity + 1);
        }
      });
    });

    // Minus buttons
    const minusButtons = this.sidebar.querySelectorAll('[data-quantity-minus]');
    minusButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const itemId = button.getAttribute('data-item-id');
        const input = this.sidebar.querySelector(`input[data-item-id="${itemId}"]`);
        if (input) {
          const currentQuantity = parseInt(input.value) || 0;
          if (currentQuantity > 1) {
            window.sideCart.updateQuantity(itemId, currentQuantity - 1);
          } else {
            window.sideCart.removeItem(itemId);
          }
        }
      });
    });
  }

  setupQuantityInputs() {
    this.sidebar.querySelectorAll('.quantity-input').forEach(input => {
      const debouncedUpdate = CartHelpers.debounce((itemId, quantity) => {
        if (quantity <= 0) {
          window.sideCart.removeItem(itemId);
        } else {
          window.sideCart.updateQuantity(itemId, quantity);
        }
      }, 500);

      input.addEventListener('input', (e) => {
        const itemId = e.target.getAttribute('data-item-id');
        const newQuantity = parseInt(e.target.value) || 0;
        debouncedUpdate(itemId, newQuantity);
      });

      input.addEventListener('blur', (e) => {
        const value = parseInt(e.target.value) || 0;
        if (value < 0) {
          e.target.value = 0;
        }
      });
    });
  }

  setupRemoveButtons() {
    this.sidebar.querySelectorAll('[data-remove-item]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const itemId = button.getAttribute('data-item-id');
        window.sideCart.removeItem(itemId);
      });
    });

    this.sidebar.querySelectorAll('[data-clear-cart]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        window.sideCart.clearCart();
      });
    });
  }
}

// Exportar como global
window.CartUI = CartUI;