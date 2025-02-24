import { useState } from 'react'
import { get } from 'aws-amplify/api'

export function useStoreNameValidator() {
  const [isChecking, setIsChecking] = useState(false)
  const [exists, setExists] = useState(false)

  const checkStoreName = async (name: string) => {
    if (!name) return
    setIsChecking(true)
    try {
      const response = await get({
        apiName: 'CheckStoreNameApi',
        path: 'check-store-name',
        options: {
          queryParams: {
            storeName: name,
          },
        },
      })

      const { body } = await response.response
      const responseExistStore = (await body.json()) as { exists: boolean }

      setExists(responseExistStore?.exists)
    } catch (error) {
      console.error('Error checking store name:', error)
    } finally {
      setIsChecking(false)
    }
  }

  return { checkStoreName, isChecking, exists }
}
