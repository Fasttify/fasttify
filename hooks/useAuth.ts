import { useEffect, useState } from "react";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import useAuthStore from "@/store/userStore";

export const useAuth = () => {
  const { user, setUser, clearUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Si ya hay un usuario en el estado, no hagas más peticiones
        if (user) {
          setLoading(false);
          return;
        }

        // Verifica si hay datos persistidos en el localStorage
        const storedState = localStorage.getItem("auth-store");
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          if (parsedState?.state?.user) {
            setUser(parsedState.state.user); // Usa el usuario almacenado
            setLoading(false);
            return;
          }
        }

        // Si no hay datos en localStorage, intenta obtenerlos del backend
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const userAttributes = await fetchUserAttributes();
          const newUser = {
            username: currentUser.username,
            email: userAttributes?.email || "",
            picture: userAttributes?.picture || undefined,
          };

          // Actualiza el estado global
          setUser(newUser);
        } else {
          clearUser();
        }
      } catch (error) {
        console.error("Error al obtener el usuario o sus atributos:", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [user, setUser, clearUser]);

  return { loading };
};
