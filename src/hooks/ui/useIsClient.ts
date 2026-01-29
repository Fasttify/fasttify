import { useState } from 'react';

/**
 * Hook personalizado para detectar si el componente se está ejecutando en el cliente
 * Evita hydration mismatches entre servidor y cliente
 *
 * @returns {boolean} true si está en el cliente, false si está en el servidor
 */
export function useIsClient(): boolean {
  // Evalúa una sola vez sin efectos (evita cascadas de renders)
  const [isClient] = useState<boolean>(() => typeof window !== 'undefined');
  return isClient;
}
