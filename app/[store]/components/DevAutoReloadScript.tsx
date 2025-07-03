'use client';

import { useEffect } from 'react';

/**
 * Componente cliente para manejar el auto-reload solo en desarrollo.
 * Esto evita hydration mismatch al ejecutarse solo en el cliente.
 * Se conecta a un endpoint SSE para recibir notificaciones de cambios en la plantilla.
 */
export default function DevAutoReloadScript() {
  useEffect(() => {
    // Verificar si estamos en un entorno de desarrollo en el cliente
    const isDev = process.env.NEXT_PUBLIC_APP_ENV === 'development';
    if (!isDev) {
      return;
    }

    let eventSource: EventSource;

    function connectSSE() {
      // Usar una ruta relativa para la conexión SSE
      eventSource = new EventSource('/api/stores/template-dev/ws');

      eventSource.onopen = function () {
        console.log('[Template Dev] Conectado al servidor de desarrollo');
      };

      eventSource.onmessage = function (event) {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'reload') {
            console.log('[Template Dev] Cambios detectados, recargando página...');
            window.location.reload();
          }

          if (data.type === 'connected') {
            console.log('[Template Dev] Conexión SSE establecida');
          }
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

    // Iniciar la conexión
    connectSSE();

    // Limpiar la conexión al desmontar el componente
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return null; // El componente no renderiza nada visible
}
