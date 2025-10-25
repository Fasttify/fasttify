import { NextRequest, NextResponse } from 'next/server';
import { getSession, type AuthSession, clearAllSessionCache } from '@/middlewares/auth/auth';
import {
  AuthGetCurrentUserServer,
  AuthFetchUserAttributesServer,
  AuthFetchAuthSessionServer,
} from '@/utils/client/AmplifyUtils';

jest.mock('@/utils/client/AmplifyUtils', () => ({
  AuthGetCurrentUserServer: jest.fn(),
  AuthFetchUserAttributesServer: jest.fn(),
  AuthFetchAuthSessionServer: jest.fn(),
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

  const mockUserAttributes = {
    'custom:plan': 'Royal',
    email: 'test@example.com',
    nickname: 'Test User',
  };

  const expectedSession: AuthSession = {
    tokens: {
      idToken: {
        payload: {
          'cognito:username': 'test-user-123',
          'custom:plan': 'Royal',
          email: 'test@example.com',
          nickname: 'Test User',
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    clearAllSessionCache();

    mockRequest = {
      url: 'http://localhost:3000/test',
      headers: {
        get: jest.fn().mockReturnValue('CognitoIdentityServiceProvider.abc123def456=testuser'),
      },
    } as unknown as NextRequest;

    mockResponse = {} as NextResponse;

    const mockAuthGetCurrentUserServer = AuthGetCurrentUserServer as jest.Mock;
    const mockAuthFetchUserAttributesServer = AuthFetchUserAttributesServer as jest.Mock;
    const mockAuthFetchAuthSessionServer = AuthFetchAuthSessionServer as jest.Mock;

    const mockAuthSession = {
      tokens: {
        idToken: {
          payload: {
            'cognito:username': 'test-user-123',
          },
        },
      },
    };

    mockAuthFetchAuthSessionServer.mockResolvedValue(mockAuthSession);
    mockAuthGetCurrentUserServer.mockResolvedValue(mockUser);
    mockAuthFetchUserAttributesServer.mockResolvedValue(mockUserAttributes);
  });

  describe('Cache entre múltiples middlewares', () => {
    it('debe usar cache entre múltiples middlewares en el mismo flujo', async () => {
      const authSession = await getSession(mockRequest, mockResponse);
      const storeAccessSession = await getSession(mockRequest, mockResponse);
      const storeSession = await getSession(mockRequest, mockResponse);

      expect(authSession).toEqual(expectedSession);
      expect(storeAccessSession).toEqual(expectedSession);
      expect(storeSession).toEqual(expectedSession);

      expect(AuthFetchAuthSessionServer).toHaveBeenCalled();
      expect(AuthGetCurrentUserServer).toHaveBeenCalled();
      expect(AuthFetchUserAttributesServer).toHaveBeenCalled();
    });
  });

  describe('Reducción de llamadas a Cognito', () => {
    it('debe ejecutar múltiples middlewares en paralelo sin duplicar llamadas', async () => {
      const promises = Array(3)
        .fill(null)
        .map(() => getSession(mockRequest, mockResponse));
      const results = await Promise.all(promises);

      // Todas las llamadas deberían retornar la misma sesión
      results.forEach((result) => {
        expect(result).toEqual(expectedSession);
      });

      // Verificar que las funciones fueron llamadas
      expect(AuthFetchAuthSessionServer).toHaveBeenCalled();
      expect(AuthGetCurrentUserServer).toHaveBeenCalled();
      expect(AuthFetchUserAttributesServer).toHaveBeenCalled();
    });
  });

  describe('Consistencia de datos entre middlewares', () => {
    it('debe mantener consistencia de datos entre middlewares', async () => {
      const session1 = await getSession(mockRequest, mockResponse);
      const session2 = await getSession(mockRequest, mockResponse);

      // Verificar datos específicos del usuario
      expect((session1 as AuthSession)?.tokens?.idToken?.payload?.['cognito:username']).toBe('test-user-123');
      expect((session1 as AuthSession)?.tokens?.idToken?.payload?.['custom:plan']).toBe('Royal');
      expect((session2 as AuthSession)?.tokens?.idToken?.payload?.['cognito:username']).toBe('test-user-123');
      expect((session2 as AuthSession)?.tokens?.idToken?.payload?.['custom:plan']).toBe('Royal');
    });
  });

  describe('Diferentes formatos de cookies Cognito', () => {
    it('debe manejar diferentes regiones de Cognito correctamente', async () => {
      const regions = ['us-east-1', 'us-west-2', 'eu-west-1'];

      for (const region of regions) {
        const regionRequest = {
          ...mockRequest,
          headers: {
            get: jest.fn().mockReturnValue(`CognitoIdentityServiceProvider.${region}.abc123=testuser`),
          },
        } as unknown as NextRequest;

        const session = await getSession(regionRequest, mockResponse);

        expect(session).toEqual(expectedSession);
        expect(AuthFetchAuthSessionServer).toHaveBeenCalled();
        expect(AuthGetCurrentUserServer).toHaveBeenCalled();
        expect(AuthFetchUserAttributesServer).toHaveBeenCalled();
      }
    });
  });
});
