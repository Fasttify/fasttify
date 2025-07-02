import { useState } from 'react';
import { post } from 'aws-amplify/api';

/**
 * Hook personalizado para descifrar claves API usando la Lambda de encriptación.
 * Realiza una petición a la API para descifrar las claves cuando se necesitan usar.
 *
 * @returns {Object} Un objeto con las siguientes propiedades:
 * - decryptApiKey: Función para descifrar una clave API
 * - isDecrypting: Estado que indica si se está realizando el descifrado
 * - decryptedKey: La clave descifrada resultante
 */
export function useApiKeyDecryption() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null);

  /**
   * Descifra una clave API usando la Lambda.
   * @param {string} encryptedKey - La clave API cifrada
   * @returns {Promise<string | null>} La clave descifrada o null si hay error
   */
  const decryptApiKey = async (encryptedKey: string): Promise<string | null> => {
    if (!encryptedKey) return null;

    setIsDecrypting(true);
    setDecryptedKey(null);

    try {
      const payload = {
        operation: 'decrypt',
        encryptedKey,
      };

      const response = await post({
        apiName: 'ApiKeyManagerApi',
        path: 'api-keys',
        options: {
          body: payload,
        },
      });

      const { body } = await response.response;
      const result = (await body.json()) as { success: boolean; decryptedKey: string };

      if (result.success && result.decryptedKey) {
        setDecryptedKey(result.decryptedKey);
        return result.decryptedKey;
      }

      return null;
    } catch (error) {
      console.error('Error decrypting API key:', error);
      return null;
    } finally {
      setIsDecrypting(false);
    }
  };

  return { decryptApiKey, isDecrypting, decryptedKey };
}
