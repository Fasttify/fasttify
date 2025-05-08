import { useState } from 'react'
import { post } from 'aws-amplify/api'

/**
 * Hook personalizado para encriptar claves API usando la Lambda de encriptación.
 * Realiza una petición a la API para cifrar las claves antes de guardarlas.
 *
 * @returns {Object} Un objeto con las siguientes propiedades:
 * - encryptApiKey: Función para encriptar una clave API
 * - isEncrypting: Estado que indica si se está realizando la encriptación
 * - encryptedKey: La clave encriptada resultante
 */
export function useApiKeyEncryption() {
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [encryptedKey, setEncryptedKey] = useState<string | null>(null)

  /**
   * Encripta una clave API usando la Lambda.
   * @param {string} apiKey - La clave API a encriptar
   * @param {string} keyType - El tipo de clave (wompi, mercadopago, etc.)
   * @param {string} keyField - El campo específico (publicKey, signature, etc.)
   * @param {string} storeId - ID de la tienda (opcional)
   * @returns {Promise<string | null>} La clave encriptada o null si hay error
   */
  const encryptApiKey = async (
    apiKey: string,
    keyType: string,
    keyField?: string,
    storeId?: string
  ): Promise<string | null> => {
    if (!apiKey || !keyType) return null

    setIsEncrypting(true)
    setEncryptedKey(null)

    try {
      const payload = {
        apiKey,
        keyType,
        ...(keyField && { keyField }),
        ...(storeId && { storeId }),
      }

      const response = await post({
        apiName: 'ApiKeyManagerApi',
        path: 'api-keys',
        options: {
          body: payload,
        },
      })

      const { body } = await response.response
      const result = (await body.json()) as { success: boolean; encryptedKey: string }

      if (result.success && result.encryptedKey) {
        setEncryptedKey(result.encryptedKey)
        return result.encryptedKey
      }

      return null
    } catch (error) {
      console.error('Error encriptando clave API:', error)
      return null
    } finally {
      setIsEncrypting(false)
    }
  }

  return { encryptApiKey, isEncrypting, encryptedKey }
}
