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
  activeSubscription: (() => void) | null // Tracking de suscripción activa
  setStoreId: (id: string | null) => void
  fetchStoreData: (storeId: string, userId: string) => Promise<void>
  clearStore: () => void
  setupSubscription: (id: string) => () => void
  setConnectionState: (state: ConnectionState) => void
  checkMasterShopApiKey: (storeId: string, userId: string) => Promise<boolean>
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
  activeSubscription: null,

  setStoreId: id => set({ storeId: id }),

  setConnectionState: (state: ConnectionState) => set({ connectionState: state }),

  fetchStoreData: async (storeId, userId) => {
    const currentState = get()

    // No hacer fetch si ya tenemos los datos de esta tienda y no está cargando
    if (currentState.currentStore?.storeId === storeId && !currentState.isLoading) {
      return
    }

    // Si ya hay una petición en curso para la misma tienda, no hacer otra
    if (currentState.isLoading && currentState.storeId === storeId) {
      return
    }

    set({ isLoading: true, error: null, storeId })

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

        const hasMasterShopApiKey = await get().checkMasterShopApiKey(storeId, userId)
        set({ hasMasterShopApiKey })

        // Solo configurar suscripción si no hay una activa ya
        const state = get()
        if (!state.activeSubscription) {
          const unsubscribe = get().setupSubscription(storeId)
          set({ activeSubscription: unsubscribe })
        }
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

  checkMasterShopApiKey: async (storeId: string, userId: string) => {
    try {
      const result = await client.models.UserStore.listUserStoreByUserId(
        {
          userId: userId,
        },
        {
          filter: {
            storeId: { eq: storeId },
            mastershopApiKey: { attributeExists: true },
          },
          selectionSet: ['storeId'],
        }
      )

      const hasApiKey = !!(result.data && result.data.length > 0)

      set({ hasMasterShopApiKey: hasApiKey })

      return hasApiKey
    } catch (error) {
      console.error('Error checking master shop api key:', error)
      set({ hasMasterShopApiKey: false })
      return false
    }
  },

  clearStore: () => {
    const state = get()

    // Cancelar suscripción activa antes de limpiar
    if (state.activeSubscription) {
      state.activeSubscription()
    }

    set({
      currentStore: null,
      storeId: null,
      error: null,
      isLoading: true,
      hasMasterShopApiKey: false,
      activeSubscription: null,
    })
  },

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
          set({
            currentStore: items[0] as StoreType,
            isLoading: false,
          })

          if (isSynced) {
            const currentState = get()
            if (currentState.currentStore?.userId) {
              get().checkMasterShopApiKey(id, currentState.currentStore.userId)
            }
          }
        } else if (isSynced) {
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
