'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para detectar dispositivos móviles y manejar el cierre automático del chat
 * @param onMobileDetected - Callback que se ejecuta cuando se detecta móvil
 * @param autoClose - Si debe cerrar automáticamente en móvil (default: true)
 */
export function useMobileDetection(onMobileDetected?: () => void, autoClose: boolean = true) {
  const [isMobile, setIsMobile] = useState(false);

  const checkIsMobile = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);

  useEffect(() => {
    // Verificar al cargar
    const mobile = checkIsMobile();
    setIsMobile(mobile);

    // Si es móvil y hay callback, ejecutarlo
    if (mobile && autoClose && onMobileDetected) {
      onMobileDetected();
    }

    const handleResize = () => {
      const mobile = checkIsMobile();
      const wasDesktop = !isMobile;
      setIsMobile(mobile);

      // Si cambió de desktop a móvil, ejecutar callback
      if (mobile && wasDesktop && autoClose && onMobileDetected) {
        onMobileDetected();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkIsMobile, isMobile, autoClose, onMobileDetected]);

  // Función para prevenir acciones en móvil
  const preventMobileAction = useCallback(
    (action: () => void) => {
      if (!isMobile) {
        action();
      }
    },
    [isMobile]
  );

  // Función para renderizar condicionalmente
  const renderOnDesktopOnly = useCallback(
    (component: React.ReactNode) => {
      return isMobile ? null : component;
    },
    [isMobile]
  );

  return {
    isMobile,
    isDesktop: !isMobile,
    preventMobileAction,
    renderOnDesktopOnly,
    checkIsMobile,
  };
}

/**
 * Hook específico para el chat AI que maneja el estado de apertura
 */
export function useChatMobileDetection(setIsOpen: (open: boolean) => void) {
  const handleMobileDetected = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const mobileDetection = useMobileDetection(handleMobileDetected, true);

  const setIsOpenSafe = useCallback(
    (open: boolean) => {
      mobileDetection.preventMobileAction(() => {
        setIsOpen(open);
      });
    },
    [setIsOpen, mobileDetection]
  );

  return {
    ...mobileDetection,
    setIsOpenSafe,
  };
}
