import { useRef, useEffect, useCallback } from 'react';
import { ScrollableRef } from '@shopify/polaris';

/**
 * Hook para manejar el auto-scroll de un componente `Scrollable` de Polaris.
 * @param dependency - Valor que, al cambiar, dispara el auto-scroll.
 * @returns - `scrollableRef` para el componente `Scrollable` y `contentRef` para el div de contenido.
 */
export function useAutoScroll(dependency: any) {
  const scrollableRef = useRef<ScrollableRef>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollableRef.current && contentRef.current) {
        scrollableRef.current.scrollTo(contentRef.current.scrollHeight);
      }
    }, 50);
  }, []);

  useEffect(() => {
    if (dependency) {
      scrollToBottom();
    }
  }, [dependency, scrollToBottom]);

  // Renombramos el retorno para evitar confusión con el nombre del hook
  return { scrollableRef, contentRef, scrollToBottom };
}
