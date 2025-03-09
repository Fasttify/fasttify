import { useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'

// Generamos el cliente a partir del schema definido en el backend
const client = generateClient<Schema>()

// Definición del input para UserStore
export interface UserStoreInput {
  userId: string // ID del usuario (dueño de la tienda)
  storeId: string // ID único de la tienda
  storeName: string // Nombre de la tienda
  storeDescription?: string // Descripción opcional
  storeCurrency?: string // Moneda de la tienda
  storeLogo?: string // URL de la imagen del logo
  storeTheme?: string // Tema de la tienda (opcional)
  storeBanner?: string // URL de la imagen del banner
  storeType?: string // Tipo de tienda
  storeStatus?: string // Estado de la tienda
  storePolicy?: string // Política de la tienda
  storeAdress?: string // Dirección de la tienda
  contactEmail?: string
  contactPhone?: string
  contactName?: string
  contactIdentification?: string
  contactIdentificationType?: string
  wompiConfig?: any // Configuración de wonpi en formato JSON
  mercadoPagoConfig?: any // Configuración de mercado pago en formato JSON
  customDomain?: string // Dominio propio a asignar (opcional)
  onboardingCompleted: boolean
}

// Definimos el tipo de autorización a usar
export interface AuthMode {
  authMode: 'userPool'
}

// Tipo para pasarelas de pago
export type PaymentGatewayType = 'mercadoPago' | 'wompi'

// Tipo para configuración de pasarela
export interface PaymentGatewayConfig {
  publicKey: string
  privateKey: string
  isActive: boolean
  createdAt: string
}

// Valor por defecto de autorización
const defaultAuth: AuthMode = { authMode: 'userPool' }

export const useUserStoreData = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(null)

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
   * Obtiene el ID del registro y la información de pasarelas de pago configuradas
   * para una tienda específica.
   */
  const getStorePaymentInfo = async (
    storeId: string,
    auth: AuthMode = defaultAuth
  ): Promise<{
    id: string | null
    configuredGateways: PaymentGatewayType[]
  }> => {
    try {
      setLoading(true)
      setError(null)

      const result = await client.models.UserStore.list({
        filter: { storeId: { eq: storeId } },
        selectionSet: ['id', 'wompiConfig', 'mercadoPagoConfig'],
        authMode: auth.authMode,
      })

      if (result.errors && result.errors.length > 0) {
        setError(result.errors)
        return { id: null, configuredGateways: [] }
      }

      if (result.data && result.data.length > 0) {
        const store = result.data[0]
        const configuredGateways: PaymentGatewayType[] = []

        if (store.wompiConfig) configuredGateways.push('wompi')
        if (store.mercadoPagoConfig) configuredGateways.push('mercadoPago')

        return {
          id: store.id,
          configuredGateways,
        }
      }

      return { id: null, configuredGateways: [] }
    } catch (err) {
      setError(err)
      return { id: null, configuredGateways: [] }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Configura una pasarela de pago para una tienda específica.
   */
  const configurePaymentGateway = async (
    storeRecordId: string,
    gateway: PaymentGatewayType,
    config: any,
    convertToJson: boolean = false,
    auth: AuthMode = defaultAuth
  ): Promise<boolean> => {
    if (!storeRecordId) {
      setError('ID de registro no proporcionado')
      return false
    }

    // Convertir a JSON si es necesario
    const configValue = convertToJson ? JSON.stringify(config) : config

    const updatePayload = {
      id: storeRecordId,
      ...(gateway === 'mercadoPago'
        ? { mercadoPagoConfig: configValue }
        : { wompiConfig: configValue }),
    }

    const result = await performOperation(() => client.models.UserStore.update(updatePayload, auth))

    return result !== null
  }

  /**
   * Crea una tienda (UserStore) en la base de datos.
   */
  const createUserStore = async (storeInput: UserStoreInput, auth: AuthMode = defaultAuth) => {
    return performOperation(() => client.models.UserStore.create(storeInput, auth))
  }

  /**
   * Actualiza los datos de una tienda.
   */
  const updateUserStore = async (
    storeInput: Partial<UserStoreInput> & { id: string },
    auth: AuthMode = defaultAuth
  ) => {
    return performOperation(() => client.models.UserStore.update(storeInput, auth))
  }

  /**
   * Elimina una tienda a partir de su 'id'.
   */
  const deleteUserStore = async (id: string, auth: AuthMode = defaultAuth) => {
    return performOperation(() => client.models.UserStore.delete({ id }, auth))
  }

  return {
    loading,
    error,
    createUserStore,
    updateUserStore,
    deleteUserStore,
    getStorePaymentInfo,
    configurePaymentGateway,
  }
}
