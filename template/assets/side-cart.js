/**
 * Side Cart Functionality
 */

class SideCart {
  constructor() {
    this.overlay = document.querySelector('[data-cart-overlay]')
    this.sidebar = document.querySelector('[data-cart-sidebar]')
    this.closeBtn = document.querySelector('[data-cart-close]')
    this.cartContentContainer = this.sidebar?.querySelector('.cart-content')
    this.cartTotalElements = document.querySelectorAll('[data-cart-total]')
    this.cartCountElements = document.querySelectorAll('[data-cart-count]')

    this.isOpen = false
    this.isUpdating = false

    this.init()
  }

  init() {
    if (!this.overlay || !this.sidebar || !this.cartContentContainer) return

    this.closeBtn?.addEventListener('click', () => this.close())
    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close()
    })

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) this.close()
    })

    document.addEventListener('cart:open', () => this.open())
    document.addEventListener('cart:close', () => this.close())
    document.addEventListener('cart:updated', e => this.updateCartDisplay(e.detail.cart))


    document.addEventListener('click', e => {
      if (e.target.closest('[data-open-cart]')) {
        e.preventDefault()
        this.open()
      }
    })


  }

  open() {
    if (this.isOpen) return

    this.isOpen = true
    document.body.style.overflow = 'hidden'
    this.overlay.classList.add('active')

    setTimeout(() => {
      const firstFocusable = this.sidebar.querySelector(
        'button, input, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    }, 300)
  }

  close() {
    if (!this.isOpen) return

    this.isOpen = false
    document.body.style.overflow = ''
    this.overlay.classList.remove('active')
  }

  async updateQuantity(itemId, quantity) {
    if (this.isUpdating) return

    try {
      this.isUpdating = true
      this.setLoadingState(true)

      const storeId = window.STORE_ID
      if (!storeId) throw new Error('Store ID is not defined.')

      const response = await fetch(`/api/stores/${storeId}/cart`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ itemId, quantity }),
      })

      if (response.ok) {
        const data = await response.json()
        this.updateCartDisplay(data.cart)
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: data.cart } }))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error updating cart item')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      alert(`Error al actualizar cantidad: ${error.message || 'Hubo un problema'}`)
      this.refresh()
    } finally {
      this.isUpdating = false
      this.setLoadingState(false)
    }
  }

  async removeItem(itemId) {
    if (this.isUpdating) return

    try {
      this.isUpdating = true
      this.setLoadingState(true)

      const storeId = window.STORE_ID
      if (!storeId) throw new Error('Store ID is not defined.')

      const response = await fetch(`/api/stores/${storeId}/cart`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ itemId }),
      })

      if (response.ok) {
        const data = await response.json()
        this.updateCartDisplay(data.cart)
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: data.cart } }))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error removing cart item')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      alert(`Error al eliminar producto: ${error.message || 'Hubo un problema'}`)
      this.refresh()
    } finally {
      this.isUpdating = false
      this.setLoadingState(false)
    }
  }

  setLoadingState(loading) {
    const updateBtn = this.sidebar.querySelector('.cart-update-btn')
    const checkoutBtn = this.sidebar.querySelector('.cart-checkout-btn')
    const loadingOverlay = this.sidebar.querySelector('.cart-loading-overlay')

    if (loading) {
      updateBtn?.setAttribute('disabled', '')
      checkoutBtn?.setAttribute('disabled', '')
      this.sidebar.style.pointerEvents = 'none'
      loadingOverlay?.classList.add('active')
    } else {
      updateBtn?.removeAttribute('disabled')
      checkoutBtn?.removeAttribute('disabled')
      this.sidebar.style.pointerEvents = ''
      loadingOverlay?.classList.remove('active')
    }
  }

  formatMoney(amount) {
    if (typeof amount !== 'number') return 'N/A'
    return `$${(amount / 100).toFixed(2)}`
  }

  _generateCartItemHtml(item) {
    const itemPrice = this.formatMoney(item.price)
    const itemLinePrice = this.formatMoney(item.line_price)
    const variantHtml = item.variant_title ? `<p class="cart-item-variant">${item.variant_title}</p>` : ''

    return `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item-image">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" loading="lazy">` : '<div class="cart-item-image-placeholder"></div>'}
        </div>
        <div class="cart-item-details">
          <a href="${item.url}" class="cart-item-title">${item.title}</a>
          ${variantHtml}
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
    `
  }

  _generateCartFooterHtml(cart) {
    const subtotal = this.formatMoney(cart.total_price)
    const totalItems = cart.item_count

    return `
      <div class="cart-footer-summary">
        <p>Subtotal (${totalItems} artículos)</p>
        <p>${subtotal}</p>
      </div>
      <div class="cart-actions">
        <a href="/checkout" class="button button--primary cart-checkout-btn">Finalizar Compra</a>
        <button type="button" class="button button--secondary cart-close-btn" data-cart-close>Seguir Comprando</button>
      </div>
    `
  }

  updateCartDisplay(cart) {
    if (!this.cartContentContainer) return

    if (!cart || typeof cart !== 'object' || !cart.items || !Array.isArray(cart.items)) {
      console.error('updateCartDisplay received invalid cart object or missing/invalid items array:', cart);
      this.cartContentContainer.innerHTML = `
        <div class="cart-empty-state">
          <p>Error al cargar el carrito o el carrito está vacío.</p>
          <a href="/collections/all" class="button button--primary">Explorar productos</a>
        </div>
      `;
      const cartFooter = this.sidebar.querySelector('.cart-footer')
      if (cartFooter) cartFooter.style.display = 'none'
      return;
    }

    this.cartCountElements.forEach(el => {
      el.textContent = cart.item_count
    })
    this.cartTotalElements.forEach(el => {
      el.textContent = this.formatMoney(cart.total_price)
    })

    if (cart.item_count === 0) {
      this.cartContentContainer.innerHTML = `
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
      `
      const cartFooter = this.sidebar.querySelector('.cart-footer')
      if (cartFooter) cartFooter.style.display = 'none'
    } else {
      const itemsHtml = cart.items.map(item => this._generateCartItemHtml(item)).join('')
      const footerHtml = this._generateCartFooterHtml(cart)

      this.cartContentContainer.innerHTML = `
        <div class="cart-items">${itemsHtml}</div>
        <div class="cart-footer">${footerHtml}</div>
      `
      const cartFooter = this.sidebar.querySelector('.cart-footer')
      if (cartFooter) cartFooter.style.display = 'block'

      this.setupQuantityControls()
      this.setupRemoveButtons()
    }
  }

  setupQuantityControls() {
    this.sidebar.querySelectorAll('[data-quantity-minus]').forEach(button => {
      button.onclick = (e) => {
        const itemId = e.target.dataset.itemId;
        const input = this.sidebar.querySelector(`.quantity-input[data-item-id="${itemId}"]`);
        if (input) {
          let quantity = parseInt(input.value) - 1;
          this.updateQuantity(itemId, quantity);
        }
      };
    });

    this.sidebar.querySelectorAll('[data-quantity-plus]').forEach(button => {
      button.onclick = (e) => {
        const itemId = e.target.dataset.itemId;
        const input = this.sidebar.querySelector(`.quantity-input[data-item-id="${itemId}"]`);
        if (input) {
          let quantity = parseInt(input.value) + 1;
          this.updateQuantity(itemId, quantity);
        }
      };
    });
  }

  setupRemoveButtons() {
    this.sidebar.querySelectorAll('[data-remove-item]').forEach(button => {
      button.onclick = (e) => {
        const itemId = e.target.dataset.itemId;
        this.removeItem(itemId);
      };
    });
  }

  async refresh() {
    this.setLoadingState(true)
    try {
      const storeId = window.STORE_ID
      if (!storeId) throw new Error('Store ID is not defined.')

      const response = await fetch(`/api/stores/${storeId}/cart`)
      if (response.ok) {
        const data = await response.json()
        this.updateCartDisplay(data.cart)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error refreshing cart')
      }
    } catch (error) {
      console.error('Error refreshing cart from API:', error)
    } finally {
      this.setLoadingState(false)
    }
  }
}

window.openCart = function () {
  document.dispatchEvent(new CustomEvent('cart:open'))
}

window.closeCart = function () {
  document.dispatchEvent(new CustomEvent('cart:close'))
}

window.addToCart = async function (productId, quantity = 1) {
  try {
    const storeId = window.STORE_ID
    if (!storeId) throw new Error('Store ID is not defined.')

    const response = await fetch(`/api/stores/${storeId}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        productId: productId,
        quantity: quantity,
      }),
    })

    if (response.ok) {
      const data = await response.json()

      document.dispatchEvent(new CustomEvent('cart:open'))
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: data.cart } }))

      return data.cart
    } else {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Error adding to cart')
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    alert(`Error al añadir al carrito: ${error.message || 'Hubo un problema'}`)
    throw error
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SideCart())
} else {
  new SideCart()
}
