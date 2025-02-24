import { useState, useEffect } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'

const client = generateClient<Schema>()

const STORE_LIMITS = {
  Imperial: 5,
  Majestic: 3,
  Royal: 1,
}

export function useStoreLimit(userId: string | null, userPlan: string | undefined) {
  const [storeCount, setStoreCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [canCreateStore, setCanCreateStore] = useState(false)

  useEffect(() => {
    const checkStoreLimit = async () => {
      if (!userId || !userPlan) {
        setCanCreateStore(false)
        setLoading(false)
        return
      }

      try {
        const { data: stores } = await client.models.UserStore.list({
          authMode: 'userPool',
          filter: { userId: { eq: userId } },
        })

        const currentCount = stores?.length || 0
        setStoreCount(currentCount)

        const limit = STORE_LIMITS[userPlan as keyof typeof STORE_LIMITS] || 0
        setCanCreateStore(currentCount < limit)
      } catch (error) {
        console.error('Error checking store limit:', error)
        setCanCreateStore(false)
      } finally {
        setLoading(false)
      }
    }

    checkStoreLimit()
  }, [userId, userPlan])

  return { storeCount, canCreateStore, loading }
}
