import { create } from 'zustand';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

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

interface UserState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  setUser: (newUserData: User) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  checkUser: () => Promise<void>;
  initializeAuth: () => void;
  cleanup: () => void;
  logout: () => Promise<void>;
}

// Variables globales para controlar el estado de la autenticación
let isInitialized = false;
let hubUnsubscribe: (() => void) | null = null;
let refreshSessionPromise: Promise<any> | null = null;

const useAuthStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  isAuthenticated: false,
  error: null,

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

  setLoading: (isLoading) => set(() => ({ loading: isLoading })),
  setError: (error) => set(() => ({ error, loading: false })),

  checkUser: async () => {
    if (refreshSessionPromise) {
      await refreshSessionPromise;
      return;
    }

    try {
      set({ loading: true, error: null });

      // Verificar si estamos en rutas donde no se debe hacer refresh
      const pathname = window.location.pathname;
      const NO_REFRESH_ROUTES = ['/first-steps', '/my-store'];
      const shouldSkipRefresh = NO_REFRESH_ROUTES.includes(pathname);

      // Inicia la promesa para refrescar la sesión (sin forceRefresh en rutas específicas)
      refreshSessionPromise = fetchAuthSession({ forceRefresh: !shouldSkipRefresh });
      const session = await refreshSessionPromise;

      if (session && session.tokens) {
        const userAttributes = session.tokens.idToken?.payload || {};

        const newUser: User = {
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
        set({ user: newUser, loading: false, isAuthenticated: true, error: null });
      } else {
        // Si no hay sesión, limpia el estado
        get().clearUser();
      }
    } catch (error: any) {
      console.error('Error verifying user session:', error);

      if (error.name === 'NotAuthorizedException' || (error.message && error.message.includes('revoked'))) {
        console.warn('Token revoked detected. Forcing logout and full reload.');

        try {
          // Intenta cerrar sesión en Cognito, pero no dejes que falle si ya hay problemas
          await signOut();
        } catch (signOutError) {
          console.error('Secondary error when trying to force signOut:', signOutError);
        } finally {
          // La acción más importante: limpiar el estado y recargar la aplicación
          get().clearUser();
          // Usar replace para evitar bucles infinitos en el historial
          if (!window.location.pathname.includes('/login')) {
            window.location.replace('/login?reason=session_expired');
          }
        }
      } else {
        // Para cualquier otro error, simplemente limpia el estado
        get().clearUser();
        set({ error: error.message || 'Error desconocido al verificar la sesión' });
      }
    } finally {
      refreshSessionPromise = null;
      set({ loading: false });
    }
  },

  // Inicializar autenticación
  initializeAuth: () => {
    if (isInitialized) return;
    isInitialized = true;

    // Si estamos en la página de login con reason=session_expired, no verificar usuario
    const urlParams = new URLSearchParams(window.location.search);
    const isSessionExpired = urlParams.get('reason') === 'session_expired';

    if (!isSessionExpired) {
      // Solo verificar usuario si no estamos manejando una sesión expirada
      get().checkUser();
    } else {
      // Limpiar el estado si venimos de una sesión expirada
      get().clearUser();
    }

    hubUnsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          get().checkUser();
          break;

        case 'signedOut':
          get().clearUser();
          break;

        case 'signInWithRedirect_failure':
          get().clearUser();
          break;
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

  logout: async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      get().clearUser();
      get().cleanup();
      window.location.replace('/login');
    }
  },
}));

export default useAuthStore;
