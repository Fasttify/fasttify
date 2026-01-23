import { useState, useCallback } from 'react';
import { get } from 'aws-amplify/api';

/**
 * Hook personalizado para validar la disponibilidad de un dominio.
 * Realiza una petición a la API para verificar si el dominio ya está en uso.
 *
 * @returns {Object} Un objeto con las siguientes propiedades:
 * - checkDomain: Función para validar la disponibilidad del dominio
 * - isChecking: Estado que indica si se está realizando la validación
 * - exists: Estado que indica si el dominio ya existe
 */
export function useDomainValidator() {
  const [isChecking, setIsChecking] = useState(false);
  const [exists, setExists] = useState(false);

  /**
   * Verifica si un dominio está disponible.
   * @param {string} domain - El nombre del dominio a verificar (sin el .fasttify.com)
   * @returns {Promise<void>}
   */
  const checkDomain = useCallback(async (domain: string) => {
    if (!domain) return;
    setIsChecking(true);

    try {
      // Usar el nombre correcto de la API según backend.ts
      const response = await get({
        apiName: 'CheckStoreDomainApi',
        path: 'check-store-domain',
        options: {
          queryParams: {
            domainName: `${domain}.fasttify.com`, // Añadir el sufijo .fasttify.com
          },
        },
      });

      const { body } = await response.response;
      const responseDomainCheck = (await body.json()) as { exists: boolean; available: boolean };

      setExists(responseDomainCheck?.exists || false);
    } catch (error) {
      console.error('Error checking domain availability:', error);
      // En caso de error, asumimos que el dominio no existe para evitar bloquear al usuario
      setExists(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { checkDomain, isChecking, exists };
}
