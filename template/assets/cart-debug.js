/**
 * Script de diagnóstico para el carrito
 * Ayuda a identificar problemas en producción
 */

class CartDebugger {
  constructor() {
    this.isEnabled = localStorage.getItem('cart-debug') === 'true';
    this.init();
  }

  init() {
    if (!this.isEnabled) return;

    console.log('[CartDebugger] Debug mode enabled');

    // Interceptar todas las llamadas fetch al carrito
    this.interceptFetch();

    // Monitorear cookies
    this.monitorCookies();

    // Monitorear eventos del carrito
    this.monitorEvents();

    // Agregar botón de debug al DOM
    this.addDebugButton();
  }

  interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;

      // Solo interceptar llamadas al carrito
      if (typeof url === 'string' && url.includes('/cart')) {
        console.log('[CartDebugger] Fetch request:', {
          url,
          method: options?.method || 'GET',
          body: options?.body,
          headers: options?.headers
        });

        try {
          const response = await originalFetch(...args);
          const clone = response.clone();

          clone.json().then(data => {
            console.log('[CartDebugger] Fetch response:', {
              url,
              status: response.status,
              data
            });
          }).catch(() => {
            console.log('[CartDebugger] Fetch response (non-JSON):', {
              url,
              status: response.status
            });
          });

          return response;
        } catch (error) {
          console.error('[CartDebugger] Fetch error:', {
            url,
            error: error.message
          });
          throw error;
        }
      }

      return originalFetch(...args);
    };
  }

  monitorCookies() {
    // Verificar cookies cada 5 segundos
    setInterval(() => {
      const cartCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('fasttify_cart_session_id='));

      if (cartCookie) {
        const sessionId = cartCookie.split('=')[1];
        console.log('[CartDebugger] Cart session ID:', sessionId);
      } else {
        console.warn('[CartDebugger] No cart session ID found in cookies');
      }
    }, 5000);
  }

  monitorEvents() {
    const events = ['cart:open', 'cart:close', 'cart:updated'];

    events.forEach(eventName => {
      document.addEventListener(eventName, (e) => {
        console.log(`[CartDebugger] Event: ${eventName}`, e.detail);
      });
    });
  }

  addDebugButton() {
    const button = document.createElement('button');
    button.textContent = '🐛 Cart Debug';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      cursor: pointer;
    `;

    button.addEventListener('click', () => {
      this.showDebugInfo();
    });

    document.body.appendChild(button);
  }

           showDebugInfo() {
           const info = {
             storeId: window.STORE_ID,
             cartCookie: document.cookie
               .split('; ')
               .find(row => row.startsWith('fasttify_cart_session_id='))?.split('=')[1] || 'NOT_FOUND',
             sideCartExists: !!window.sideCart,
             cartElements: {
               overlay: !!document.querySelector('[data-cart-overlay]'),
               sidebar: !!document.querySelector('[data-cart-sidebar]'),
               content: !!document.querySelector('.cart-content')
             },
             cacheStatus: 'DISABLED - Fresh data always'
           };

    console.log('[CartDebugger] Debug Info:', info);

               // Mostrar en alert para fácil copia
           alert(`Cart Debug Info:
       Store ID: ${info.storeId}
       Session ID: ${info.cartCookie}
       SideCart: ${info.sideCartExists}
       Cache: ${info.cacheStatus}
       Elements: ${JSON.stringify(info.cartElements, null, 2)}`);
  }

  static enable() {
    localStorage.setItem('cart-debug', 'true');
    location.reload();
  }

  static disable() {
    localStorage.removeItem('cart-debug');
    location.reload();
  }
}

         // Habilitar debug desde consola
         window.enableCartDebug = () => CartDebugger.enable();
         window.disableCartDebug = () => CartDebugger.disable();
         window.runCartTests = () => {
           if (typeof window.runCartTests === 'function') {
             window.runCartTests();
           } else {
             console.log('[CartDebugger] Cart tests not available. Load cart-test.js first.');
           }
         };

// Inicializar debugger si está habilitado
if (localStorage.getItem('cart-debug') === 'true') {
  new CartDebugger();
}