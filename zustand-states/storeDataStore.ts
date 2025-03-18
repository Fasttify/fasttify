import { create } from 'zustand'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'

const client = generateClient<Schema>()

type StoreType = Schema['UserStore']['type']

interface StoreDataState {
  currentStore: StoreType | null
  storeId: string | null
  isLoading: boolean
  error: Error | null
  setStoreId: (id: string | null) => void
  fetchStoreData: (id: string) => Promise<void>
  clearStore: () => void
}

const useStoreDataStore = create<StoreDataState>((set, get) => ({
  currentStore: null,
  storeId: null,
  isLoading: true, // Start with loading true by default
  error: null,

  setStoreId: id => set({ storeId: id }),

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
      })

      if (stores && stores.length > 0) {
        set({
          currentStore: stores[0] as StoreType,
          storeId: id,
          isLoading: false,
        })
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

  clearStore: () => set({ currentStore: null, storeId: null, error: null, isLoading: true }),
}))

export default useStoreDataStore
