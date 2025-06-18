/**
 * Newsletter Popup
 */

// Función de inicialización que se ejecuta cuando todo está listo
function initNewsletterPopup() {
  // Buscar elementos del DOM
  const popup = document.querySelector('[data-popup]')
  const overlay = document.querySelector('[data-popup-overlay]')
  const closeBtn = document.querySelector('[data-popup-close]')
  const form = popup?.querySelector('.newsletter-popup__form')
  const messageEl = document.querySelector('[data-message]')
  const emailInput = popup?.querySelector('#newsletter-email')
  const submitBtn = form?.querySelector('.newsletter-popup__submit')

  if (!popup) {
    return
  }

  // Configuración
  const config = {
    delay: parseInt(popup.dataset?.delay || 3000),
    showAgainDelay: parseInt(popup.dataset?.showAgainDelay || 86400000),
    maxCloseCount: parseInt(popup.dataset?.maxCloseCount || 3),
    blockTime: parseInt(popup.dataset?.blockTime || 7) * 24 * 60 * 60 * 1000, // días a milisegundos
    cookieName: 'newsletter_popup_dismissed',
    cookieNameSubscribed: 'newsletter_subscribed',
    closeCountKey: 'newsletter_popup_close_count',
  }

  let isVisible = false

  // Función para mostrar el popup
  function showPopup() {
    if (!popup || isVisible) {
      return
    }

    isVisible = true
    document.body.style.overflow = 'hidden'
    popup.style.display = 'flex'

    // Forzar reflow antes de agregar la clase
    popup.offsetHeight
    popup.classList.add('is-visible')

    // Focus en el input después de la animación
    setTimeout(() => {
      emailInput?.focus()
    }, 400)
  }

  // Función para cerrar el popup
  function closePopup() {
    if (!popup) {
      return
    }

    isVisible = false
    document.body.style.overflow = ''
    popup.classList.remove('is-visible')

    // Esperar a que termine la animación antes de ocultar
    setTimeout(() => {
      popup.style.display = 'none'
    }, 300)

    // Incrementar contador de cierres
    incrementCloseCount()

    // Guardar timestamp del cierre
    localStorage.setItem(config.cookieName, Date.now().toString())
  }

  // Función para incrementar el contador de cierres
  function incrementCloseCount() {
    const currentCount = parseInt(localStorage.getItem(config.closeCountKey) || '0')
    const newCount = currentCount + 1
    localStorage.setItem(config.closeCountKey, newCount.toString())

    // Si alcanza el máximo, establecer un bloqueo
    if (newCount >= config.maxCloseCount) {
      const blockUntil = Date.now() + config.blockTime
      localStorage.setItem('newsletter_popup_blocked_until', blockUntil.toString())
    }
  }

  // Función para validar email
  function validateEmail() {
    if (!emailInput) return false

    const email = emailInput.value.trim()
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    emailInput.classList.toggle('invalid', !isValid && email.length > 0)
    return isValid
  }

  // Función para mostrar mensajes
  function showMessage(text, type) {
    if (!messageEl) return

    messageEl.textContent = text
    messageEl.className = `newsletter-popup__message ${type}`

    if (type === 'error') {
      setTimeout(() => {
        messageEl.className = 'newsletter-popup__message'
      }, 5000)
    }
  }

  // Eventos de cierre con debugging
  if (closeBtn) {
    closeBtn.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      closePopup()
    })
  } else {
    console.warn('Close button not found')
  }

  if (overlay) {
    overlay.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      closePopup()
    })
  } else {
    console.warn('Overlay not found')
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isVisible) {
      closePopup()
    }
  })

  // Manejo del formulario
  form?.addEventListener('submit', async e => {
    e.preventDefault()

    if (!validateEmail()) return

    const formData = new FormData(form)
    const originalText = submitBtn.textContent

    // Estado de carga
    submitBtn.textContent = 'Enviando...'
    submitBtn.disabled = true

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (response.ok) {
        showMessage('¡Gracias por suscribirte! Revisa tu correo para confirmar.', 'success')
        form.reset()

        // Marcar como suscrito y limpiar contadores
        localStorage.setItem(config.cookieNameSubscribed, 'true')
        localStorage.removeItem(config.closeCountKey)
        localStorage.removeItem('newsletter_popup_blocked_until')
        localStorage.removeItem(config.cookieName)

        setTimeout(() => closePopup(), 3000)
      } else {
        throw new Error('Error en la respuesta del servidor')
      }
    } catch (error) {
      console.error('Error en suscripción:', error)
      showMessage('Ha ocurrido un error. Por favor, intenta nuevamente.', 'error')
    } finally {
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    }
  })

  // Validación en tiempo real
  emailInput?.addEventListener('input', validateEmail)

  // Programar la aparición del popup
  function schedulePopup() {
    // Debug del localStorage
    const subscribed = localStorage.getItem(config.cookieNameSubscribed)
    const dismissed = localStorage.getItem(config.cookieName)
    const closeCount = parseInt(localStorage.getItem(config.closeCountKey) || '0')
    const blockedUntil = localStorage.getItem('newsletter_popup_blocked_until')

    // Verificar si ya está suscrito
    if (subscribed) {
      return
    }

    // Verificar si está bloqueado por demasiados cierres
    if (blockedUntil) {
      const blockTime = parseInt(blockedUntil)
      if (Date.now() < blockTime) {
        return
      } else {
        // El bloqueo ha expirado, limpiar
        localStorage.removeItem('newsletter_popup_blocked_until')
        localStorage.removeItem(config.closeCountKey)
      }
    }

    // Verificar tiempo desde último descarte
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const currentTime = Date.now()
      const timeDiff = currentTime - dismissedTime

      if (timeDiff < config.showAgainDelay) {
        return
      }
    }

    // Mostrar después del delay
    setTimeout(() => {
      showPopup()
    }, config.delay)
  }

  // Exponer funciones globalmente para debugging
  window.newsletterPopupDebug = {
    show: showPopup,
    hide: closePopup,
    reset: () => {
      localStorage.removeItem(config.cookieName)
      localStorage.removeItem(config.cookieNameSubscribed)
      localStorage.removeItem(config.closeCountKey)
      localStorage.removeItem('newsletter_popup_blocked_until')
    },
    forceShow: () => {
      // Resetear y mostrar inmediatamente
      localStorage.removeItem(config.cookieName)
      localStorage.removeItem(config.cookieNameSubscribed)
      localStorage.removeItem(config.closeCountKey)
      localStorage.removeItem('newsletter_popup_blocked_until')
      setTimeout(showPopup, 100)
    },
    testCloseButton: () => {
      if (closeBtn) {
        closeBtn.click()
      }
    },
    getStatus: () => {
      const status = {
        subscribed: !!localStorage.getItem(config.cookieNameSubscribed),
        closeCount: parseInt(localStorage.getItem(config.closeCountKey) || '0'),
        maxCloseCount: config.maxCloseCount,
        dismissed: localStorage.getItem(config.cookieName),
        blockedUntil: localStorage.getItem('newsletter_popup_blocked_until'),
        isBlocked: false,
      }

      if (status.blockedUntil) {
        const blockTime = parseInt(status.blockedUntil)
        status.isBlocked = Date.now() < blockTime
        status.blockedUntilDate = new Date(blockTime).toLocaleString()
      }

      return status
    },
    simulateCloses: count => {
      // Simular múltiples cierres para testing
      for (let i = 0; i < count; i++) {
        incrementCloseCount()
      }
    },
    elements: {
      popup,
      closeBtn,
      overlay,
      form,
    },
  }

  // Iniciar la programación
  schedulePopup()
}

// Múltiples formas de inicialización para asegurar que funcione
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewsletterPopup)
} else {
  // El DOM ya está listo
  initNewsletterPopup()
}

// También intentar después de que todo esté cargado
window.addEventListener('load', () => {
  if (!window.newsletterPopupDebug) {
    initNewsletterPopup()
  }
})

// Función para mostrar el popup manualmente (para testing)
window.showNewsletterPopup = function () {
  if (window.newsletterPopupDebug) {
    window.newsletterPopupDebug.forceShow()
  } else {
    console.error('Newsletter popup not initialized')
  }
}
