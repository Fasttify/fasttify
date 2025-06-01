import { create } from 'zustand'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'
import { CONNECTION_STATE_CHANGE, ConnectionState } from 'aws-amplify/data'
import { Hub } from 'aws-amplify/utils'

const client = generateClient<Schema>({
  authMode: 'userPool',
})

type StoreType = Schema['UserStore']['type']

interface StoreDataState {
  currentStore: StoreType | null
  storeId: string | null
  isLoading: boolean
  error: Error | null
  connectionState: ConnectionState | null
  hasMasterShopApiKey: boolean
  setStoreId: (id: string | null) => void
  fetchStoreData: (storeId: string, userId: string) => Promise<void>
  clearStore: () => void
  setupSubscription: (id: string) => () => void
  setConnectionState: (state: ConnectionState) => void
  checkMasterShopApiKey: (id: string) => Promise<boolean>
}

// Configurar el listener de estado de conexión
Hub.listen('api', (data: any) => {
  const { payload } = data
  if (payload.event === CONNECTION_STATE_CHANGE) {
    const connectionState = payload.data.connectionState as ConnectionState
    useStoreDataStore.getState().setConnectionState(connectionState)
  }
})

const useStoreDataStore = create<StoreDataState>((set, get) => ({
  currentStore: null,
  storeId: null,
  userId: null,
  isLoading: true,
  error: null,
  connectionState: null,
  hasMasterShopApiKey: false,

  setStoreId: id => set({ storeId: id }),

  setConnectionState: (state: ConnectionState) => set({ connectionState: state }),

  fetchStoreData: async (storeId, userId) => {
    // No hacer fetch si ya tenemos los datos de esta tienda
    if (get().currentStore && get().storeId === storeId) {
      set({ isLoading: false })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const { data: store } = await client.models.UserStore.get(
        { storeId: storeId },
        {
          selectionSet: [
            'storeId',
            'storeName',
            'storeLogo',
            'customDomain',
            'contactPhone',
            'contactEmail',
            'storeFavicon',
            'storeTheme',
            'onboardingData',
          ],
        }
      )

      if (store) {
        set({
          currentStore: store as StoreType,
          storeId: storeId,
          isLoading: false,
        })

        // Verificar si existe la API key de Master Shop
        const hasMasterShopApiKey = await get().checkMasterShopApiKey(store.storeId)
        set({ hasMasterShopApiKey })

        // Configurar suscripción automáticamente después de obtener los datos
        get().setupSubscription(storeId)
      } else {
        set({
          error: new Error('Store not found'),
          isLoading: false,
        })
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err : new Error('Error fetching store data'),
        isLoading: false,
      })
    }
  },

  // Verificar si existe la API key de Master Shop sin traer su valor
  checkMasterShopApiKey: async (id: string) => {
    try {
      const { data } = await client.models.UserStore.listUserStoreByUserId(
        {
          userId: id,
        },
        {
          filter: {
            mastershopApiKey: { attributeExists: true },
          },
        }
      )

      const hasApiKey = data && data.length > 0
      set({ hasMasterShopApiKey: hasApiKey })
      return hasApiKey
    } catch (error) {
      console.error('Error al verificar API key:', error)
      return false
    }
  },

  clearStore: () =>
    set({
      currentStore: null,
      storeId: null,
      error: null,
      isLoading: true,
      hasMasterShopApiKey: false,
    }),

  // Configurar suscripción para actualizaciones en tiempo real
  setupSubscription: (id: string) => {
    // Usar observeQuery para mantener los datos actualizados automáticamente
    const subscription = client.models.UserStore.observeQuery({
      filter: { storeId: { eq: id } },
      selectionSet: [
        'storeId',
        'storeName',
        'storeLogo',
        'customDomain',
        'contactPhone',
        'contactEmail',
        'storeFavicon',
        'storeTheme',
        'onboardingData',
      ],
    }).subscribe({
      next: ({ items, isSynced }) => {
        if (items.length > 0) {
          // Actualizar el estado con los datos más recientes
          set({
            currentStore: items[0] as StoreType,
            isLoading: false,
          })

          // Verificar si existe la API key cuando hay cambios
          if (isSynced) {
            get().checkMasterShopApiKey(items[0].storeId)
          }
        } else if (isSynced) {
          // Si no hay elementos después de sincronizar, la tienda podría haber sido eliminada
          set({
            currentStore: null,
            error: new Error('Store not found or deleted'),
            isLoading: false,
            hasMasterShopApiKey: false,
          })
        }
      },
      error: error => {
        console.error('Error in data subscription:', error)
        set({
          error: new Error('Error in data subscription'),
          isLoading: false,
        })
      },
    })

    // Devolver función para cancelar la suscripción
    return () => subscription.unsubscribe()
  },
}))

export default useStoreDataStore
