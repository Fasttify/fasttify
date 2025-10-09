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
      console.log(`🔐 checkUser: forceRefresh=${forceRefresh}, environment=${process.env.NODE_ENV}`);
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
        console.log('🔐 checkUser: No hay sesión válida, limpiando usuario');
        set({
          user: null,
          loading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (error) {
      console.error(
        '🔐 checkUser: Error getting user:',
        error,
        'forceRefresh:',
        forceRefresh,
        'environment:',
        process.env.NODE_ENV
      );
      set({
        user: null,
        loading: false,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },

  // Refrescar datos del usuario
  refreshUser: async () => {
    console.log('🔄 refreshUser: Ejecutando con forceRefresh: true, environment:', process.env.NODE_ENV);
    await get().checkUser(true);
  },

  // Inicializar autenticación (solo una vez globalmente)
  initializeAuth: () => {
    console.log('🚀 initializeAuth: Iniciando, isInitialized:', isInitialized, 'environment:', process.env.NODE_ENV);
    if (isInitialized) {
      console.log('🚀 initializeAuth: Ya inicializado, saliendo');
      return;
    }

    isInitialized = true;
    const { user, checkUser } = get();

    console.log('🚀 initializeAuth: Usuario actual:', !!user);
    // Verificar usuario si no hay uno
    if (!user) {
      console.log('🚀 initializeAuth: No hay usuario, ejecutando checkUser(true)');
      checkUser(true);
    } else {
      console.log('🚀 initializeAuth: Ya hay usuario, no ejecutando checkUser');
    }

    // Escuchar eventos de autenticación para refrescar automáticamente
    hubUnsubscribe = Hub.listen('auth', ({ payload }) => {
      console.log('🔔 Hub auth event:', payload.event, 'environment:', process.env.NODE_ENV);
      if (
        [
          'signIn',
          'signOut',
          'signIn_failure',
          'signOut_failure',
          'signInWithRedirect',
          'signInWithRedirect_failure',
          'customOAuthState',
        ].includes(payload.event)
      ) {
        console.log('🔔 Hub: Ejecutando checkUser(true) por evento:', payload.event);
        get().checkUser(true);
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
}));

export default useAuthStore;
