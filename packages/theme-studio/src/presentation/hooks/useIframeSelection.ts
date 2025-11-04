/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useRef, RefObject } from 'react';
// @ts-ignore - Importing JS file directly
import { iframeSelectionScript } from '../utils/iframe-selection-script.js';

interface UseIframeSelectionParams {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  selectedElementName?: string | null;
  domain?: string | null;
  onElementClick?: (sectionId: string | null, blockId: string | null) => void;
}

/**
 * Hook para manejar la selección bidireccional entre el sidebar y el iframe
 *
 * Este hook:
 * 1. Inyecta el script de selección en el iframe cuando carga
 * 2. Escucha mensajes del iframe cuando se hace click en un elemento
 * 3. Envía mensajes al iframe cuando cambia la selección del sidebar
 */
export function useIframeSelection({
  iframeRef,
  selectedSectionId,
  selectedBlockId,
  selectedElementName,
  domain,
  onElementClick,
}: UseIframeSelectionParams) {
  const scriptInjectedRef = useRef(false);
  const lastSelectedSectionIdRef = useRef<string | null>(null);
  const lastSelectedBlockIdRef = useRef<string | null>(null);

  // Inyectar script en el iframe cuando carga
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const injectScript = () => {
      try {
        const iframeWindow = iframe.contentWindow;
        const iframeDocument = iframe.contentDocument || iframeWindow?.document;

        if (!iframeWindow || !iframeDocument) {
          return;
        }

        // Solo inyectar una vez
        if (scriptInjectedRef.current) {
          return;
        }

        // Verificar que el documento esté listo
        if (iframeDocument.readyState === 'loading') {
          iframeDocument.addEventListener('DOMContentLoaded', () => {
            injectScript();
          });
          return;
        }

        // Verificar si el script ya está inyectado
        if (iframeDocument.querySelector('script[data-fasttify-selection]')) {
          scriptInjectedRef.current = true;
          return;
        }

        // Crear y agregar el script
        const script = iframeDocument.createElement('script');
        script.setAttribute('data-fasttify-selection', 'true');
        script.textContent = iframeSelectionScript(domain || null);
        iframeDocument.head.appendChild(script);

        scriptInjectedRef.current = true;
      } catch (error) {
        // Puede fallar si el iframe está en otro origen (cross-origin)
        // Ignorar errores silenciosamente
      }
    };

    // Intentar inyectar cuando el iframe carga
    const handleLoad = () => {
      scriptInjectedRef.current = false; // Resetear para permitir re-inyección si el iframe se recarga
      injectScript();
    };

    iframe.addEventListener('load', handleLoad);

    // Si el iframe ya está cargado, intentar inyectar inmediatamente
    if (iframe.contentDocument?.readyState === 'complete') {
      injectScript();
    }

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [iframeRef, domain]);

  // Escuchar mensajes del iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validar origen
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isSameOrigin = event.origin === window.location.origin;

      if (!isSameOrigin && !isLocalhost) {
        return;
      }

      if (event.data && event.data.type === 'FASTTIFY_THEME_STUDIO_ELEMENT_CLICKED') {
        const { sectionId, blockId } = event.data;

        // Notificar al componente padre
        if (onElementClick) {
          onElementClick(sectionId || null, blockId || null);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onElementClick]);

  // Enviar mensaje al iframe cuando cambia la selección del sidebar
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Solo enviar si realmente cambió la selección
    if (selectedSectionId === lastSelectedSectionIdRef.current && selectedBlockId === lastSelectedBlockIdRef.current) {
      return;
    }

    lastSelectedSectionIdRef.current = selectedSectionId;
    lastSelectedBlockIdRef.current = selectedBlockId;

    try {
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) return;

      const timestamp = Date.now();
      const message = {
        type: 'FASTTIFY_THEME_STUDIO_SELECT_ELEMENT',
        sectionId: selectedSectionId,
        blockId: selectedBlockId,
        elementName: selectedElementName || null,
        timestamp,
      };

      // Enviar inmediatamente
      try {
        iframeWindow.postMessage(message, '*');
      } catch (e) {
        // Ignorar errores silenciosamente
      }

      // Guardar referencia a los timeouts para poder cancelarlos
      const timeout1 = setTimeout(function () {
        try {
          iframeWindow.postMessage(message, '*');
        } catch (e) {
          // Ignorar errores silenciosamente
        }
      }, 50);

      const timeout2 = setTimeout(function () {
        try {
          iframeWindow.postMessage(message, '*');
        } catch (e) {
          // Ignorar errores silenciosamente
        }
      }, 200);

      // Cleanup: cancelar timeouts si el efecto se ejecuta de nuevo antes de que completen
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    } catch (error) {
      console.debug('Cannot send message to iframe (cross-origin):', error);
    }
  }, [iframeRef, selectedSectionId, selectedBlockId, selectedElementName]);

  // Limpiar selección cuando se desmonta el componente
  useEffect(() => {
    return () => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      try {
        const iframeWindow = iframe.contentWindow;
        if (!iframeWindow) return;

        iframeWindow.postMessage(
          {
            type: 'FASTTIFY_THEME_STUDIO_CLEAR_SELECTION',
          },
          '*'
        );
      } catch (error) {
        // Ignorar errores en cleanup
      }
    };
  }, [iframeRef]);
}
