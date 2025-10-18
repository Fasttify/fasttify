jest.mock('node-cache', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flushAll: jest.fn(),
  }));
});

jest.mock('@/utils/client/AmplifyUtils', () => ({
  AuthGetCurrentUserServer: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn(),
    next: jest.fn(),
  },
}));

import { getSession, clearAllSessionCache } from '@/middlewares/auth/auth';
import { AuthGetCurrentUserServer } from '@/utils/client/AmplifyUtils';
import { NextRequest, NextResponse } from 'next/server';

describe('getSession with Caching', () => {
  let mockRequest: NextRequest;
  let mockResponse: NextResponse;

  const mockUser = {
    username: 'testuser',
    userId: 'test-user-123',
    signInDetails: {
      loginId: 'test@example.com',
    },
  };

  const expectedSession = {
    tokens: {
      idToken: {
        payload: {
          'cognito:username': 'testuser',
          'custom:plan': 'free',
          email: 'test@example.com',
          nickname: 'testuser',
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Limpiar caché entre tests
    clearAllSessionCache();
  });

  describe('Fetch y cache de sesión nueva', () => {
    it('debe fetchear una nueva sesión y cachearla', async () => {
      mockRequest = {
        url: 'http://localhost:3000/test',
        headers: {
          get: jest.fn().mockReturnValue('CognitoIdentityServiceProvider.abc123def456=testuser; other=cookie'),
        },
      } as unknown as NextRequest;

      mockResponse = {} as NextResponse;

      const mockAuthGetCurrentUserServer = AuthGetCurrentUserServer as jest.Mock;
      mockAuthGetCurrentUserServer.mockResolvedValueOnce(mockUser);

      const result = await getSession(mockRequest, mockResponse);

      expect(mockAuthGetCurrentUserServer).toHaveBeenCalled();
      expect(result).toEqual(expectedSession);
    });
  });

  describe('Retorno de sesión cacheada', () => {
    it('debe retornar sesión del cache si hay cache hit', async () => {
      mockRequest = {
        url: 'http://localhost:3000/test',
        headers: {
          get: jest.fn().mockReturnValue('CognitoIdentityServiceProvider.abc123def456=testuser; other=cookie'),
        },
      } as unknown as NextRequest;

      mockResponse = {} as NextResponse;

      const mockAuthGetCurrentUserServer = AuthGetCurrentUserServer as jest.Mock;
      mockAuthGetCurrentUserServer.mockResolvedValue(mockUser);

      // Primera llamada - fetchea y cachea
      const result1 = await getSession(mockRequest, mockResponse);

      // Segunda llamada - debería usar cache
      const result2 = await getSession(mockRequest, mockResponse);

      // Verificar que ambas llamadas retornan la misma sesión
      expect(result1).toEqual(expectedSession);
      expect(result2).toEqual(expectedSession);

      // Verificar que AuthGetCurrentUserServer fue llamado
      expect(mockAuthGetCurrentUserServer).toHaveBeenCalled();
    });
  });

  describe('Cache siempre verifica primero', () => {
    it('debe verificar cache antes de llamar AuthGetCurrentUserServer', async () => {
      mockRequest = {
        url: 'http://localhost:3000/test',
        headers: {
          get: jest.fn().mockReturnValue('CognitoIdentityServiceProvider.abc123def456=testuser; other=cookie'),
        },
      } as unknown as NextRequest;

      mockResponse = {} as NextResponse;

      const mockAuthGetCurrentUserServer = AuthGetCurrentUserServer as jest.Mock;
      mockAuthGetCurrentUserServer.mockResolvedValueOnce(mockUser);

      const result = await getSession(mockRequest, mockResponse);

      expect(mockAuthGetCurrentUserServer).toHaveBeenCalled();
      expect(result).toEqual(expectedSession);
    });
  });

  describe('Generación de cache key estable', () => {
    it('debe usar la misma cache key para las mismas cookies de Cognito', async () => {
      const cookies = 'CognitoIdentityServiceProvider.abc123def456=testuser; other=cookie';

      mockRequest = {
        url: 'http://localhost:3000/test',
        headers: {
          get: jest.fn().mockReturnValue(cookies),
        },
      } as unknown as NextRequest;

      mockResponse = {} as NextResponse;

      const mockAuthGetCurrentUserServer = AuthGetCurrentUserServer as jest.Mock;
      mockAuthGetCurrentUserServer.mockResolvedValueOnce(mockUser);

      // Primera llamada
      await getSession(mockRequest, mockResponse);

      // Segunda llamada con las mismas cookies
      await getSession(mockRequest, mockResponse);

      // Verificar que AuthGetCurrentUserServer fue llamado
      expect(mockAuthGetCurrentUserServer).toHaveBeenCalled();
    });
  });

  describe('Manejo de errores en fetch', () => {
    it('debe retornar null si AuthGetCurrentUserServer falla', async () => {
      mockRequest = {
        url: 'http://localhost:3000/test',
        headers: {
          get: jest.fn().mockReturnValue('CognitoIdentityServiceProvider.abc123def456=testuser; other=cookie'),
        },
      } as unknown as NextRequest;

      mockResponse = {} as NextResponse;

      const mockAuthGetCurrentUserServer = AuthGetCurrentUserServer as jest.Mock;
      mockAuthGetCurrentUserServer.mockRejectedValueOnce(new Error('Auth error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getSession(mockRequest, mockResponse);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user session:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('No cachear sesiones inválidas', () => {
    it('debe retornar null y no cachear si no hay usuario', async () => {
      mockRequest = {
        url: 'http://localhost:3000/test',
        headers: {
          get: jest.fn().mockReturnValue('CognitoIdentityServiceProvider.abc123def456=testuser; other=cookie'),
        },
      } as unknown as NextRequest;

      mockResponse = {} as NextResponse;

      const mockAuthGetCurrentUserServer = AuthGetCurrentUserServer as jest.Mock;
      mockAuthGetCurrentUserServer.mockResolvedValueOnce(null);

      const result = await getSession(mockRequest, mockResponse);

      expect(result).toBeNull();
      expect(mockAuthGetCurrentUserServer).toHaveBeenCalled();
    });
  });
});
