import { useEffect, useState } from "react";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import useAuthStore from "@/store/userStore";

export const useAuth = () => {
  const { user, setUser, clearUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const userAttributes = await fetchUserAttributes();
          const newUser = {
            nickName: userAttributes?.nickname || undefined,
            email: userAttributes?.email || "",
            picture: userAttributes?.picture || undefined,
            preferredUsername: userAttributes?.preferred_username || "",
            plan: userAttributes?.["custom:plan"] || undefined,
            bio: userAttributes?.["custom:bio"] || undefined,
            phone: userAttributes?.["custom:phone"] || undefined,
          };
          setUser(newUser);
        } else {
          clearUser();
        }
      } catch (error) {
        console.error("Error al obtener el usuario:", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      checkUser();
    } else {
      setLoading(false);
    }
  }, [setUser, clearUser, user]);

  return { loading };
};
