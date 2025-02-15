export interface User {
  username: string
  email: string
  picture: string | null
}

interface UserStore {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
}
