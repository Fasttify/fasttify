import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';

// Mock de los middlewares específicos
jest.mock('@/middlewares/auth/auth', () => ({
  handleAuthenticationMiddleware: jest.fn(),
  handleAuthenticatedRedirectMiddleware: jest.fn(),
}));

jest.mock('@/middlewares/store-access/store', () => ({
  handleStoreMiddleware: jest.fn(),
}));

jest.mock('@/middlewares/store-access/storeAccess', () => ({
  handleStoreAccessMiddleware: jest.fn(),
}));

jest.mock('@/middlewares/ownership/productOwnership', () => ({
  handleProductOwnershipMiddleware: jest.fn(),
}));

jest.mock('@/middlewares/ownership/collectionOwnership', () => ({
  handleCollectionOwnershipMiddleware: jest.fn(),
}));

jest.mock('@/middlewares/ownership/pagesOwnership', () => ({
  handlePagesOwnershipMiddleware: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn(),
    next: jest.fn(),
    rewrite: jest.fn(),
  },
}));

describe('Main Middleware Security Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Subdomain Security Validation', () => {
    it('should treat non-fasttify domains as custom domains in production', async () => {
      process.env.APP_ENV = 'production';

      const customDomainRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
            searchParams: {
              set: jest.fn(),
            },
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('mitienda.com'),
        },
      } as unknown as NextRequest;

      const mockRewrite = jest.fn().mockReturnValue({ type: 'rewrite' });
      const mockNextResponse = NextResponse.rewrite as jest.Mock;
      mockNextResponse.mockReturnValue(mockRewrite());

      const result = await middleware(customDomainRequest);

      // Debería reescribir la URL porque es un dominio personalizado válido
      expect(NextResponse.rewrite).toHaveBeenCalled();
      expect(result).toEqual({ type: 'rewrite' });
    });

    it('should treat non-localhost domains as custom domains in development', async () => {
      process.env.APP_ENV = 'development';

      const customDomainRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
            searchParams: {
              set: jest.fn(),
            },
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('mitienda.dev'),
        },
      } as unknown as NextRequest;

      const mockRewrite = jest.fn().mockReturnValue({ type: 'rewrite' });
      const mockNextResponse = NextResponse.rewrite as jest.Mock;
      mockNextResponse.mockReturnValue(mockRewrite());

      const result = await middleware(customDomainRequest);

      // Debería reescribir la URL porque es un dominio personalizado válido
      expect(NextResponse.rewrite).toHaveBeenCalled();
      expect(result).toEqual({ type: 'rewrite' });
    });

    it('should accept valid subdomain in production', async () => {
      process.env.APP_ENV = 'production';

      const validRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
            searchParams: {
              set: jest.fn(),
            },
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('tienda.fasttify.com'),
        },
      } as unknown as NextRequest;

      const mockRewrite = jest.fn().mockReturnValue({ type: 'rewrite' });
      const mockNextResponse = NextResponse.rewrite as jest.Mock;
      mockNextResponse.mockReturnValue(mockRewrite());

      const result = await middleware(validRequest);

      // Debería reescribir la URL porque es un dominio válido
      expect(NextResponse.rewrite).toHaveBeenCalled();
      expect(result).toEqual({ type: 'rewrite' });
    });

    it('should accept valid subdomain in development', async () => {
      process.env.APP_ENV = 'development';

      const validRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
            searchParams: {
              set: jest.fn(),
            },
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('tienda.localhost:3000'),
        },
      } as unknown as NextRequest;

      const mockRewrite = jest.fn().mockReturnValue({ type: 'rewrite' });
      const mockNextResponse = NextResponse.rewrite as jest.Mock;
      mockNextResponse.mockReturnValue(mockRewrite());

      const result = await middleware(validRequest);

      // Debería reescribir la URL porque es un dominio válido
      expect(NextResponse.rewrite).toHaveBeenCalled();
      expect(result).toEqual({ type: 'rewrite' });
    });

    it('should reject domain with multiple subdomains', async () => {
      process.env.APP_ENV = 'production';

      const multiSubdomainRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('evil.malicious.fasttify.com'),
        },
      } as unknown as NextRequest;

      const mockNext = jest.fn().mockReturnValue({ type: 'next' });
      const mockNextResponse = NextResponse.next as jest.Mock;
      mockNextResponse.mockReturnValue(mockNext());

      const result = await middleware(multiSubdomainRequest);

      // No debería reescribir porque tiene múltiples subdominios (no es válido)
      expect(NextResponse.rewrite).not.toHaveBeenCalled();
      expect(result).toEqual({ type: 'next' });
    });

    it('should handle main domain correctly in production', async () => {
      process.env.APP_ENV = 'production';

      const mainDomainRequest = {
        nextUrl: {
          pathname: '/account-settings',
          clone: () => ({
            pathname: '/account-settings',
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('fasttify.com'),
        },
      } as unknown as NextRequest;

      const { handleAuthenticationMiddleware } = require('@/middlewares/auth/auth');
      handleAuthenticationMiddleware.mockReturnValue({ type: 'auth' });

      const result = await middleware(mainDomainRequest);

      // Debería ejecutar el middleware de autenticación para el dominio principal
      expect(handleAuthenticationMiddleware).toHaveBeenCalled();
      expect(result).toEqual({ type: 'auth' });
    });

    it('should handle main domain correctly in development', async () => {
      process.env.APP_ENV = 'development';

      const mainDomainRequest = {
        nextUrl: {
          pathname: '/account-settings',
          clone: () => ({
            pathname: '/account-settings',
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('localhost:3000'),
        },
      } as unknown as NextRequest;

      const { handleAuthenticationMiddleware } = require('@/middlewares/auth/auth');
      handleAuthenticationMiddleware.mockReturnValue({ type: 'auth' });

      const result = await middleware(mainDomainRequest);

      // Debería ejecutar el middleware de autenticación para el dominio principal
      expect(handleAuthenticationMiddleware).toHaveBeenCalled();
      expect(result).toEqual({ type: 'auth' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty hostname', async () => {
      const emptyHostRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
            searchParams: {
              set: jest.fn(),
            },
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue(''),
        },
      } as unknown as NextRequest;

      const mockRewrite = jest.fn().mockReturnValue({ type: 'rewrite' });
      const mockNextResponse = NextResponse.rewrite as jest.Mock;
      mockNextResponse.mockReturnValue(mockRewrite());

      const result = await middleware(emptyHostRequest);

      // Hostname vacío se trata como dominio personalizado
      expect(result).toEqual({ type: 'rewrite' });
    });

    it('should handle hostname with port correctly', async () => {
      process.env.APP_ENV = 'development';

      const portRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
            searchParams: {
              set: jest.fn(),
            },
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('tienda.localhost:3000'),
        },
      } as unknown as NextRequest;

      const mockRewrite = jest.fn().mockReturnValue({ type: 'rewrite' });
      const mockNextResponse = NextResponse.rewrite as jest.Mock;
      mockNextResponse.mockReturnValue(mockRewrite());

      const result = await middleware(portRequest);

      expect(NextResponse.rewrite).toHaveBeenCalled();
      expect(result).toEqual({ type: 'rewrite' });
    });

    it('should properly validate fasttify.com domains', async () => {
      process.env.APP_ENV = 'production';

      // Test que fasttify.com.evil.com NO se detecte como fasttify domain
      const evilRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
            searchParams: {
              set: jest.fn(),
            },
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('fasttify.com.evil.com'),
        },
      } as unknown as NextRequest;

      const mockRewrite = jest.fn().mockReturnValue({ type: 'rewrite' });
      const mockNextResponse = NextResponse.rewrite as jest.Mock;
      mockNextResponse.mockReturnValue(mockRewrite());

      const result = await middleware(evilRequest);

      // Debería tratarse como dominio personalizado, no como fasttify.com
      expect(NextResponse.rewrite).toHaveBeenCalled();
      expect(result).toEqual({ type: 'rewrite' });
    });

    it('should properly validate localhost domains', async () => {
      process.env.APP_ENV = 'development';

      // Test que localhost.evil.com NO se detecte como localhost
      const evilLocalRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
            searchParams: {
              set: jest.fn(),
            },
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('localhost.evil.com'),
        },
      } as unknown as NextRequest;

      const mockRewrite = jest.fn().mockReturnValue({ type: 'rewrite' });
      const mockNextResponse = NextResponse.rewrite as jest.Mock;
      mockNextResponse.mockReturnValue(mockRewrite());

      const result = await middleware(evilLocalRequest);

      // Debería tratarse como dominio personalizado, no como localhost
      expect(NextResponse.rewrite).toHaveBeenCalled();
      expect(result).toEqual({ type: 'rewrite' });
    });
  });
});
