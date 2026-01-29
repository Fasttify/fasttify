'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para detectar dispositivos móviles y manejar el cierre automático del chat
 * @param onMobileDetected - Callback que se ejecuta cuando se detecta móvil
 * @param autoClose - Si debe cerrar automáticamente en móvil (default: true)
 */
export function useMobileDetection(onMobileDetected?: () => void, autoClose: boolean = true) {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  const checkIsMobile = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = checkIsMobile();
      requestAnimationFrame(() => {
        setIsMobile(mobile);
      });

      // Si cambió de desktop a móvil, ejecutar callback
      if (mobile && !isMobile && autoClose && onMobileDetected) {
        onMobileDetected();
      }
    };

    const raf1 = requestAnimationFrame(() => {
      const mobile = checkIsMobile();
      setIsMobile(mobile);
      if (mobile && autoClose && onMobileDetected) {
        onMobileDetected();
      }
    });

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(raf1);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkIsMobile, autoClose, onMobileDetected, isMobile]);

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
