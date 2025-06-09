import { cookiesClient } from '@/utils/AmplifyServer'
import { cacheManager } from '../core/cache-manager'
import type { TemplateError } from '../../types'

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

      if (!storeTemplate) {
        throw new Error(`No template found for store: ${storeId}`)
      }

      // Parsear los datos del template
      const templateData = JSON.parse(storeTemplate.templateData as string)

      // Guardar en caché
      cacheManager.setCached(cacheKey, templateData, cacheManager.STORE_CACHE_TTL)

      return templateData
    } catch (error) {
      console.error(`Error fetching store template for store ${storeId}:`, error)

      const templateError: TemplateError = {
        type: 'DATA_ERROR',
        message: `Failed to fetch store template for store: ${storeId}`,
        details: error,
        statusCode: 500,
      }

      throw templateError
    }
  }
}

export const templateFetcher = new TemplateFetcher()
