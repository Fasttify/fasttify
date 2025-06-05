import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'

// Mock de los middlewares específicos
jest.mock('@/middlewares/auth/auth', () => ({
  handleAuthenticationMiddleware: jest.fn(),
  handleAuthenticatedRedirectMiddleware: jest.fn(),
}))

jest.mock('@/middlewares/store-access/store', () => ({
  handleStoreMiddleware: jest.fn(),
}))

jest.mock('@/middlewares/store-access/storeAccess', () => ({
  handleStoreAccessMiddleware: jest.fn(),
}))

jest.mock('@/middlewares/ownership/productOwnership', () => ({
  handleProductOwnershipMiddleware: jest.fn(),
}))

jest.mock('@/middlewares/ownership/collectionOwnership', () => ({
  handleCollectionOwnershipMiddleware: jest.fn(),
}))

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn(),
    next: jest.fn(),
    rewrite: jest.fn(),
  },
}))

describe('Main Middleware Security Tests', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Subdomain Security Validation', () => {
    it('should reject malicious domains that end with allowed domain in production', async () => {
      process.env.APP_ENV = 'production'

      const maliciousRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('malicious-fasttify.com'),
        },
      } as unknown as NextRequest

      const mockNext = jest.fn().mockReturnValue({ type: 'next' })
      const mockNextResponse = NextResponse.next as jest.Mock
      mockNextResponse.mockReturnValue(mockNext())

      const result = await middleware(maliciousRequest)

      // No debería reescribir la URL porque no es un dominio válido
      expect(NextResponse.rewrite).not.toHaveBeenCalled()
      expect(result).toEqual({ type: 'next' })
    })

    it('should reject malicious domains that end with allowed domain in development', async () => {
      process.env.APP_ENV = 'development'

      const maliciousRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('malicious-localhost'),
        },
      } as unknown as NextRequest

      const mockNext = jest.fn().mockReturnValue({ type: 'next' })
      const mockNextResponse = NextResponse.next as jest.Mock
      mockNextResponse.mockReturnValue(mockNext())

      const result = await middleware(maliciousRequest)

      // No debería reescribir la URL porque no es un dominio válido
      expect(NextResponse.rewrite).not.toHaveBeenCalled()
      expect(result).toEqual({ type: 'next' })
    })

    it('should accept valid subdomain in production', async () => {
      process.env.APP_ENV = 'production'

      const validRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('tienda.fasttify.com'),
        },
      } as unknown as NextRequest

      const mockRewrite = jest.fn().mockReturnValue({ type: 'rewrite' })
      const mockNextResponse = NextResponse.rewrite as jest.Mock
      mockNextResponse.mockReturnValue(mockRewrite())

      const result = await middleware(validRequest)

      // Debería reescribir la URL porque es un dominio válido
      expect(NextResponse.rewrite).toHaveBeenCalled()
      expect(result).toEqual({ type: 'rewrite' })
    })

    it('should accept valid subdomain in development', async () => {
      process.env.APP_ENV = 'development'

      const validRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('tienda.localhost:3000'),
        },
      } as unknown as NextRequest

      const mockRewrite = jest.fn().mockReturnValue({ type: 'rewrite' })
      const mockNextResponse = NextResponse.rewrite as jest.Mock
      mockNextResponse.mockReturnValue(mockRewrite())

      const result = await middleware(validRequest)

      // Debería reescribir la URL porque es un dominio válido
      expect(NextResponse.rewrite).toHaveBeenCalled()
      expect(result).toEqual({ type: 'rewrite' })
    })

    it('should reject domain with multiple malicious subdomains', async () => {
      process.env.APP_ENV = 'production'

      const maliciousRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('evil.malicious.fasttify.com'),
        },
      } as unknown as NextRequest

      const mockNext = jest.fn().mockReturnValue({ type: 'next' })
      const mockNextResponse = NextResponse.next as jest.Mock
      mockNextResponse.mockReturnValue(mockNext())

      const result = await middleware(maliciousRequest)

      // No debería reescribir porque tiene múltiples subdominios sospechosos
      expect(NextResponse.rewrite).not.toHaveBeenCalled()
      expect(result).toEqual({ type: 'next' })
    })

    it('should handle main domain correctly in production', async () => {
      process.env.APP_ENV = 'production'

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
      } as unknown as NextRequest

      const { handleAuthenticationMiddleware } = require('@/middlewares/auth/auth')
      handleAuthenticationMiddleware.mockReturnValue({ type: 'auth' })

      const result = await middleware(mainDomainRequest)

      // Debería ejecutar el middleware de autenticación para el dominio principal
      expect(handleAuthenticationMiddleware).toHaveBeenCalled()
      expect(result).toEqual({ type: 'auth' })
    })

    it('should handle main domain correctly in development', async () => {
      process.env.APP_ENV = 'development'

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
      } as unknown as NextRequest

      const { handleAuthenticationMiddleware } = require('@/middlewares/auth/auth')
      handleAuthenticationMiddleware.mockReturnValue({ type: 'auth' })

      const result = await middleware(mainDomainRequest)

      // Debería ejecutar el middleware de autenticación para el dominio principal
      expect(handleAuthenticationMiddleware).toHaveBeenCalled()
      expect(result).toEqual({ type: 'auth' })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty hostname', async () => {
      const emptyHostRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue(''),
        },
      } as unknown as NextRequest

      const mockNext = jest.fn().mockReturnValue({ type: 'next' })
      const mockNextResponse = NextResponse.next as jest.Mock
      mockNextResponse.mockReturnValue(mockNext())

      const result = await middleware(emptyHostRequest)

      expect(result).toEqual({ type: 'next' })
    })

    it('should handle hostname with port correctly', async () => {
      process.env.APP_ENV = 'development'

      const portRequest = {
        nextUrl: {
          pathname: '/',
          clone: () => ({
            pathname: '/',
          }),
        },
        headers: {
          get: jest.fn().mockReturnValue('tienda.localhost:3000'),
        },
      } as unknown as NextRequest

      const mockRewrite = jest.fn().mockReturnValue({ type: 'rewrite' })
      const mockNextResponse = NextResponse.rewrite as jest.Mock
      mockNextResponse.mockReturnValue(mockRewrite())

      const result = await middleware(portRequest)

      expect(NextResponse.rewrite).toHaveBeenCalled()
      expect(result).toEqual({ type: 'rewrite' })
    })
  })
})
