'use client';

import { type ReactNode, useRef, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: ReactNode;
  enabled?: boolean; // Permite desactivar la animación completamente
  duration?: number; // Duración en ms
}

export function PageTransition({ children, enabled = true, duration = 300 }: PageTransitionProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);

  // Memoizar la configuración de la animación para evitar recreaciones
  const animationConfig = useMemo(
    () => ({
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
      options: {
        duration,
        easing: 'ease-out',
        fill: 'forwards' as FillMode,
      },
    }),
    [duration]
  );

  // Función optimizada para crear animaciones
  const createAnimation = useCallback(() => {
    if (!containerRef.current || !enabled) return;

    const container = containerRef.current;

    // Cancelar animación anterior de forma más eficiente
    if (animationRef.current) {
      animationRef.current.cancel();
    }

    // Crear nueva animación y guardar referencia
    animationRef.current = container.animate(animationConfig.keyframes, animationConfig.options);

    // Limpiar referencia cuando termine
    animationRef.current.addEventListener('finish', () => {
      animationRef.current = null;
    });
  }, [enabled, animationConfig]);

  useEffect(() => {
    // Usar requestAnimationFrame para mejor sincronización con el navegador
    const rafId = requestAnimationFrame(() => {
      createAnimation();
    });

    return () => {
      cancelAnimationFrame(rafId);
      // Limpiar animación al desmontar
      if (animationRef.current) {
        animationRef.current.cancel();
        animationRef.current = null;
      }
    };
  }, [pathname, createAnimation]);

  // Si la animación está desactivada, simplemente renderizamos los hijos
  if (!enabled) return <>{children}</>;

  return <div ref={containerRef}>{children}</div>;
}
