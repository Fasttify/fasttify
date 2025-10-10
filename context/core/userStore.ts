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

      // Inicia la promesa para refrescar la sesión
      refreshSessionPromise = fetchAuthSession({ forceRefresh: true });
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
      console.error('Error al verificar la sesión del usuario:', error);

      if (error.name === 'NotAuthorizedException' || (error.message && error.message.includes('revoked'))) {
        console.warn('Token revocado detectado. Forzando cierre de sesión y recarga completa.');

        try {
          // Intenta cerrar sesión en Cognito, pero no dejes que falle si ya hay problemas
          await signOut();
        } catch (signOutError) {
          console.error('Error secundario al intentar signOut forzado:', signOutError);
        } finally {
          // La acción más importante: limpiar el estado y recargar la aplicación
          get().clearUser();
          window.location.href = '/login?reason=session_expired'; // Redirige y fuerza una recarga
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

  // Inicializar autenticación (sin cambios)
  initializeAuth: () => {
    if (isInitialized) return;
    isInitialized = true;

    // Al inicializar, siempre verifica al usuario.
    get().checkUser();

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
      console.error('Error durante el logout en Amplify:', error);
    } finally {
      get().clearUser();
      get().cleanup();
      window.location.href = '/login';
    }
  },
}));

export default useAuthStore;
