import useAuthStore from '@/context/core/userStore';

/**
 * Hook personalizado para manejar la autenticación del usuario.
 * Es un wrapper simple del store de Zustand que centraliza toda la lógica de auth.
 * Usa forceRefresh: false por defecto para mantener la sesión, solo fuerza refresh cuando es necesario.
 *
 * @returns {Object} Estado y funciones de autenticación
 *
 * @example
 * ```tsx
 * const { user, loading, isAuthenticated, initializeAuth, refreshUser } = useAuth()
 *
 * // Inicializar una sola vez (ej: en layout principal)
 * useEffect(() => {
 *   initializeAuth();
 * }, []);
 *
 * if (loading) {
 *   return <Loading />
 * }
 * ```
 */
export const useAuth = () => {
  const { user, loading, isAuthenticated, error, checkUser, refreshUser, initializeAuth, cleanup, clearUser } =
    useAuthStore();

  return {
    user,
    loading,
    isAuthenticated,
    error,
    checkUser,
    refreshUser,
    initializeAuth,
    cleanup,
    clearUser,
  };
};
