import useAuthStore from '@/context/core/userStore';

/**
 * Hook para autenticación sin refresh del token
 * Úsalo en rutas donde el middleware ya maneja la autenticación
 */
export const useAuthNoRefresh = () => {
  console.log('🔄 useAuthNoRefresh: Hook inicializado, environment:', process.env.NODE_ENV);
  const { user, loading, isAuthenticated, error, checkUser, refreshUser, initializeAuth, cleanup, clearUser } =
    useAuthStore();

  console.log(
    '🔄 useAuthNoRefresh: Estado actual - user:',
    !!user,
    'loading:',
    loading,
    'isAuthenticated:',
    isAuthenticated,
    'error:',
    error
  );

  // Función específica que NO hace refresh
  const checkUserNoRefresh = () => {
    console.log('🔄 useAuthNoRefresh: checkUser con forceRefresh: false, environment:', process.env.NODE_ENV);
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
