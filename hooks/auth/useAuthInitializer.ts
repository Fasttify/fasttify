'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/hooks/useAuth';

/**
 * Hook que inicializa automáticamente la autenticación
 * Úsalo en layouts o componentes que necesiten auth automático
 */
export function useAuthInitializer() {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
}
