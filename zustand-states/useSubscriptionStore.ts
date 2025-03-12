import { create } from 'zustand'
import { generateClient } from 'aws-amplify/data'
import { type Schema } from '@/amplify/data/resource'

const client = generateClient<Schema>()

// Definimos un tipo con solo los campos necesarios
interface MinimalSubscription {
  subscriptionId: Schema['UserSubscription']['type']['subscriptionId']
  planName: Schema['UserSubscription']['type']['planName']
  nextPaymentDate: Schema['UserSubscription']['type']['nextPaymentDate']
  lastFourDigits: Schema['UserSubscription']['type']['lastFourDigits']
  pendingPlan: Schema['UserSubscription']['type']['pendingPlan']
  createdAt: string
}

interface SubscriptionState {
  cognitoUsername: string | null
  subscription: MinimalSubscription | null
  loading: boolean
  error: string | null
  setCognitoUsername: (username: string | null) => void
  fetchSubscription: () => Promise<void>
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  cognitoUsername: null,
  subscription: null,
  loading: false,
  error: null,
  setCognitoUsername: username => set({ cognitoUsername: username }),
  fetchSubscription: async () => {
    const { cognitoUsername } = get()

    if (!cognitoUsername) {
      set({ subscription: null, loading: false, error: null })
      return
    }

    set({ loading: true, error: null })

    try {
      const { data, errors } = await client.models.UserSubscription.list({
        filter: { userId: { eq: cognitoUsername } },
        selectionSet: [
          'subscriptionId',
          'planName',
          'pendingPlan',
          'nextPaymentDate',
          'lastFourDigits',
          'createdAt',
        ],

        authMode: 'userPool',
      })

      if (errors && errors.length > 0) {
        throw new Error('Error al obtener la suscripción')
      }

      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      const minimalSubscription: MinimalSubscription | null =
        sortedData.length > 0
          ? {
              subscriptionId: sortedData[0].subscriptionId,
              planName: sortedData[0].planName,
              pendingPlan: sortedData[0].pendingPlan,
              nextPaymentDate: sortedData[0].nextPaymentDate,
              lastFourDigits: sortedData[0].lastFourDigits,
              createdAt: sortedData[0].createdAt,
            }
          : null

      set({
        subscription: minimalSubscription,
        loading: false,
      })
    } catch (error) {
      set({ error: 'Error al cargar la suscripción', loading: false })
    }
  },
}))
