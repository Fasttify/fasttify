import { useCallback } from 'react'
import { post } from 'aws-amplify/api'
import useStoreDataStore from '@/context/core/storeDataStore'
import type {
  BatchDeleteResult,
  S3BatchResponse,
} from '@/app/store/components/images-selector/types/s3-types'
import { DELETE_CHUNK_SIZE } from '@/app/store/components/images-selector/types/s3-types'
import { chunkArray } from '@/app/store/components/images-selector/utils/s3-utils'

export function useS3ImageDelete() {
  const { storeId } = useStoreDataStore()

  // Función auxiliar para procesar un chunk de eliminaciones
  const processDeleteChunk = useCallback(
    async (
      keys: string[]
    ): Promise<{
      successCount: number
      failedDeletes: { key: string; error: string }[]
    }> => {
      if (!storeId) {
        return {
          successCount: 0,
          failedDeletes: keys.map(key => ({ key, error: 'Store ID not found' })),
        }
      }

      try {
        const restOperation = post({
          apiName: 'StoreImagesApi',
          path: 'store-images',
          options: {
            body: {
              action: 'batchDelete',
              storeId,
              keys,
            } as any,
          },
        })

        const { body } = await restOperation.response
        const response = (await body.json()) as S3BatchResponse

        return {
          successCount: response.successCount || 0,
          failedDeletes: response.failedKeys || [],
        }
      } catch (error) {
        console.error('Error processing delete chunk:', error)
        return {
          successCount: 0,
          failedDeletes: keys.map(key => ({ key, error: 'Delete failed' })),
        }
      }
    },
    [storeId]
  )

  /**
   * Función optimizada para eliminar múltiples imágenes usando batch delete con chunking
   */
  const deleteImages = useCallback(
    async (keys: string[]): Promise<BatchDeleteResult | null> => {
      if (!storeId || keys.length === 0) return null

      try {
        // Dividir en chunks si es necesario
        const chunks = chunkArray(keys, DELETE_CHUNK_SIZE)

        // Procesar chunks secuencialmente
        let totalSuccessCount = 0
        let allFailedDeletes: { key: string; error: string }[] = []

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i]
          const chunkResult = await processDeleteChunk(chunk)

          totalSuccessCount += chunkResult.successCount
          allFailedDeletes = [...allFailedDeletes, ...chunkResult.failedDeletes]

          // Pequeña pausa entre chunks
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50))
          }
        }

        return {
          successCount: totalSuccessCount,
          failedDeletes: allFailedDeletes,
          totalProcessed: keys.length,
        }
      } catch (err) {
        console.error('Error in batch delete:', err)
        return {
          successCount: 0,
          failedDeletes: keys.map(key => ({ key, error: 'Delete failed' })),
          totalProcessed: keys.length,
        }
      }
    },
    [storeId, processDeleteChunk]
  )

  /**
   * Función legacy para compatibilidad hacia atrás - elimina una sola imagen
   */
  const deleteImage = useCallback(
    async (key: string): Promise<boolean> => {
      const result = await deleteImages([key])
      return result ? result.successCount > 0 : false
    },
    [deleteImages]
  )

  return {
    deleteImages,
    deleteImage, // Legacy
  }
}
