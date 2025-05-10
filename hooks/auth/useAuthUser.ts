import { useState, useEffect, useCallback } from 'react'
import { fetchAuthSession } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'

interface UserPayload {
  sub: string
  email: string
  nickName?: string
  phone?: string
  cognitoUsername: string
  userId: string
  plan?: string
  picture?: string
  identities?: any[]
  [key: string]: any
}

interface AuthUserResult {
  userData: UserPayload | null
  isLoading: boolean
  error: Error | null
  refreshUserData: () => Promise<void>
}

export const useAuthUser = (): AuthUserResult => {
  const [userData, setUserData] = useState<UserPayload | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUserData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const session = await fetchAuthSession()
      const payload = session.tokens?.idToken?.payload as UserPayload
      setUserData(payload)
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError(err instanceof Error ? err : new Error('Error desconocido'))
      setUserData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Escucha eventos de Auth para refrescar los datos
  useEffect(() => {
    fetchUserData()

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (
        ['signIn', 'signOut', 'tokenRefresh', 'signIn_failure', 'signOut_failure'].includes(
          payload.event
        )
      ) {
        fetchUserData()
      }
    })

    return () => {
      unsubscribe() // limpia el listener al desmontar
    }
  }, [fetchUserData])

  return {
    userData,
    isLoading,
    error,
    refreshUserData: fetchUserData,
  }
}
