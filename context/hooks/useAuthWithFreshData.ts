import useAuthStore from '@/context/core/userStore';

/**
 * Hook para autenticación que requiere datos frescos (como el plan del usuario)
 * Úsalo en rutas críticas como /my-store donde necesitas validar planes activos
 *
 * @returns {Object} Estado y funciones de autenticación con datos frescos
 */
export const useAuthWithFreshData = () => {
  const { user, loading, isAuthenticated, error, checkUser, refreshUser, initializeAuth, cleanup, clearUser } =
    useAuthStore();

  // Función específica que siempre obtiene datos frescos
  const checkUserWithFreshData = () => {
    return checkUser(false, true); // forceRefresh: false, requireFreshData: true
  };

  return {
    user,
    loading,
    isAuthenticated,
    error,
    checkUser: checkUserWithFreshData,
    refreshUser,
    initializeAuth,
    cleanup,
    clearUser,
  };
};
