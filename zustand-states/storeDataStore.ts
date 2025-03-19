import { create } from 'zustand'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'
import { CONNECTION_STATE_CHANGE, ConnectionState } from 'aws-amplify/data'
import { Hub } from 'aws-amplify/utils'

const client = generateClient<Schema>()

type StoreType = Schema['UserStore']['type']

interface StoreDataState {
  currentStore: StoreType | null
  storeId: string | null
  isLoading: boolean
  error: Error | null
  connectionState: ConnectionState | null
  hasMasterShopApiKey: boolean
  setStoreId: (id: string | null) => void
  fetchStoreData: (id: string) => Promise<void>
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
  isLoading: true,
  error: null,
  connectionState: null,
  hasMasterShopApiKey: false,

  setStoreId: id => set({ storeId: id }),

  setConnectionState: (state: ConnectionState) => set({ connectionState: state }),

  fetchStoreData: async id => {
    // No hacer fetch si ya tenemos los datos de esta tienda
    if (get().currentStore && get().storeId === id) {
      set({ isLoading: false })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const { data: stores } = await client.models.UserStore.list({
        authMode: 'userPool',
        filter: { storeId: { eq: id } },
        selectionSet: [
          'id',
          'storeId',
          'storeName',
          'storeLogo',
          'customDomain',
          'contactPhone',
          'contactEmail',
          'storeFavicon',
          'storeTheme',
        ],
      })

      if (stores && stores.length > 0) {
        set({
          currentStore: stores[0] as StoreType,
          storeId: id,
          isLoading: false,
        })

        // Verificar si existe la API key de Master Shop
        const hasMasterShopApiKey = await get().checkMasterShopApiKey(stores[0].id)
        set({ hasMasterShopApiKey })

        // Configurar suscripción automáticamente después de obtener los datos
        get().setupSubscription(id)
      } else {
        set({
          error: new Error('Tienda no encontrada'),
          isLoading: false,
        })
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err : new Error('Error al obtener la tienda'),
        isLoading: false,
      })
    }
  },

  // Verificar si existe la API key de Master Shop sin traer su valor
  checkMasterShopApiKey: async (id: string) => {
    try {
      const { data } = await client.models.UserStore.list({
        filter: {
          id: { eq: id },
          mastershopApiKey: { attributeExists: true },
        },
        selectionSet: ['id'],
        authMode: 'userPool',
      })

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
      authMode: 'userPool',
      selectionSet: [
        'id',
        'storeId',
        'storeName',
        'storeLogo',
        'customDomain',
        'contactPhone',
        'contactEmail',
        'storeFavicon',
        'storeTheme',
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
            get().checkMasterShopApiKey(items[0].id)
          }
        } else if (isSynced) {
          // Si no hay elementos después de sincronizar, la tienda podría haber sido eliminada
          set({
            currentStore: null,
            error: new Error('Tienda no encontrada o eliminada'),
            isLoading: false,
            hasMasterShopApiKey: false,
          })
        }
      },
      error: error => {
        console.error('Error en la suscripción:', error)
        set({
          error: new Error('Error en la suscripción de datos'),
          isLoading: false,
        })
      },
    })

    // Devolver función para cancelar la suscripción
    return () => subscription.unsubscribe()
  },
}))

export default useStoreDataStore
