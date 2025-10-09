import useAuthStore from '@/context/core/userStore';

/**
 * Hook para autenticación sin refresh del token
 * Úsalo en rutas donde el middleware ya maneja la autenticación
 */
export const useAuthNoRefresh = () => {
  const { user, loading, isAuthenticated, error, checkUser, refreshUser, initializeAuth, cleanup, clearUser } =
    useAuthStore();

  // Función específica que NO hace refresh
  const checkUserNoRefresh = () => {
    return checkUser(false); // forceRefresh: false
  };

  return {
    user,
    loading,
    isAuthenticated,
    error,
    checkUser: checkUserNoRefresh,
    refreshUser,
    initializeAuth,
    cleanup,
    clearUser,
  };
};
