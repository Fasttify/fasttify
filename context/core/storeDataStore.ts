import type { StoreSchema } from '@/data-schema';
import { CONNECTION_STATE_CHANGE, ConnectionState, generateClient } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';
import { create } from 'zustand';

const client = generateClient<StoreSchema>({
  authMode: 'userPool',
});

type StoreType = StoreSchema['UserStore']['type'];

interface StoreDataState {
  currentStore: StoreType | null;
  storeId: string | null;
  isLoading: boolean;
  error: Error | null;
  connectionState: ConnectionState | null;
  activeSubscription: (() => void) | null;
  setStoreId: (id: string | null) => void;
  fetchStoreData: (storeId: string, userId: string) => Promise<void>;
  clearStore: () => void;
  setupSubscription: (id: string) => () => void;
  setConnectionState: (state: ConnectionState) => void;
}

Hub.listen('api', (data: any) => {
  const { payload } = data;
  if (payload.event === CONNECTION_STATE_CHANGE) {
    const connectionState = payload.data.connectionState as ConnectionState;
    useStoreDataStore.getState().setConnectionState(connectionState);
  }
});

const useStoreDataStore = create<StoreDataState>((set, get) => ({
  currentStore: null,
  storeId: null,
  isLoading: true,
  error: null,
  connectionState: null,
  activeSubscription: null,

  setStoreId: (id) => set({ storeId: id }),

  setConnectionState: (state: ConnectionState) => set({ connectionState: state }),

  fetchStoreData: async (storeId, userId) => {
    const currentState = get();

    if (currentState.currentStore?.storeId === storeId && !currentState.isLoading) {
      return;
    }

    if (currentState.isLoading && currentState.storeId === storeId) {
      return;
    }

    set({ isLoading: true, error: null, storeId });

    try {
      const { data: store } = await client.models.UserStore.get(
        { storeId: storeId },
        {
          selectionSet: [
            'storeId',
            'storeName',
            'storeLogo',
            'defaultDomain',
            'contactPhone',
            'contactEmail',
            'storeFavicon',
            'storeTheme',
            'onboardingData',
            'storeAdress',
            'storeDescription',
            'storeCurrency',
            'currencyFormat',
            'currencyLocale',
            'currencyDecimalPlaces',
          ],
        }
      );

      if (store) {
        set({
          currentStore: store as StoreType,
          storeId: storeId,
          isLoading: false,
        });

        const state = get();
        if (!state.activeSubscription) {
          const unsubscribe = get().setupSubscription(storeId);
          set({ activeSubscription: unsubscribe });
        }
      } else {
        set({
          error: new Error('Store not found'),
          isLoading: false,
        });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err : new Error('Error fetching store data'),
        isLoading: false,
      });
    }
  },

  clearStore: () => {
    const state = get();

    if (state.activeSubscription) {
      state.activeSubscription();
    }

    set({
      currentStore: null,
      storeId: null,
      error: null,
      isLoading: true,
      activeSubscription: null,
    });
  },

  setupSubscription: (id: string) => {
    const subscription = client.models.UserStore.observeQuery({
      filter: { storeId: { eq: id } },
      selectionSet: [
        'storeId',
        'storeName',
        'storeLogo',
        'defaultDomain',
        'contactPhone',
        'contactEmail',
        'storeFavicon',
        'storeTheme',
        'onboardingData',
        'storeAdress',
        'storeDescription',
        'storeCurrency',
        'currencyFormat',
        'currencyLocale',
        'currencyDecimalPlaces',
      ],
    }).subscribe({
      next: ({ items, isSynced }) => {
        if (items.length > 0) {
          set({
            currentStore: items[0] as StoreType,
            isLoading: false,
          });
        } else if (isSynced) {
          set({
            currentStore: null,
            error: new Error('Store not found or deleted'),
            isLoading: false,
          });
        }
      },
      error: (error) => {
        console.error('Error in data subscription:', error);
        set({
          error: new Error('Error in data subscription'),
          isLoading: false,
        });
      },
    });

    return () => subscription.unsubscribe();
  },
}));

export default useStoreDataStore;
