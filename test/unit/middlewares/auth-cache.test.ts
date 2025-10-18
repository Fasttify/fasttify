import { getSession, clearAllSessionCache } from '@/middlewares/auth/auth';
import { AuthGetCurrentUserServer, AuthFetchUserAttributesServer } from '@/utils/client/AmplifyUtils';
import { NextRequest, NextResponse } from 'next/server';

// Mock de NodeCache
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
  AuthFetchUserAttributesServer: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn(),
    next: jest.fn(),
  },
}));

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

  const mockUserAttributes = {
    'custom:plan': 'Royal',
    email: 'test@example.com',
    nickname: 'Test User',
  };

  const expectedSession = {
    tokens: {
      idToken: {
        payload: {
          'cognito:username': 'testuser',
          'custom:plan': 'Royal',
          email: 'test@example.com',
          nickname: 'Test User',
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    clearAllSessionCache();

    mockRequest = {
      url: 'http://localhost:3000/test',
      headers: {
        get: jest.fn().mockReturnValue('CognitoIdentityServiceProvider.abc123def456=testuser; other=cookie'),
      },
    } as unknown as NextRequest;

    mockResponse = {} as NextResponse;
  });

  describe('Funcionalidad básica', () => {
    it('debe fetchear una nueva sesión correctamente', async () => {
      const mockAuthGetCurrentUserServer = AuthGetCurrentUserServer as jest.Mock;
      const mockAuthFetchUserAttributesServer = AuthFetchUserAttributesServer as jest.Mock;

      mockAuthGetCurrentUserServer.mockResolvedValueOnce(mockUser);
      mockAuthFetchUserAttributesServer.mockResolvedValueOnce(mockUserAttributes);

      const result = await getSession(mockRequest, mockResponse);

      expect(mockAuthGetCurrentUserServer).toHaveBeenCalled();
      expect(mockAuthFetchUserAttributesServer).toHaveBeenCalled();
      expect(result).toEqual(expectedSession);
    });

    it('debe retornar null cuando no hay usuario autenticado', async () => {
      const mockAuthGetCurrentUserServer = AuthGetCurrentUserServer as jest.Mock;
      const mockAuthFetchUserAttributesServer = AuthFetchUserAttributesServer as jest.Mock;

      mockAuthGetCurrentUserServer.mockResolvedValueOnce(null);
      mockAuthFetchUserAttributesServer.mockResolvedValueOnce(null);

      const result = await getSession(mockRequest, mockResponse);

      expect(mockAuthGetCurrentUserServer).toHaveBeenCalled();
      expect(mockAuthFetchUserAttributesServer).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
