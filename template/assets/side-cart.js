/**
 * Side Cart Functionality
 */

class SideCart {
  constructor() {
    this.overlay = document.querySelector('[data-cart-overlay]')
    this.sidebar = document.querySelector('[data-cart-sidebar]')
    this.closeBtn = document.querySelector('[data-cart-close]')
    // El formulario será actualizado dinámicamente, por ahora solo el contenedor
    this.cartContentContainer = this.sidebar?.querySelector('.cart-content')
    this.cartTotalElements = document.querySelectorAll('[data-cart-total]')
    this.cartCountElements = document.querySelectorAll('[data-cart-count]')

    this.isOpen = false
    this.isUpdating = false

    this.init()
  }

  init() {
    if (!this.overlay || !this.sidebar || !this.cartContentContainer) return

    // Event listeners
    this.closeBtn?.addEventListener('click', () => this.close())
    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close()
    })

    // Cerrar con ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) this.close()
    })

    // Escuchar eventos de carrito (abrir/cerrar/actualizar)
    document.addEventListener('cart:open', () => this.open())
    document.addEventListener('cart:close', () => this.close())
    document.addEventListener('cart:updated', e => this.updateCartDisplay(e.detail))

    // Event listener global para botones data-open-cart
    document.addEventListener('click', e => {
      if (e.target.closest('[data-open-cart]')) {
        e.preventDefault()
        this.open()
      }
    })

    // Inicializar el carrito al cargar la página
    this.refresh()
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

  // --- Funciones para interactuar con la API del carrito ---

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
        const cart = await response.json()
        this.updateCartDisplay(cart)
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error updating cart item')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      alert(`Error al actualizar cantidad: ${error.message || 'Hubo un problema'}`)
      this.refresh() // Recargar para mostrar el estado real
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
        const cart = await response.json()
        this.updateCartDisplay(cart)
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error removing cart item')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      alert(`Error al eliminar producto: ${error.message || 'Hubo un problema'}`)
      this.refresh() // Recargar para mostrar el estado real
    } finally {
      this.isUpdating = false
      this.setLoadingState(false)
    }
  }

  // --- UI Helpers ---

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

  // Helper para formatear precios como moneda (replicando el filtro 'money' de Liquid)
  formatMoney(amount) {
    // Asume que el precio viene en centavos y que la moneda es USD con 2 decimales.
    // Si necesitas un formato más robusto (e.g., de `shop.money_format`), expórtalo globalmente.
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

    // Actualizar contador en header y en otros elementos
    this.cartCountElements.forEach(el => {
      el.textContent = cart.item_count
    })
    this.cartTotalElements.forEach(el => {
      el.textContent = this.formatMoney(cart.total_price)
    })

    if (cart.item_count === 0) {
      this.cartContentContainer.innerHTML = `
        <div class="cart-empty-state">
          <p>Tu carrito está vacío.</p>
          <a href="/collections/all" class="button button--primary">Explorar productos</a>
        </div>
      `
      // Ocultar footer si el carrito está vacío
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

      // Re-setup event listeners para el nuevo contenido
      this.setupQuantityControls()
      this.setupRemoveButtons()
    }
  }

  async refresh() {
    this.setLoadingState(true)
    try {
      const storeId = window.STORE_ID
      if (!storeId) throw new Error('Store ID is not defined.')

      const response = await fetch(`/api/stores/${storeId}/cart`)
      if (response.ok) {
        const cart = await response.json()
        this.updateCartDisplay(cart)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error refreshing cart')
      }
    } catch (error) {
      console.error('Error refreshing cart from API:', error)
      // Opcional: mostrar un mensaje de error al usuario
    } finally {
      this.setLoadingState(false)
    }
  }
}

// Funciones globales para abrir y cerrar el carrito
window.openCart = function () {
  document.dispatchEvent(new CustomEvent('cart:open'))
}

window.closeCart = function () {
  document.dispatchEvent(new CustomEvent('cart:close'))
}

// Agregar producto al carrito (para usar desde botones de producto)
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
      const cart = await response.json()

      // Abrir el carrito después de agregar
      document.dispatchEvent(new CustomEvent('cart:open'))
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }))

      return cart
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

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SideCart())
} else {
  new SideCart()
}
