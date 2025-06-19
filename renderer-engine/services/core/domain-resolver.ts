import { cookiesClient } from '@/utils/AmplifyServer'
import type { Store, TemplateError } from '@/renderer-engine/types'
import { cacheManager } from '@/renderer-engine/services/core/cache-manager'

class DomainResolver {
  private static instance: DomainResolver

  private constructor() {}

  public static getInstance(): DomainResolver {
    if (!DomainResolver.instance) {
      DomainResolver.instance = new DomainResolver()
    }
    return DomainResolver.instance
  }

  /**
   * Resuelve un dominio a información completa de tienda
   * @param domain - El dominio completo (ej: "usuario.fasttify.com")
   * @returns Store completa o null si no se encuentra
   */
  public async resolveDomain(domain: string): Promise<Store | null> {
    try {
      // Verificar caché primero
      const cacheKey = `domain_${domain}`
      const cached = cacheManager.getCached(cacheKey)
      if (cached !== null) {
        return cached
      }

      // Buscar en Amplify por customDomain
      const { data: stores } = await cookiesClient.models.UserStore.listUserStoreByCustomDomain({
        customDomain: domain,
      })

      if (!stores || stores.length === 0) {
        // Cachear resultado negativo por menos tiempo (5 minutos)
        cacheManager.setCached(cacheKey, null, 5 * 60 * 1000)
        return null
      }

      const store = stores[0] as Store // Debería ser único por dominio

      // Cachear resultado positivo
      cacheManager.setCached(cacheKey, store, cacheManager.DOMAIN_CACHE_TTL)
      return store
    } catch (error) {
      console.error(`Error resolving domain ${domain}:`, error)

      return null
    }
  }

  /**
   * Resuelve un dominio completo: busca y retorna información completa de la tienda
   * @param domain - El dominio completo
   * @returns Store completa o lanza error
   */
  public async resolveStoreByDomain(domain: string): Promise<Store> {
    const store = await this.resolveDomain(domain)

    if (!store) {
      const error: TemplateError = {
        type: 'STORE_NOT_FOUND',
        message: `No store found for domain: ${domain}`,
        statusCode: 404,
      }
      throw error
    }

    const isActive = store.onboardingCompleted && store.storeStatus !== 'inactive'
    if (!isActive) {
      const error: TemplateError = {
        type: 'STORE_NOT_FOUND',
        message: `Store is not active for domain: ${domain}`,
        statusCode: 503,
      }
      throw error
    }

    return store
  }

  /**
   * Invalida el caché para un dominio específico
   * @param domain - Dominio a invalidar
   */
  public invalidateCache(domain: string): void {
    cacheManager.invalidateDomainCache(domain)
  }

  /**
   * Limpia todo el caché
   */
  public clearCache(): void {
    cacheManager.clearCache()
  }

  /**
   * Limpia entradas expiradas del caché
   */
  public cleanExpiredCache(): void {
    cacheManager.cleanExpiredCache()
  }

  /**
   * Obtiene estadísticas del caché para debugging
   */
  public getCacheStats(): { total: number; expired: number; active: number } {
    return cacheManager.getCacheStats()
  }
}

// Export singleton instance
export const domainResolver = DomainResolver.getInstance()

// Export class for testing
export { DomainResolver }
