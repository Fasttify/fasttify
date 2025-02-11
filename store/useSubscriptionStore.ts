import { create } from "zustand";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface SubscriptionState {
  cognitoUsername: string | null;
  subscription: Schema["UserSubscription"]["type"] | null;
  loading: boolean;
  error: string | null;
  setCognitoUsername: (username: string | null) => void;
  fetchSubscription: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  cognitoUsername: null,
  subscription: null,
  loading: false,
  error: null,
  setCognitoUsername: (username) => set({ cognitoUsername: username }),
  fetchSubscription: async () => {
    const { cognitoUsername } = get();

    if (!cognitoUsername) {
      set({ subscription: null, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data, errors } = await client.models.UserSubscription.list({
        filter: { userId: { eq: cognitoUsername } },
        authMode: "userPool",
      });

      if (errors && errors.length > 0) {
        throw new Error("Error al obtener la suscripción");
      }

      set({
        subscription: data && data.length > 0 ? data[0] : null,
        loading: false,
      });
    } catch (error) {
      set({ error: "Error al cargar la suscripción", loading: false });
    }
  },
}));
