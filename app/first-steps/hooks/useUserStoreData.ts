import { useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../../amplify/data/resource'

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
  customDomain?: string // Dominio propio a asignar (opcional)
  onboardingCompleted: boolean
}

// Definimos el tipo de autorización a usar
export interface AuthMode {
  authMode: 'userPool'
}

// Valor por defecto de autorización
const defaultAuth: AuthMode = { authMode: 'userPool' }

export const useUserStoreData = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(null)

  /**
   * Función auxiliar que ejecuta una mutación y gestiona loading y error.
   */
  const performMutation = async <T>(
    mutation: () => Promise<{ data: T; errors?: any[] }>
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await mutation()
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
   * Crea una tienda (UserStore) en la base de datos.
   * No es necesario incluir campos como createdAt o updatedAt, ya que se autogeneran.
   */
  const createUserStore = async (storeInput: UserStoreInput, auth: AuthMode = defaultAuth) => {
    return performMutation(() => client.models.UserStore.create(storeInput, auth))
  }

  /**
   * Actualiza los datos de una tienda.
   * Es importante incluir el campo 'id' del registro a actualizar.
   */
  const updateUserStore = async (
    storeInput: Partial<UserStoreInput> & { id: string },
    auth: AuthMode = defaultAuth
  ) => {
    return performMutation(() => client.models.UserStore.update(storeInput, auth))
  }

  /**
   * Elimina una tienda a partir de su 'id'.
   */
  const deleteUserStore = async (id: string, auth: AuthMode = defaultAuth) => {
    return performMutation(() => client.models.UserStore.delete({ id }, auth))
  }

  return { loading, error, createUserStore, updateUserStore, deleteUserStore }
}
