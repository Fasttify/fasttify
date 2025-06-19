import { cookiesClient } from '@/utils/AmplifyServer'
import { cacheManager } from '@/renderer-engine/services/core/cache-manager'

export class TemplateFetcher {
  /**
   * Obtiene los datos del template de la tienda
   */
  public async getStoreTemplateData(storeId: string): Promise<any> {
    try {
      const cacheKey = `template_${storeId}`

      // Verificar caché
      const cached = cacheManager.getCached(cacheKey)
      if (cached) {
        return cached
      }

      // Obtener template desde Amplify
      const { data: storeTemplate } = await cookiesClient.models.StoreTemplate.get({
        storeId: storeId,
      })

      // Verificaciones básicas
      if (!storeTemplate || !storeTemplate.isActive) {
        throw new Error(`No active template found for store: ${storeId}`)
      }

      // Parsear los datos del template
      const templateData = JSON.parse(storeTemplate.templateData as string)

      // Guardar en caché
      cacheManager.setCached(cacheKey, templateData, cacheManager.STORE_CACHE_TTL)

      return templateData
    } catch (error) {
      console.error(`Error fetching store template for store ${storeId}:`, error)

      // En lugar de lanzar un error complejo, lanzamos un error simple
      throw new Error(`Failed to fetch store template for store: ${storeId}`)
    }
  }
}

export const templateFetcher = new TemplateFetcher()
