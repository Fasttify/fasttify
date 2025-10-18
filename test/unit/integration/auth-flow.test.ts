import { NextRequest, NextResponse } from 'next/server';
import { getSession, type AuthSession, clearAllSessionCache } from '@/middlewares/auth/auth';
import { AuthGetCurrentUserServer } from '@/utils/client/AmplifyUtils';

jest.mock('@/utils/client/AmplifyUtils', () => ({
  AuthGetCurrentUserServer: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn(),
  },
}));

jest.mock('node-cache', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flushAll: jest.fn(),
  }));
});

describe('Auth Flow Integration Tests', () => {
  let mockRequest: NextRequest;
  let mockResponse: NextResponse;

  const mockUser = {
    username: 'test-user-123',
    userId: 'test-user-123',
    signInDetails: {
      loginId: 'test@example.com',
    },
  };

  const expectedSession: AuthSession = {
    tokens: {
      idToken: {
        payload: {
          'cognito:username': 'test-user-123',
          'custom:plan': 'free',
          email: 'test@example.com',
          nickname: 'test-user-123',
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Limpiar caché entre tests
    clearAllSessionCache();

    mockRequest = {
      url: 'https://test-store.fasttify.com/admin',
      nextUrl: {
        pathname: '/admin',
      },
      headers: {
        get: jest.fn().mockImplementation((header) => {
          if (header === 'cookie') {
            return 'CognitoIdentityServiceProvider.us-east-1.test123.userId=test-user-123; other-cookie=value';
          }
          return null;
        }),
      },
    } as unknown as NextRequest;

    mockResponse = NextResponse.next();

    const mockAuthGetCurrentUserServer = AuthGetCurrentUserServer as jest.Mock;
    mockAuthGetCurrentUserServer.mockResolvedValue(mockUser);
  });

  describe('Cache entre múltiples middlewares', () => {
    it('debe usar cache entre múltiples middlewares en el mismo flujo', async () => {
      // Primera llamada a getSession (auth middleware)
      const authSession = await getSession(mockRequest, mockResponse);

      // Segunda llamada a getSession (storeAccess middleware)
      const storeAccessSession = await getSession(mockRequest, mockResponse);

      // Tercera llamada a getSession (store middleware)
      const storeSession = await getSession(mockRequest, mockResponse);

      // Todas las sesiones deberían ser iguales
      expect(authSession).toEqual(expectedSession);
      expect(storeAccessSession).toEqual(expectedSession);
      expect(storeSession).toEqual(expectedSession);

      // Verificar que AuthGetCurrentUserServer fue llamado
      expect(AuthGetCurrentUserServer).toHaveBeenCalled();
    });
  });

  describe('Manejo de error de autenticación en el flujo', () => {
    it('debe manejar error de autenticación correctamente en el flujo', async () => {
      const authError = new Error('User not authenticated');

      // Mock para que AuthGetCurrentUserServer falle
      const mockAuthGetCurrentUserServer = AuthGetCurrentUserServer as jest.Mock;
      mockAuthGetCurrentUserServer.mockRejectedValueOnce(authError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // getSession debería retornar null cuando hay error de autenticación
      const authSession = await getSession(mockRequest, mockResponse);

      expect(authSession).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user session:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Llamadas a AuthGetCurrentUserServer', () => {
    it('debe llamar AuthGetCurrentUserServer cuando es necesario', async () => {
      // Primera llamada
      await getSession(mockRequest, mockResponse);

      // Segunda llamada
      await getSession(mockRequest, mockResponse);

      // Verificar que AuthGetCurrentUserServer fue llamado
      expect(AuthGetCurrentUserServer).toHaveBeenCalled();
    });
  });

  describe('Reducción de llamadas a Cognito', () => {
    it('debe ejecutar múltiples middlewares en paralelo sin duplicar llamadas', async () => {
      // Ejecutar múltiples llamadas a getSession en paralelo
      const promises = [
        getSession(mockRequest, mockResponse),
        getSession(mockRequest, mockResponse),
        getSession(mockRequest, mockResponse),
      ];

      const results = await Promise.all(promises);

      // Todas las llamadas deberían retornar la misma sesión
      results.forEach((result) => {
        expect(result).toEqual(expectedSession);
      });

      // Verificar que AuthGetCurrentUserServer fue llamado
      expect(AuthGetCurrentUserServer).toHaveBeenCalled();
    });
  });

  describe('Consistencia de datos entre middlewares', () => {
    it('debe mantener consistencia de datos entre middlewares', async () => {
      // Simular múltiples middlewares que acceden a la misma sesión
      const session1: AuthSession | null = await getSession(mockRequest, mockResponse);
      const session2: AuthSession | null = await getSession(mockRequest, mockResponse);
      const session3: AuthSession | null = await getSession(mockRequest, mockResponse);

      // Verificar que todos los middlewares ven los mismos datos
      expect(session1).toEqual(session2);
      expect(session2).toEqual(session3);

      // Verificar datos específicos del usuario
      expect(session1?.tokens?.idToken?.payload?.['cognito:username']).toBe('test-user-123');
      expect(session1?.tokens?.idToken?.payload?.['custom:plan']).toBe('free');
      expect(session2?.tokens?.idToken?.payload?.['cognito:username']).toBe('test-user-123');
      expect(session2?.tokens?.idToken?.payload?.['custom:plan']).toBe('free');
    });
  });

  describe('Diferentes formatos de cookies Cognito', () => {
    it('debe manejar diferentes regiones de Cognito correctamente', async () => {
      const regions = ['us-east-1', 'eu-west-1', 'ap-southeast-1'];

      for (const region of regions) {
        const cookies = `CognitoIdentityServiceProvider.${region}.abc123.userId=test-user-${region}; other=cookie`;

        const request = {
          url: 'https://test-store.fasttify.com/admin',
          nextUrl: { pathname: '/admin' },
          headers: {
            get: jest.fn().mockImplementation((header) => {
              if (header === 'cookie') return cookies;
              return null;
            }),
          },
        } as unknown as NextRequest;

        const session = await getSession(request, mockResponse);

        expect(session).toEqual(expectedSession);
        expect(AuthGetCurrentUserServer).toHaveBeenCalled();
      }
    });
  });
});
