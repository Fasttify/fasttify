'use client';

import { useEffect } from 'react';

/**
 * HMR básico para temas en desarrollo mediante SSE.
 */
export default function DevAutoReloadScript() {
  useEffect(() => {
    const isDev = process.env.NEXT_PUBLIC_APP_ENV === 'development';
    if (!isDev) {
      return;
    }

    let eventSource: EventSource;

    /**
     * Agrega o reemplaza query param de busting.
     */
    function withBust(url: string, value: string) {
      try {
        const u = new URL(url, window.location.origin);
        u.searchParams.set('v', value);
        return u.pathname + u.search;
      } catch {
        const sep = url.includes('?') ? '&' : '?';
        return `${url}${sep}v=${encodeURIComponent(value)}`;
      }
    }

    /**
     * Reemplaza hojas de estilo enlazadas por versiones busteadas.
     */
    function hotSwapCSS(path?: string) {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
      const ts = Date.now().toString();

      links.forEach((oldLink) => {
        if (!oldLink.href) return;

        let parsedUrl: URL;
        try {
          parsedUrl = new URL(oldLink.href, window.location.origin);
        } catch {
          // Si la URL no es válida, no intentar hacer hot-swap.
          return;
        }

        const hostname = parsedUrl.hostname;
        const pathname = parsedUrl.pathname;

        // Ignorar CSS externos (Google Fonts, CDNs, etc.)
        if (
          hostname === 'fonts.googleapis.com' ||
          hostname === 'fonts.gstatic.com' ||
          !pathname.includes('/stores/')
        ) {
          return;
        }

        // Si se especifica un path, solo actualizar CSS que coincida
        if (path && !oldLink.href.includes(path)) {
          return;
        }

        const newLink = oldLink.cloneNode(true) as HTMLLinkElement;
        newLink.href = withBust(oldLink.href, ts);
        newLink.onload = () => {
          requestAnimationFrame(() => oldLink.remove());
        };
        oldLink.parentNode?.insertBefore(newLink, oldLink.nextSibling);
      });
    }

    /**
     * Fuerza recarga selectiva de imágenes visibles.
     */
    function refreshAssets(path?: string) {
      const ts = Date.now().toString();
      const images = Array.from(document.images) as HTMLImageElement[];
      images.forEach((img) => {
        if (!img.src) return;
        if (!path || img.src.includes(path)) {
          img.src = withBust(img.src, ts);
        }
      });
    }

    let debounceTimer: NodeJS.Timeout;

    /**
     * Maneja eventos SSE por tipo/kind con debounce.
     */
    function handleMessage(data: any) {
      // Debounce para evitar múltiples recargas rápidas
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        processMessage(data);
      }, 300);
    }

    function processMessage(data: any) {
      if (data.type === 'connected') {
        console.log('[Template Dev] Conexión SSE establecida');
        return;
      }

      if (data.type === 'ping') {
        // Responder al ping para mantener conexión activa
        return;
      }

      if (data.type === 'change') {
        if (data.kind === 'css') {
          hotSwapCSS(data.path);
          return;
        }

        if (data.kind === 'asset') {
          refreshAssets(data.path);
          return;
        }

        if (data.kind === 'settings') {
          window.location.reload();
          return;
        }

        // template u otros -> recarga total
        window.location.reload();
        return;
      }

      if (data.type === 'reload') {
        window.location.reload();
        return;
      }

      console.warn('[Template Dev] Unknown message type:', data.type);
    }

    function connectSSE() {
      eventSource = new EventSource('/api/stores/template-dev/ws');
      eventSource.onopen = function () {};
      eventSource.onmessage = function (event) {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('[Template Dev] Error al procesar mensaje SSE:', error);
        }
      };
      eventSource.onerror = function () {
        eventSource.close();
        setTimeout(connectSSE, 3000);
      };
    }

    connectSSE();

    // Limpiar la conexión al desmontar el componente
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, []);

  return null;
}
