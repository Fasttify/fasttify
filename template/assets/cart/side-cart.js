/**
 * Side Cart - Main Module
 * Coordina todos los módulos del carrito
 */

class SideCart {
  constructor() {
    this.overlay = document.querySelector('[data-cart-overlay]');
    this.sidebar = document.querySelector('[data-cart-sidebar]');
    this.closeBtn = document.querySelector('[data-cart-close]');
    this.isOpen = false;
    this.isUpdating = false;
    this.isRefreshing = false;
    this.ui = new CartUI(this.sidebar);
    this.init();
  }

  init() {
    if (!this.overlay || !this.sidebar) return;

    this.setupEventListeners();
    this.refresh();
  }

  setupEventListeners() {
    // Close button
    this.closeBtn?.addEventListener('click', () => this.close());

    // Overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    // Custom events
    document.addEventListener('cart:open', () => {
      this.open();
    });
    document.addEventListener('cart:close', () => {
      this.close();
    });
    document.addEventListener('cart:updated', (e) => {
      this.ui.updateCartDisplay(e.detail.cart);
    });

    // Open cart buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-open-cart]')) {
        e.preventDefault();
        this.open();
      }
    });
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    this.overlay.classList.add('active');

    setTimeout(() => {
      const firstFocusable = this.sidebar.querySelector('button, input, [tabindex]:not([tabindex="-1"])');
      firstFocusable?.focus();
    }, 300);
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    document.body.style.overflow = '';
    this.overlay.classList.remove('active');
  }

  async updateQuantity(itemId, quantity) {
    if (this.isUpdating) return;

    try {
      this.isUpdating = true;
      this.ui.setLoadingState(true);

      const data = await cartAPI.updateCartItem(itemId, quantity);
      this.ui.updateCartDisplay(data.cart);
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: data.cart } }));
    } catch (error) {
      CartHelpers.showError(`Error al actualizar cantidad: ${error.message || 'Hubo un problema'}`);
      this.refresh();
    } finally {
      this.isUpdating = false;
      this.ui.setLoadingState(false);
    }
  }

  async removeItem(itemId) {
    if (this.isUpdating) return;

    try {
      this.isUpdating = true;
      this.ui.setLoadingState(true);

      const data = await cartAPI.removeCartItem(itemId);
      this.ui.updateCartDisplay(data.cart);
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: data.cart } }));
    } catch (error) {
      CartHelpers.showError(`Error al eliminar producto: ${error.message || 'Hubo un problema'}`);
      this.refresh();
    } finally {
      this.isUpdating = false;
      this.ui.setLoadingState(false);
    }
  }

  async clearCart() {
    if (this.isUpdating) return;

    if (!confirm('¿Estás seguro de que quieres limpiar todo el carrito?')) {
      return;
    }

    try {
      this.isUpdating = true;
      this.ui.setLoadingState(true);

      const data = await cartAPI.clearCart();
      this.ui.updateCartDisplay(data.cart);
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: data.cart } }));
    } catch (error) {
      CartHelpers.showError(`Error al limpiar el carrito: ${error.message || 'Hubo un problema'}`);
      this.refresh();
    } finally {
      this.isUpdating = false;
      this.ui.setLoadingState(false);
    }
  }

  async refresh() {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;
    this.ui.setLoadingState(true);

    try {
      const data = await cartAPI.getCart();

      if (data.success && data.cart) {
        this.ui.updateCartDisplay(data.cart);
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: data.cart } }));
      } else {
        console.warn('[SideCart] Cart refresh returned no data or error:', data);
        this.ui.updateCartDisplay({ items: [], item_count: 0, total_price: 0 });
      }
    } catch (error) {
      console.error('[SideCart] Error refreshing cart from API:', error);
      this.ui.updateCartDisplay({ items: [], item_count: 0, total_price: 0 });
    } finally {
      this.isRefreshing = false;
      this.ui.setLoadingState(false);
    }
  }
}

// Global functions for external use
window.openCart = () => {
  document.dispatchEvent(new CustomEvent('cart:open'));
};
window.closeCart = () => document.dispatchEvent(new CustomEvent('cart:close'));

// Product cart functions
window.addProductToCart = async function (productId, quantity = 1) {
  try {
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
      const originalText = addToCartBtn.innerHTML;
      addToCartBtn.innerHTML = '<span>AGREGANDO...</span>';
      addToCartBtn.disabled = true;

      const selectedAttributes = CartHelpers.getSelectedAttributes();
      const data = await cartAPI.addToCart(productId, quantity, selectedAttributes);

      const quantityInput = document.getElementById('product-quantity');
      if (quantityInput) quantityInput.value = 1;

      addToCartBtn.innerHTML = '<span>¡AGREGADO!</span>';

      // Update cart display and open cart
      window.sideCart.ui.updateCartDisplay(data.cart);
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: data.cart } }));
      document.dispatchEvent(new CustomEvent('cart:open'));

      setTimeout(() => {
        addToCartBtn.innerHTML = originalText;
        addToCartBtn.disabled = false;
      }, 2000);
    } else {
      // Para productos de la lista (sin botón específico)
      const selectedAttributes = CartHelpers.getSelectedAttributes();
      const data = await cartAPI.addToCart(productId, quantity, selectedAttributes);

      // Update cart display and open cart
      window.sideCart.ui.updateCartDisplay(data.cart);
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: data.cart } }));
      document.dispatchEvent(new CustomEvent('cart:open'));
    }
  } catch (error) {
    console.error('Error in addProductToCart:', error);
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.innerHTML = '<span>AÑADIR AL CARRITO</span>';
      addToCartBtn.disabled = false;
    }
  }
};

window.addToCart = async function (productId, quantity = 1, selectedAttributes = {}) {
  try {
    const data = await cartAPI.addToCart(productId, quantity, selectedAttributes);
    document.dispatchEvent(new CustomEvent('cart:open'));
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: data.cart } }));
    return data.cart;
  } catch (error) {
    CartHelpers.showError(`Error al añadir al carrito: ${error.message || 'Hubo un problema'}`);
    throw error;
  }
};

let sideCartInstance = null;

if (!window.sideCartInitialized) {
  window.sideCartInitialized = true;

  const initializeSideCart = () => {
    if (!sideCartInstance) {
      sideCartInstance = new SideCart();
      window.sideCart = sideCartInstance;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSideCart);
  } else {
    initializeSideCart();
  }
}
