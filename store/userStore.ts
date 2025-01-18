import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Define el tipo del usuario
interface User {
  username: string;
  email: string;
  picture?: string;
}

// Define el estado y las acciones del store
interface UserState {
  user: User | null;
  setUser: (newUserData: User) => void;
  clearUser: () => void;
}

const useAuthStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      // Actualiza el usuario
      setUser: (newUserData) =>
        set(() => ({
          user: newUserData,
        })),
      // Limpia el usuario y el almacenamiento persistente
      clearUser: () =>
        set(() => {
          localStorage.removeItem("auth-store");
          return { user: null };
        }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
