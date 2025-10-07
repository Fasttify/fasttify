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
    function hotSwapCSS() {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
      const ts = Date.now().toString();
      links.forEach((oldLink) => {
        if (!oldLink.href) return;
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

    /**
     * Maneja eventos SSE por tipo/kind.
     */
    function handleMessage(data: any) {
      if (data.type === 'connected') {
        console.log('[Template Dev] Conexión SSE establecida');
        return;
      }
      if (data.type === 'change') {
        if (data.kind === 'css') {
          hotSwapCSS();
          return;
        }
        if (data.kind === 'asset') {
          refreshAssets(data.path);
          return;
        }
        if (data.kind === 'settings') {
          // Soft-refresh: por ahora, recarga completa para simplificar
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
    }

    function connectSSE() {
      eventSource = new EventSource('/api/stores/template-dev/ws');
      eventSource.onopen = function () {
        console.log('[Template Dev] Conectado al servidor de desarrollo');
      };
      eventSource.onmessage = function (event) {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('[Template Dev] Error al procesar mensaje SSE:', error);
        }
      };
      eventSource.onerror = function () {
        console.log('[Template Dev] Error en la conexión, reconectando en 3s...');
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
    };
  }, []);

  return null;
}
