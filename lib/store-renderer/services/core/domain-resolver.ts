import { cookiesClient } from '@/utils/AmplifyServer'
import type { DomainResolution, Store, TemplateError } from '../../types'

interface DomainCache {
  [domain: string]: {
    data: DomainResolution | null
    timestamp: number
    ttl: number
  }
}

class DomainResolver {
  private static instance: DomainResolver
  private cache: DomainCache = {}
  private readonly CACHE_TTL = 30 * 60 * 1000 // 30 minutos en ms

  private constructor() {}

  public static getInstance(): DomainResolver {
    if (!DomainResolver.instance) {
      DomainResolver.instance = new DomainResolver()
    }
    return DomainResolver.instance
  }

  /**
   * Resuelve un dominio a información de tienda
   * @param domain - El dominio completo (ej: "usuario.fasttify.com")
   * @returns DomainResolution o null si no se encuentra
   */
  public async resolveDomain(domain: string): Promise<DomainResolution | null> {
    try {
      // Verificar caché primero
      const cached = this.getCached(domain)
      if (cached !== undefined) {
        return cached
      }

      // Buscar en Amplify por customDomain
      const { data: stores } = await cookiesClient.models.UserStore.listUserStoreByCustomDomain({
        customDomain: domain,
      })

      if (!stores || stores.length === 0) {
        // Cachear resultado negativo por menos tiempo (5 minutos)
        this.setCached(domain, null, 5 * 60 * 1000)
        return null
      }

      const store = stores[0] // Debería ser único por dominio
      const resolution: DomainResolution = {
        storeId: store.storeId,
        storeName: store.storeName,
        customDomain: store.customDomain || '',
        isActive: store.onboardingCompleted && store.storeStatus !== 'inactive',
      }

      // Cachear resultado positivo
      this.setCached(domain, resolution, this.CACHE_TTL)
      return resolution
    } catch (error) {
      console.error(`Error resolving domain ${domain}:`, error)

      return null
    }
  }

  /**
   * Obtiene la información completa de la tienda por storeId
   * @param storeId - ID de la tienda
   * @returns Store o null si no se encuentra
   */
  public async getStoreById(storeId: string): Promise<Store | null> {
    try {
      const { data: store } = await cookiesClient.models.UserStore.get({
        storeId: storeId,
      })

      if (!store) {
        return null
      }

      return store as Store
    } catch (error) {
      console.error(`Error fetching store ${storeId}:`, error)

      return null
    }
  }

  /**
   * Resuelve un dominio completo: busca y retorna información completa de la tienda
   * @param domain - El dominio completo
   * @returns Store completa o lanza error
   */
  public async resolveStoreByDomain(domain: string): Promise<Store> {
    const resolution = await this.resolveDomain(domain)

    if (!resolution) {
      const error: TemplateError = {
        type: 'STORE_NOT_FOUND',
        message: `No store found for domain: ${domain}`,
        statusCode: 404,
      }
      throw error
    }

    if (!resolution.isActive) {
      const error: TemplateError = {
        type: 'STORE_NOT_FOUND',
        message: `Store is not active for domain: ${domain}`,
        statusCode: 503,
      }
      throw error
    }

    const store = await this.getStoreById(resolution.storeId)

    if (!store) {
      const error: TemplateError = {
        type: 'DATA_ERROR',
        message: `Store data not found for ID: ${resolution.storeId}`,
        statusCode: 500,
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
    delete this.cache[domain]
  }

  /**
   * Limpia todo el caché
   */
  public clearCache(): void {
    this.cache = {}
  }

  /**
   * Limpia entradas expiradas del caché
   */
  public cleanExpiredCache(): void {
    const now = Date.now()
    Object.keys(this.cache).forEach(domain => {
      const entry = this.cache[domain]
      if (now > entry.timestamp + entry.ttl) {
        delete this.cache[domain]
      }
    })
  }

  /**
   * Obtiene una entrada del caché si existe y no ha expirado
   */
  private getCached(domain: string): DomainResolution | null | undefined {
    const entry = this.cache[domain]
    if (!entry) {
      return undefined
    }

    const now = Date.now()
    if (now > entry.timestamp + entry.ttl) {
      delete this.cache[domain]
      return undefined
    }

    return entry.data
  }

  /**
   * Guarda una entrada en el caché
   */
  private setCached(domain: string, data: DomainResolution | null, ttl: number): void {
    this.cache[domain] = {
      data,
      timestamp: Date.now(),
      ttl,
    }
  }

  /**
   * Obtiene estadísticas del caché para debugging
   */
  public getCacheStats(): { total: number; expired: number; active: number } {
    const now = Date.now()
    let total = 0
    let expired = 0
    let active = 0

    Object.values(this.cache).forEach(entry => {
      total++
      if (now > entry.timestamp + entry.ttl) {
        expired++
      } else {
        active++
      }
    })

    return { total, expired, active }
  }
}

// Export singleton instance
export const domainResolver = DomainResolver.getInstance()

// Export class for testing
export { DomainResolver }
