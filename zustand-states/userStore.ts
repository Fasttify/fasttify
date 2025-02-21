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
}

// Define el estado y las acciones del store
interface UserState {
  user: User | null
  setUser: (newUserData: User) => void
  clearUser: () => void
}

const useAuthStore = create<UserState>(set => ({
  user: null,
  // Actualiza el usuario
  setUser: newUserData =>
    set(() => ({
      user: newUserData,
    })),
  // Limpia el usuario
  clearUser: () =>
    set(() => ({
      user: null,
    })),
}))

export default useAuthStore
