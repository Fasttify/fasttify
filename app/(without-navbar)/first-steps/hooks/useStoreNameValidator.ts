import { useState } from 'react'
import { get } from 'aws-amplify/api'

/**
 * Hook personalizado para validar la disponibilidad del nombre de una tienda.
 * Realiza una petición a la API para verificar si el nombre ya está en uso.
 *
 * @returns {Object} Un objeto con las siguientes propiedades:
 * - checkStoreName: Función para validar el nombre de la tienda
 * - isChecking: Estado que indica si se está realizando la validación
 * - exists: Estado que indica si el nombre ya existe
 *
 * @example
 * ```tsx
 * const { checkStoreName, isChecking, exists } = useStoreNameValidator()
 *
 * // Verificar un nombre de tienda
 * await checkStoreName('Mi Tienda')
 *
 * if (exists) {
 *   console.log('El nombre ya está en uso')
 * }
 * ```
 */
export function useStoreNameValidator() {
  const [isChecking, setIsChecking] = useState(false)
  const [exists, setExists] = useState(false)

  /**
   * Verifica si un nombre de tienda está disponible.
   * @param {string} name - El nombre de la tienda a verificar
   * @returns {Promise<void>}
   */
  const checkStoreName = async (name: string) => {
    if (!name) return
    setIsChecking(true)
    try {
      const response = await get({
        apiName: 'CheckStoreNameApi',
        path: 'check-store-name',
        options: {
          queryParams: {
            storeName: name,
          },
        },
      })

      const { body } = await response.response
      const responseExistStore = (await body.json()) as { exists: boolean }

      setExists(responseExistStore?.exists)
    } catch (error) {
      console.error('Error checking store name:', error)
    } finally {
      setIsChecking(false)
    }
  }

  return { checkStoreName, isChecking, exists }
}
