import { useState, useCallback } from 'react';
import { updateUserAttributes } from 'aws-amplify/auth';
import { useAuth } from '@/context/hooks/useAuth';

/**
 * Hook personalizado para la gestión del perfil de usuario
 *
 * @returns {Object} Objeto con funciones y estado para gestionar el perfil
 */
export function useProfileManagement() {
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Actualiza el nickname del usuario
   *
   * @param {string} nickname - Nuevo nickname
   */
  const updateNickname = useCallback(
    async (nickname: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await updateUserAttributes({
          userAttributes: {
            nickname,
          },
        });

        await refreshUser();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al actualizar el nombre');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshUser]
  );

  /**
   * Actualiza el teléfono del usuario
   *
   * @param {string} phone - Nuevo teléfono
   */
  const updatePhone = useCallback(
    async (phone: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await updateUserAttributes({
          userAttributes: {
            'custom:phone': phone,
          },
        });

        await refreshUser();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al actualizar el teléfono');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshUser]
  );

  /**
   * Actualiza la biografía del usuario
   *
   * @param {string} bio - Nueva biografía
   */
  const updateBio = useCallback(
    async (bio: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await updateUserAttributes({
          userAttributes: {
            'custom:bio': bio,
          },
        });

        await refreshUser();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al actualizar la biografía');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshUser]
  );

  /**
   * Actualiza múltiples atributos del usuario de una vez
   *
   * @param {Object} attributes - Objeto con los atributos a actualizar
   */
  const updateMultipleAttributes = useCallback(
    async (attributes: { nickname?: string; phone?: string; bio?: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        const userAttributes: Record<string, string> = {};

        if (attributes.nickname) {
          userAttributes.nickname = attributes.nickname;
        }

        if (attributes.phone) {
          userAttributes['custom:phone'] = attributes.phone;
        }

        if (attributes.bio) {
          userAttributes['custom:bio'] = attributes.bio;
        }

        await updateUserAttributes({ userAttributes });
        await refreshUser();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al actualizar el perfil');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshUser]
  );

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateNickname,
    updatePhone,
    updateBio,
    updateMultipleAttributes,
    isLoading,
    error,
    clearError,
  };
}
