import { renderHook, act } from '@testing-library/react';
import useAuthStore from '@/context/core/userStore';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

// Mock de AWS Amplify
jest.mock('aws-amplify/auth', () => ({
  signOut: jest.fn(),
  fetchAuthSession: jest.fn(),
}));

jest.mock('aws-amplify/utils', () => ({
  Hub: {
    listen: jest.fn(),
  },
}));

// Mock de window.location
const mockLocation = {
  href: '',
  replace: jest.fn(),
  pathname: '/',
  search: '',
};

// Eliminar location y redefinirlo
delete (window as any).location;
(window as any).location = mockLocation;

describe('useAuthStore', () => {
  const mockFetchAuthSession = fetchAuthSession as jest.Mock;
  const mockSignOut = signOut as jest.Mock;
  const mockHubListen = Hub.listen as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset global variables
    jest.resetModules();

    // Limpiar el mock de location
    mockLocation.href = '';
    mockLocation.pathname = '/';
    mockLocation.search = '';
    mockLocation.replace.mockClear();
  });

  describe('Estado inicial', () => {
    it('debe inicializar con estado por defecto', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Procesamiento de sesión válida', () => {
    it('debe procesar una sesión válida correctamente', async () => {
      const mockSession = {
        tokens: {
          idToken: {
            payload: {
              'cognito:username': 'test-user',
              'custom:plan': 'Royal',
              email: 'test@example.com',
            },
          },
        },
      };

      mockFetchAuthSession.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkUser();
      });

      expect(mockFetchAuthSession).toHaveBeenCalledWith({ forceRefresh: true });
      expect(result.current.user?.userId).toBe('test-user');
      expect(result.current.user?.plan).toBe('Royal');
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Manejo de sesión nula', () => {
    it('debe manejar sesión nula correctamente', async () => {
      mockFetchAuthSession.mockResolvedValue(null);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkUser();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Manejo de NotAuthorizedException', () => {
    it('debe manejar NotAuthorizedException correctamente', async () => {
      const revokedError = new Error('Refresh Token has been revoked');
      revokedError.name = 'NotAuthorizedException';

      mockFetchAuthSession.mockRejectedValue(revokedError);
      mockSignOut.mockResolvedValue({});

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkUser();
      });

      expect(mockSignOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Manejo de errores generales', () => {
    it('debe manejar errores generales correctamente', async () => {
      const generalError = new Error('Network error');
      mockFetchAuthSession.mockRejectedValue(generalError);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkUser();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Logout exitoso', () => {
    it('debe realizar logout correctamente', async () => {
      mockSignOut.mockResolvedValue({});

      const { result } = renderHook(() => useAuthStore());

      // Primero establecer un usuario
      await act(() => {
        result.current.setUser({
          userId: 'test-user',
          plan: 'Royal',
          email: 'test@example.com',
          nickName: 'test',
          picture: '',
          preferredUsername: 'testuser',
        });
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockSignOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Configuración de Hub listener', () => {
    it('debe configurar Hub listener al inicializar', () => {
      const mockUnsubscribe = jest.fn();
      mockHubListen.mockReturnValue(mockUnsubscribe);

      const { result } = renderHook(() => useAuthStore());

      result.current.initializeAuth();

      expect(mockHubListen).toHaveBeenCalledWith('auth', expect.any(Function));
    });
  });

  describe('Prevención de llamadas duplicadas', () => {
    it('debe prevenir llamadas duplicadas a fetchAuthSession', async () => {
      const mockSession = {
        tokens: {
          idToken: {
            payload: {
              'cognito:username': 'test-user',
              'custom:plan': 'Royal',
            },
          },
        },
      };

      mockFetchAuthSession.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useAuthStore());

      // Llamar checkUser múltiples veces simultáneamente
      await act(async () => {
        await Promise.all([result.current.checkUser(), result.current.checkUser(), result.current.checkUser()]);
      });

      // Debería llamar fetchAuthSession solo una vez
      expect(mockFetchAuthSession).toHaveBeenCalledTimes(1);
    });
  });
});
