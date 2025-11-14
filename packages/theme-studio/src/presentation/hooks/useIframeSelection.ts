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
  selectedSubBlockId?: string | null;
  selectedElementName?: string | null;
  domain?: string | null;
  onElementClick?: (sectionId: string | null, blockId: string | null, subBlockId?: string | null) => void;
  inspectorEnabled?: boolean;
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
  selectedSubBlockId,
  selectedElementName,
  domain,
  onElementClick,
  inspectorEnabled = true,
}: UseIframeSelectionParams) {
  const scriptInjectedRef = useRef(false);
  const lastSelectedSectionIdRef = useRef<string | null>(null);
  const lastSelectedBlockIdRef = useRef<string | null>(null);
  const lastSelectedSubBlockIdRef = useRef<string | null>(null);

  // Inyectar script en el iframe cuando carga
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const injectScript = () => {
      try {
        console.log('[ThemeStudio] Intentando inyectar script en iframe');
        const iframeWindow = iframe.contentWindow;
        const iframeDocument = iframe.contentDocument || iframeWindow?.document;

        if (!iframeWindow || !iframeDocument) {
          console.log('[ThemeStudio] No se puede acceder a iframeWindow o iframeDocument');
          return;
        }

        // Solo inyectar una vez
        if (scriptInjectedRef.current) {
          console.log('[ThemeStudio] Script ya marcado como inyectado (ref)');
          return;
        }

        // Verificar que el documento esté listo
        if (iframeDocument.readyState === 'loading') {
          console.log('[ThemeStudio] Documento aún cargando, esperando DOMContentLoaded');
          iframeDocument.addEventListener('DOMContentLoaded', () => {
            injectScript();
          });
          return;
        }

        // Verificar si el script ya está inyectado
        const existingScript = iframeDocument.querySelector('script[data-fasttify-selection]');
        if (existingScript) {
          console.log('[ThemeStudio] Script ya existe en el DOM');
          scriptInjectedRef.current = true;
          return;
        }

        console.log('[ThemeStudio] Creando y agregando script al iframe', {
          domain,
          readyState: iframeDocument.readyState,
          url: iframe.src,
        });

        // Crear y agregar el script
        const script = iframeDocument.createElement('script');
        script.setAttribute('data-fasttify-selection', 'true');
        const scriptContent = iframeSelectionScript(domain || null);
        console.log('[ThemeStudio] Script generado, longitud:', scriptContent.length);
        script.textContent = scriptContent;
        iframeDocument.head.appendChild(script);

        console.log('[ThemeStudio] Script inyectado exitosamente');
        scriptInjectedRef.current = true;
      } catch (error) {
        // Puede fallar si el iframe está en otro origen (cross-origin)
        console.error('[ThemeStudio] Error al inyectar script:', error);
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
    if (!inspectorEnabled) return;

    const handleMessage = (event: MessageEvent) => {
      console.log('[ThemeStudio] Mensaje recibido del iframe:', {
        type: event.data?.type,
        origin: event.origin,
        data: event.data,
      });

      // Solo procesar mensajes de nuestra aplicación
      // Validamos el tipo del mensaje en lugar del origen para funcionar en producción
      // cuando el iframe está en un dominio diferente al parent window
      if (
        !event.data ||
        typeof event.data.type !== 'string' ||
        event.data.type !== 'FASTTIFY_THEME_STUDIO_ELEMENT_CLICKED'
      ) {
        console.log('[ThemeStudio] Mensaje ignorado - no es del tipo esperado');
        return;
      }

      const { sectionId, blockId, subBlockId } = event.data;
      console.log('[ThemeStudio] Procesando click en elemento:', { sectionId, blockId, subBlockId });

      // Notificar al componente padre con todos los IDs disponibles
      if (onElementClick) {
        onElementClick(sectionId || null, blockId || null, subBlockId || null);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [inspectorEnabled, onElementClick]);

  // Enviar mensaje al iframe cuando cambia el estado del inspector
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) return;

      const message = {
        type: 'FASTTIFY_THEME_STUDIO_TOGGLE_INSPECTOR',
        enabled: inspectorEnabled,
      };

      console.log('[ThemeStudio] Enviando mensaje TOGGLE_INSPECTOR al iframe:', message);
      iframeWindow.postMessage(message, '*');
    } catch (error) {
      console.debug('Cannot send message to iframe (cross-origin):', error);
    }
  }, [iframeRef, inspectorEnabled]);

  // Enviar mensaje al iframe cuando cambia la selección del sidebar
  useEffect(() => {
    if (!inspectorEnabled) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    // Solo enviar si realmente cambió la selección
    if (
      selectedSectionId === lastSelectedSectionIdRef.current &&
      selectedBlockId === lastSelectedBlockIdRef.current &&
      selectedSubBlockId === lastSelectedSubBlockIdRef.current
    ) {
      return;
    }

    lastSelectedSectionIdRef.current = selectedSectionId;
    lastSelectedBlockIdRef.current = selectedBlockId;
    lastSelectedSubBlockIdRef.current = selectedSubBlockId || null;

    try {
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) return;

      const timestamp = Date.now();
      const message = {
        type: 'FASTTIFY_THEME_STUDIO_SELECT_ELEMENT',
        sectionId: selectedSectionId,
        blockId: selectedBlockId,
        subBlockId: selectedSubBlockId || null,
        elementName: selectedElementName || null,
        timestamp,
      };

      console.log('[ThemeStudio] Enviando mensaje SELECT_ELEMENT al iframe:', message);

      // Enviar inmediatamente
      try {
        iframeWindow.postMessage(message, '*');
        console.log('[ThemeStudio] Mensaje SELECT_ELEMENT enviado exitosamente');
      } catch (e) {
        console.error('[ThemeStudio] Error al enviar mensaje SELECT_ELEMENT:', e);
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
  }, [iframeRef, inspectorEnabled, selectedSectionId, selectedBlockId, selectedSubBlockId, selectedElementName]);

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
