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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useState, RefObject, useRef } from 'react';

interface UseIframeNavigationParams {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  domain: string | null;
  currentPath: string;
  onPathChange?: (newPath: string) => void;
}

interface UseIframeNavigationResult {
  isNavigating: boolean;
}

/**
 * Hook para interceptar la navegación dentro del iframe y mantener la estructura de preview
 * Solo funciona en desarrollo (localhost) donde el iframe está en el mismo origen
 */
export function useIframeNavigation({
  iframeRef,
  domain,
  currentPath,
  onPathChange,
}: UseIframeNavigationParams): UseIframeNavigationResult {
  const [isNavigating, setIsNavigating] = useState(false);
  const isMountedRef = useRef(true);
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !domain || !onPathChange) return;

    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

    // Solo interceptar en desarrollo (mismo origen)
    if (!isLocalhost) return;

    let originalPushState: typeof History.prototype.pushState | null = null;
    let originalReplaceState: typeof History.prototype.replaceState | null = null;

    const safeSetIsNavigating = (value: boolean) => {
      if (isMountedRef.current) {
        setIsNavigating(value);
      }
    };

    const safeOnPathChange = (newPath: string) => {
      if (isMountedRef.current && onPathChange) {
        onPathChange(newPath);
      }
    };

    const setupInterception = () => {
      safeSetIsNavigating(false);

      try {
        const iframeWindow = iframe.contentWindow;
        const iframeDocument = iframe.contentDocument || iframeWindow?.document;

        if (!iframeWindow || !iframeDocument) return;

        // Verificar que el documento esté activo antes de continuar
        if (iframeDocument.readyState !== 'complete' && iframeDocument.readyState !== 'interactive') {
          return;
        }

        // Interceptar clics en enlaces
        const handleClick = (e: MouseEvent) => {
          if (!isMountedRef.current) return;

          const target = e.target as HTMLElement;
          const link = target.closest('a');

          if (!link) return;

          const href = link.getAttribute('href');
          if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) {
            return; // Enlaces externos o anchors, dejar que funcionen normalmente
          }

          // Prevenir navegación directa
          e.preventDefault();
          e.stopPropagation();

          // Extraer el path y actualizar el padre
          const newPath = href.startsWith('/') ? href : `/${href}`;
          if (newPath !== currentPath) {
            safeSetIsNavigating(true);
            safeOnPathChange(newPath);
          }
        };

        try {
          originalPushState = iframeWindow.history.pushState.bind(iframeWindow.history);
          originalReplaceState = iframeWindow.history.replaceState.bind(iframeWindow.history);

          iframeWindow.history.pushState = function (...args) {
            try {
              if (originalPushState && iframeDocument.readyState === 'complete') {
                originalPushState(...args);
              }
              const newPath = args[2] as string;
              if (newPath && newPath !== currentPath && isMountedRef.current) {
                safeSetIsNavigating(true);
                safeOnPathChange(newPath);
              }
            } catch (error) {
              console.debug('Cannot use pushState (document not active):', error);
            }
          };

          iframeWindow.history.replaceState = function (...args) {
            try {
              if (originalReplaceState && iframeDocument.readyState === 'complete') {
                originalReplaceState(...args);
              }
              const newPath = args[2] as string;
              if (newPath && newPath !== currentPath && isMountedRef.current) {
                safeSetIsNavigating(true);
                safeOnPathChange(newPath);
              }
            } catch (error) {
              console.debug('Cannot use replaceState (document not active):', error);
            }
          };
        } catch (error) {
          // No se puede acceder a history APIs, ignorar
          console.debug('Cannot intercept history APIs:', error);
        }

        iframeDocument.addEventListener('click', handleClick, true);

        const cleanup = () => {
          try {
            iframeDocument.removeEventListener('click', handleClick, true);
            if (originalPushState && iframeWindow && iframeDocument.readyState === 'complete') {
              iframeWindow.history.pushState = originalPushState;
            }
            if (originalReplaceState && iframeWindow && iframeDocument.readyState === 'complete') {
              iframeWindow.history.replaceState = originalReplaceState;
            }
          } catch (error) {
            console.debug('Error during cleanup (document not active):', error);
          }
        };

        cleanupFunctionsRef.current.push(cleanup);
      } catch (error) {
        console.debug('Cannot access iframe content (cross-origin):', error);
      }
    };

    const handleLoad = () => {
      cleanupFunctionsRef.current.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {}
      });
      cleanupFunctionsRef.current = [];

      if (isMountedRef.current) {
        setupInterception();
      }
    };

    iframe.addEventListener('load', handleLoad);

    if (iframe.contentDocument?.readyState === 'complete') {
      handleLoad();
    }

    return () => {
      iframe.removeEventListener('load', handleLoad);
      cleanupFunctionsRef.current.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {}
      });
      cleanupFunctionsRef.current = [];
    };
  }, [iframeRef, domain, currentPath, onPathChange]);

  return { isNavigating };
}
