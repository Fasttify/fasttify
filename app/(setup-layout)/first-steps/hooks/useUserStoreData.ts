import { useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'
import useUserStore from '@/context/core/userStore'

const client = generateClient<Schema>({
  authMode: 'userPool',
})

// Definición del input para UserStore
export type UserStore = Schema['UserStore']['type']

// Tipo para pasarelas de pago
export type PaymentGatewayType = 'mercadoPago' | 'wompi'

// Tipo para configuración de pasarela
export interface PaymentGatewayConfig {
  publicKey: string
  privateKey: string
  isActive: boolean
  createdAt: string
}

export const useUserStoreData = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(null)
  const { user } = useUserStore()

  /**
   * Función auxiliar que ejecuta una operación y gestiona loading y error.
   */
  const performOperation = async <T>(
    operation: () => Promise<{ data: T; errors?: any[] }>
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await operation()
      if (result.errors && result.errors.length > 0) {
        setError(result.errors)
        return null
      }
      return result.data
    } catch (err) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtiene la información de pasarelas de pago configuradas
   * para una tienda específica sin traer datos sensibles.
   * @param storeId - ID único de la tienda
   * @returns Array de pasarelas configuradas
   */
  const getStorePaymentInfo = async (
    storeId: string
  ): Promise<{
    configuredGateways: PaymentGatewayType[]
  }> => {
    try {
      setLoading(true)
      setError(null)

      if (!user?.userId) {
        setError('User not authenticated')
        return { configuredGateways: [] }
      }

      const configuredGateways: PaymentGatewayType[] = []

      // Verificamos si existe configuración de Wompi
      const wompiResult = await client.models.UserStore.listUserStoreByUserId(
        {
          userId: user.userId,
        },
        {
          filter: {
            storeId: { eq: storeId },
            wompiConfig: { attributeExists: true },
          },
          selectionSet: ['storeId'],
        }
      )

      // Verificamos si existe configuración de MercadoPago
      const mercadoPagoResult = await client.models.UserStore.listUserStoreByUserId(
        {
          userId: user.userId,
        },
        {
          filter: {
            storeId: { eq: storeId },
            mercadoPagoConfig: { attributeExists: true },
          },
          selectionSet: ['storeId'],
        }
      )

      // Agregamos las pasarelas configuradas al array
      if (wompiResult.data && wompiResult.data.length > 0) {
        configuredGateways.push('wompi')
      }

      if (mercadoPagoResult.data && mercadoPagoResult.data.length > 0) {
        configuredGateways.push('mercadoPago')
      }

      return {
        configuredGateways,
      }
    } catch (err) {
      setError(err)
      return { configuredGateways: [] }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Configura una pasarela de pago para una tienda específica.
   */
  const configurePaymentGateway = async (
    storeId: string,
    gateway: PaymentGatewayType,
    config: any,
    convertToJson: boolean = false
  ): Promise<boolean> => {
    if (!storeId || !user?.userId) {
      setError('Store ID or User ID not provided')
      return false
    }

    try {
      // Primero obtenemos el registro existente
      const existingStoreResult = await client.models.UserStore.listUserStoreByUserId(
        {
          userId: user.userId,
        },
        {
          filter: {
            storeId: { eq: storeId },
          },
          selectionSet: ['storeId'],
        }
      )

      if (!existingStoreResult.data || existingStoreResult.data.length === 0) {
        setError('Store not found')
        return false
      }

      // Convertir a JSON si es necesario
      const configValue = convertToJson ? JSON.stringify(config) : config

      // El payload de update NO debe incluir el identificador (storeId)
      // Solo los campos que queremos actualizar
      const updatePayload = {
        ...(gateway === 'mercadoPago'
          ? { mercadoPagoConfig: configValue }
          : { wompiConfig: configValue }),
      }

      // Para el update, necesitamos pasar el identificador por separado
      const result = await performOperation(() =>
        client.models.UserStore.update({
          storeId: storeId, // Este es el identificador
          ...updatePayload, // Estos son los campos a actualizar
        })
      )

      return result !== null
    } catch (err) {
      setError(err)
      return false
    }
  }

  /**
   * Crea una tienda (UserStore) en la base de datos.
   */
  const createUserStore = async (
    storeInput: Omit<Schema['UserStore']['type'], 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    return performOperation(() => client.models.UserStore.create(storeInput))
  }

  /**
   * Actualiza los datos de una tienda.
   */
  const updateUserStore = async (
    storeInput: Omit<Partial<UserStore>, 'id' | 'createdAt' | 'updatedAt'> & { storeId: string }
  ) => {
    return performOperation(() => client.models.UserStore.update(storeInput))
  }

  /**
   * Elimina una tienda a partir de su 'storeId'.
   */
  const deleteUserStore = async (storeId: string) => {
    return performOperation(() => client.models.UserStore.delete({ storeId }))
  }

  /**
   * Inicializa el template y datos por defecto para una nueva tienda.
   * Crea las secciones por defecto, colecciones base y configuración inicial.
   */
  const initializeStoreTemplate = async (storeId: string, domain: string) => {
    if (!storeId || !domain) {
      setError('Store ID and domain are required')
      return null
    }

    return performOperation(() =>
      client.mutations.initializeStoreTemplate({
        storeId,
        domain,
      })
    )
  }

  /**
   * Función completa para crear una tienda con todos sus datos iniciales.
   * Crea la tienda y luego inicializa su template automáticamente.
   */
  const createStoreWithTemplate = async (
    storeInput: Omit<Schema['UserStore']['type'], 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      setLoading(true)
      setError(null)

      // Primero crear la tienda
      const storeResult = await performOperation(() => client.models.UserStore.create(storeInput))

      if (!storeResult) {
        throw new Error('Failed to create store')
      }

      // Luego inicializar el template con los datos por defecto
      const templateResult = await initializeStoreTemplate(
        storeInput.storeId,
        storeInput.customDomain || storeInput.storeName
      )

      return {
        store: storeResult,
        template: templateResult,
        success: true,
      }
    } catch (err) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createUserStore,
    updateUserStore,
    deleteUserStore,
    getStorePaymentInfo,
    configurePaymentGateway,
    initializeStoreTemplate,
    createStoreWithTemplate,
  }
}
