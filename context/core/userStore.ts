import { create } from 'zustand';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

// Define el tipo del usuario
interface User {
  nickName?: string;
  email: string;
  picture?: string;
  preferredUsername?: string;
  plan?: string;
  bio?: string;
  phone?: string;
  cognitoUsername?: string;
  userId?: string;
  identities?: any[];
}

// Define el estado y las acciones del store
interface UserState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Acciones básicas
  setUser: (newUserData: User) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Acciones de autenticación
  checkUser: (forceRefresh?: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
  initializeAuth: () => void;
  cleanup: () => void;
  logout: () => Promise<void>;
  handleTokenRevoked: () => void;
}

// Variables globales para controlar inicialización
let isInitialized = false;
let hubUnsubscribe: (() => void) | null = null;

const useAuthStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  isAuthenticated: false,
  error: null,

  // Acciones básicas
  setUser: (newUserData) =>
    set(() => ({
      user: newUserData,
      loading: false,
      isAuthenticated: true,
      error: null,
    })),

  clearUser: () =>
    set(() => ({
      user: null,
      loading: false,
      isAuthenticated: false,
      error: null,
    })),

  setLoading: (isLoading) =>
    set(() => ({
      loading: isLoading,
    })),

  setError: (error) =>
    set(() => ({
      error,
      loading: false,
    })),

  // Verificar y obtener datos del usuario
  checkUser: async (forceRefresh = true) => {
    try {
      set({ loading: true, error: null });

      // Obtener la sesión actual del usuario
      const session = await fetchAuthSession({ forceRefresh });

      // Verificar si hay una sesión válida con tokens
      if (session && session.tokens) {
        // Obtener los atributos del usuario desde el token ID
        const userAttributes = session.tokens.idToken?.payload || {};

        const newUser = {
          nickName: typeof userAttributes.nickname === 'string' ? userAttributes.nickname : undefined,
          email: typeof userAttributes.email === 'string' ? userAttributes.email : '',
          picture: typeof userAttributes.picture === 'string' ? userAttributes.picture : undefined,
          preferredUsername:
            typeof userAttributes.preferred_username === 'string' ? userAttributes.preferred_username : '',
          plan: typeof userAttributes['custom:plan'] === 'string' ? userAttributes['custom:plan'] : undefined,
          bio: typeof userAttributes['custom:bio'] === 'string' ? userAttributes['custom:bio'] : undefined,
          phone: typeof userAttributes['custom:phone'] === 'string' ? userAttributes['custom:phone'] : undefined,
          identities: Array.isArray(userAttributes.identities) ? userAttributes.identities : undefined,
          cognitoUsername: typeof userAttributes.sub === 'string' ? userAttributes.sub : undefined,
          userId:
            typeof userAttributes['cognito:username'] === 'string' ? userAttributes['cognito:username'] : undefined,
        };

        set({
          user: newUser,
          loading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        set({
          user: null,
          loading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error getting user:', error);

      // Manejar específicamente el error de refresh token revocado
      const isTokenRevoked =
        error instanceof Error &&
        (error.message.includes('Refresh Token has been revoked') || error.message.includes('NotAuthorizedException'));

      if (isTokenRevoked && forceRefresh) {
        // Si falló el forceRefresh, intentar sin forzar refresh
        try {
          const session = await fetchAuthSession({ forceRefresh: false });

          if (session && session.tokens) {
            // Si tenemos una sesión válida sin forzar refresh, usarla
            const userAttributes = session.tokens.idToken?.payload || {};

            const newUser = {
              nickName: typeof userAttributes.nickname === 'string' ? userAttributes.nickname : undefined,
              email: typeof userAttributes.email === 'string' ? userAttributes.email : '',
              picture: typeof userAttributes.picture === 'string' ? userAttributes.picture : undefined,
              preferredUsername:
                typeof userAttributes.preferred_username === 'string' ? userAttributes.preferred_username : '',
              plan: typeof userAttributes['custom:plan'] === 'string' ? userAttributes['custom:plan'] : undefined,
              bio: typeof userAttributes['custom:bio'] === 'string' ? userAttributes['custom:bio'] : undefined,
              phone: typeof userAttributes['custom:phone'] === 'string' ? userAttributes['custom:phone'] : undefined,
              identities: Array.isArray(userAttributes.identities) ? userAttributes.identities : undefined,
              cognitoUsername: typeof userAttributes.sub === 'string' ? userAttributes.sub : undefined,
              userId:
                typeof userAttributes['cognito:username'] === 'string' ? userAttributes['cognito:username'] : undefined,
            };

            set({
              user: newUser,
              loading: false,
              isAuthenticated: true,
              error: null,
            });
            return;
          }
        } catch (fallbackError) {
          console.error('Error in fallback session check:', fallbackError);
        }
      }

      // Si llegamos aquí, el usuario necesita reautenticarse
      set({
        user: null,
        loading: false,
        isAuthenticated: false,
        error: isTokenRevoked
          ? 'Sesión expirada. Por favor, inicia sesión nuevamente.'
          : error instanceof Error
            ? error.message
            : 'Error desconocido',
      });
    }
  },

  // Refrescar datos del usuario
  refreshUser: async () => {
    await get().checkUser(true);
  },

  // Inicializar autenticación (solo una vez globalmente)
  initializeAuth: () => {
    if (isInitialized) return;

    isInitialized = true;
    const { user, checkUser } = get();

    // Verificar usuario si no hay uno
    if (!user) {
      checkUser(true);
    }

    // Escuchar eventos de autenticación para refrescar automáticamente
    hubUnsubscribe = Hub.listen('auth', ({ payload }) => {
      if (
        [
          'signIn',
          'signOut',
          'tokenRefresh',
          'signInWithRedirect',
          'signInWithRedirect_failure',
          'customOAuthState',
          'signIn_failure',
          'signOut_failure',
        ].includes(payload.event)
      ) {
        get().checkUser(true);
      } else if (payload.event === 'tokenRefresh_failure') {
        // Manejar específicamente el fallo de refresh token
        console.warn('Token refresh failed:', payload.data);

        // Verificar si es un error de token revocado
        const isTokenRevoked =
          payload.data?.error?.message?.includes('Refresh Token has been revoked') ||
          payload.data?.error?.message?.includes('NotAuthorizedException');

        if (isTokenRevoked) {
          get().handleTokenRevoked();
        } else {
          // Para otros errores de refresh, intentar obtener la sesión sin forzar refresh
          get()
            .checkUser(false)
            .catch(() => {
              // Si también falla sin forzar refresh, limpiar el usuario
              get().clearUser();
            });
        }
      }
    });
  },

  // Limpiar listeners
  cleanup: () => {
    if (hubUnsubscribe) {
      hubUnsubscribe();
      hubUnsubscribe = null;
    }
    isInitialized = false;
  },

  // Cerrar sesión
  logout: async () => {
    try {
      // Importar signOut dinámicamente
      const { signOut } = await import('aws-amplify/auth');

      // Cerrar sesión en AWS Cognito
      await signOut();

      // Limpiar estado local
      get().clearUser();
      get().cleanup();
    } catch (error) {
      console.error('Error during logout:', error);
      // Limpiar estado local incluso si falla el signOut
      get().clearUser();
      get().cleanup();
    }
  },

  // Manejar tokens revocados
  handleTokenRevoked: () => {
    console.warn('Token revocado detectado, limpiando sesión');
    set({
      user: null,
      loading: false,
      isAuthenticated: false,
      error: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
    });

    // Opcional: redirigir al login si estamos en el cliente
    if (typeof window !== 'undefined') {
      // Solo redirigir si no estamos ya en la página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  },
}));

export default useAuthStore;
