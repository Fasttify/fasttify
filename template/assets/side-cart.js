/**
 * Side Cart Functionality
 */

class SideCart {
  constructor() {
    this.overlay = document.querySelector('[data-cart-overlay]')
    this.sidebar = document.querySelector('[data-cart-sidebar]')
    this.closeBtn = document.querySelector('[data-cart-close]')
    this.form = this.sidebar?.querySelector('form')

    this.isOpen = false
    this.isUpdating = false

    this.init()
  }

  init() {
    if (!this.overlay || !this.sidebar) return

    // Event listeners
    this.closeBtn?.addEventListener('click', () => this.close())
    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close()
    })

    // Cerrar con ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) this.close()
    })

    // Quantity controls
    this.setupQuantityControls()

    // Remove buttons
    this.setupRemoveButtons()

    // Form submission
    this.setupFormSubmission()

    // Escuchar eventos de carrito
    document.addEventListener('cart:open', () => this.open())
    document.addEventListener('cart:close', () => this.close())
    document.addEventListener('cart:updated', () => this.refresh())
  }

  open() {
    if (this.isOpen) return

    this.isOpen = true
    document.body.style.overflow = 'hidden'
    this.overlay.classList.add('is-open')

    // Focus en el primer elemento focusable
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
    this.overlay.classList.remove('is-open')
  }

  setupQuantityControls() {
    // Botones + y -
    this.sidebar.addEventListener('click', e => {
      const plusBtn = e.target.closest('[data-quantity-plus]')
      const minusBtn = e.target.closest('[data-quantity-minus]')

      if (plusBtn) {
        e.preventDefault()
        const input = this.getQuantityInput(plusBtn.dataset.itemKey)
        if (input) {
          const newValue = parseInt(input.value) + 1
          input.value = newValue
          this.updateQuantity(plusBtn.dataset.itemKey, newValue)
        }
      }

      if (minusBtn) {
        e.preventDefault()
        const input = this.getQuantityInput(minusBtn.dataset.itemKey)
        if (input) {
          const newValue = Math.max(0, parseInt(input.value) - 1)
          input.value = newValue
          this.updateQuantity(minusBtn.dataset.itemKey, newValue)
        }
      }
    })

    // Input directo
    this.sidebar.addEventListener('change', e => {
      const input = e.target.closest('.quantity-input')
      if (input) {
        const newValue = Math.max(0, parseInt(input.value) || 0)
        input.value = newValue
        this.updateQuantity(input.dataset.itemKey, newValue)
      }
    })
  }

  setupRemoveButtons() {
    this.sidebar.addEventListener('click', e => {
      const removeBtn = e.target.closest('[data-remove-item]')
      if (removeBtn) {
        e.preventDefault()
        this.removeItem(removeBtn.dataset.itemKey)
      }
    })
  }

  setupFormSubmission() {
    this.form?.addEventListener('submit', e => {
      // Solo prevenir si es actualización, permitir checkout
      if (e.submitter?.name === 'update') {
        e.preventDefault()
        this.updateCart()
      }
    })
  }

  getQuantityInput(itemKey) {
    return this.sidebar.querySelector(`input[data-item-key="${itemKey}"]`)
  }

  async updateQuantity(itemKey, quantity) {
    if (this.isUpdating) return

    try {
      this.isUpdating = true
      this.setLoadingState(true)

      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          id: itemKey,
          quantity: quantity,
        }),
      })

      if (response.ok) {
        const cart = await response.json()
        this.updateCartDisplay(cart)

        // Emitir evento para actualizar contador en header
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }))
      } else {
        throw new Error('Error updating cart')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      // Revertir el valor en caso de error
      const input = this.getQuantityInput(itemKey)
      if (input) {
        // Buscar el valor original en el DOM o recargar
        this.refresh()
      }
    } finally {
      this.isUpdating = false
      this.setLoadingState(false)
    }
  }

  async removeItem(itemKey) {
    return this.updateQuantity(itemKey, 0)
  }

  async updateCart() {
    if (this.isUpdating) return

    try {
      this.isUpdating = true
      this.setLoadingState(true)

      const formData = new FormData(this.form)

      const response = await fetch('/cart/update.js', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const cart = await response.json()
        this.updateCartDisplay(cart)
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }))
      }
    } catch (error) {
      console.error('Error updating cart:', error)
    } finally {
      this.isUpdating = false
      this.setLoadingState(false)
    }
  }

  setLoadingState(loading) {
    const updateBtn = this.sidebar.querySelector('.cart-update-btn')
    const checkoutBtn = this.sidebar.querySelector('.cart-checkout-btn')

    if (loading) {
      updateBtn?.setAttribute('disabled', '')
      checkoutBtn?.setAttribute('disabled', '')
      this.sidebar.style.pointerEvents = 'none'
    } else {
      updateBtn?.removeAttribute('disabled')
      checkoutBtn?.removeAttribute('disabled')
      this.sidebar.style.pointerEvents = ''
    }
  }

  updateCartDisplay(cart) {
    // Recargar el contenido del carrito
    fetch(window.location.href)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const newCartContent = doc.querySelector('[data-cart-sidebar] .cart-content')

        if (newCartContent && this.sidebar) {
          const currentCartContent = this.sidebar.querySelector('.cart-content')
          if (currentCartContent) {
            currentCartContent.innerHTML = newCartContent.innerHTML

            // Re-setup event listeners para el nuevo contenido
            this.setupQuantityControls()
            this.setupRemoveButtons()
            this.setupFormSubmission()
            this.form = this.sidebar.querySelector('form')
          }
        }
      })
      .catch(error => {
        console.error('Error refreshing cart display:', error)
      })
  }

  refresh() {
    // Recargar el carrito completo
    this.updateCartDisplay()
  }
}

// Funciones globales para abrir el carrito
window.openCart = function () {
  document.dispatchEvent(new CustomEvent('cart:open'))
}

window.closeCart = function () {
  document.dispatchEvent(new CustomEvent('cart:close'))
}

// Agregar producto al carrito (para usar desde botones de producto)
window.addToCart = async function (variantId, quantity = 1) {
  try {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity,
      }),
    })

    if (response.ok) {
      const item = await response.json()

      // Abrir el carrito después de agregar
      document.dispatchEvent(new CustomEvent('cart:open'))
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: item }))

      return item
    } else {
      throw new Error('Error adding to cart')
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    throw error
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SideCart())
} else {
  new SideCart()
}
