import { create } from 'zustand'

// Define el tipo del usuario
interface User {
  nickName?: string
  email: string
  picture?: string
  preferredUsername?: string
  plan?: string
  bio?: string
  phone?: string
  cognitoUsername?: string
  userId?: string
  dentities?: unknown[]
}

// Define el estado y las acciones del store
interface UserState {
  user: User | null
  loading: boolean
  setUser: (newUserData: User) => void
  clearUser: () => void
  setLoading: (isLoading: boolean) => void
}

const useAuthStore = create<UserState>(set => ({
  user: null,
  loading: false,
  // Actualiza el usuario
  setUser: newUserData =>
    set(() => ({
      user: newUserData,
      loading: false,
    })),
  // Limpia el usuario
  clearUser: () =>
    set(() => ({
      user: null,
    })),
  // Actualiza el estado de carga
  setLoading: isLoading =>
    set(() => ({
      loading: isLoading,
    })),
}))

export default useAuthStore
