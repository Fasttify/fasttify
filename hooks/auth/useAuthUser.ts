import { useState, useEffect } from 'react'
import { fetchAuthSession } from 'aws-amplify/auth'

export const useAuthUser = () => {
  // Estado para guardar el payload completo
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Función para obtener la sesión y los datos del usuario
    const fetchUserData = async () => {
      try {
        const session = await fetchAuthSession()
        const payload = session.tokens?.idToken?.payload
        setUserData(payload)
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  return { userData }
}
