import { create } from 'zustand'
import { generateClient } from 'aws-amplify/data'
import { type Schema } from '@/amplify/data/resource'

const client = generateClient<Schema>({
  authMode: 'userPool',
})

// tipo con solo los campos necesarios
export type MinimalSubscription = Schema['UserSubscription']['type']

interface SubscriptionState {
  cognitoUsername: string | null
  subscription: MinimalSubscription | null
  loading: boolean
  error: string | null
  setCognitoUsername: (username: string | null) => void
  fetchSubscription: () => Promise<MinimalSubscription | null>
  subscriptionResource: {
    read: () => MinimalSubscription | null
    preload: (username: string) => void
  }
}

function createResource() {
  let status = 'pending'
  let result: MinimalSubscription | null = null
  let error: Error | null = null
  let suspender: Promise<void> | null = null
  let lastUsername: string | null = null

  return {
    read() {
      if (status === 'pending' && suspender) {
        throw suspender
      } else if (status === 'error') {
        throw error
      } else {
        return result
      }
    },
    preload(username: string) {
      if (!username) return

      // Evitar peticiones duplicadas si el username no ha cambiado y ya hay una petición en curso
      if (username === lastUsername && (status === 'success' || suspender)) {
        return
      }

      lastUsername = username
      status = 'pending'
      suspender = fetchSubscriptionData(username)
        .then(data => {
          status = 'success'
          result = data
        })
        .catch(e => {
          status = 'error'
          error = e
        })
    },
  }
}

// Función auxiliar para obtener los datos de suscripción
async function fetchSubscriptionData(username: string): Promise<MinimalSubscription | null> {
  try {
    const { data, errors } = await client.models.UserSubscription.listUserSubscriptionByUserId({
      userId: username,
    })

    if (errors && errors.length > 0) {
      throw new Error('Error getting subscription')
    }

    const sortedData = data.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    if (sortedData.length === 0) {
      return null
    }

    return sortedData[0]
  } catch (error) {
    console.error('Error fetching subscription:', error)
    throw error
  }
}

const subscriptionResource = createResource()

export const useSubscriptionStore = create<SubscriptionState>((set, get) => {
  return {
    cognitoUsername: null,
    subscription: null,
    loading: false,
    error: null,
    subscriptionResource,
    setCognitoUsername: username => {
      set({ cognitoUsername: username })
      if (username) {
        subscriptionResource.preload(username)
      }
    },
    fetchSubscription: async () => {
      const { cognitoUsername } = get()

      if (!cognitoUsername) {
        set({ subscription: null, loading: false, error: null })
        return null
      }

      set({ loading: true, error: null })

      try {
        const subscription = await fetchSubscriptionData(cognitoUsername)
        set({
          subscription,
          loading: false,
        })
        return subscription
      } catch (error) {
        set({ error: 'Error loading subscription', loading: false })
        return null
      }
    },
  }
})
