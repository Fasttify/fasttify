"use client";

import {
  Authenticator,
  Text,
  View,
  useAuthenticator,
} from "@aws-amplify/ui-react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const formFields = {
  signUp: {
    email: {
      order: 1,
    },
    preferred_username: {
      order: 2,
    },
    password: {
      order: 3,
    },
    confirm_password: {
      order: 4,
    },
  },
};

const components = {
  Header() {
    return (
      <View textAlign="center">
        <Text>
          <span style={{ color: "white" }}>Authenticator Header</span>
        </Text>
      </View>
    );
  },
};

function CustomAuthenticator() {
  const { user } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    if (user) {
      redirect("/landing");
    }
  }, [user]);

  // Mostrar la interfaz de autenticación si no hay un usuario
  if (!user) {
    return (
      <Authenticator
        socialProviders={["google"]}
        formFields={formFields}
        components={components}
      />
    );
  }

  // El contenido protegido no se muestra aquí porque ya redirigimos al usuario
  return null;
}

export default function Login() {
  return (
    <Authenticator.Provider>
      <CustomAuthenticator />
    </Authenticator.Provider>
  );
}
