import { useEffect, useState } from "react";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import useAuthStore from "@/store/userStore";

export const useAuth = () => {
  const { user, setUser, clearUser } = useAuthStore();
  const [loading, setLoading] = useState(() => {
    // Comienza como falso si ya hay un usuario en Zustand o en localStorage
    const storedState = localStorage.getItem("auth-store");
    if (user || (storedState && JSON.parse(storedState)?.state?.user)) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    const checkUser = async () => {
      // Evita ejecutar la lógica si no estamos en estado de carga
      if (!loading) return;

      try {
        // Si hay datos en el almacenamiento persistente, no hagas peticiones
        const storedState = localStorage.getItem("auth-store");
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          if (parsedState?.state?.user) {
            setUser(parsedState.state.user); // Usa el usuario almacenado
            setLoading(false);
            return;
          }
        }

        // Si no hay datos, realiza la petición para obtener el usuario
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const userAttributes = await fetchUserAttributes();
          const newUser = {
            nickName: userAttributes?.nickname || undefined,
            email: userAttributes?.email || "",
            picture: userAttributes?.picture || undefined,
            preferredUsername: userAttributes?.preferred_username || "",
            plan: userAttributes?.["custom:plan"] || undefined,
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
  }, [loading, setUser, clearUser]);

  return { loading };
};
