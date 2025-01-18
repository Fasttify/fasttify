"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import outputs from "@/amplify_outputs.json";
import { Amplify } from "aws-amplify";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { I18n } from "aws-amplify/utils";
import { translations } from "@aws-amplify/ui-react";
import { formFields } from "@/app/login/components/formFieldsConfig";
I18n.putVocabularies(translations);

I18n.putVocabularies({
  es: {
    "Preferred Username": "Nombre preferido",
    "Password must have at least 8 characters":
      "La contraseña debe tener al menos 8 caracteres",
    "Password must have upper case letters":
      "La contraseña debe tener letras mayúsculas",
    "Password must have numbers": "La contraseña debe tener números",
    "Password must have special characters":
      "La contraseña debe tener caracteres especiales",
    "The passwords must match": "Las contraseñas deben coincidir",
    "username is required to signUp":
      "El nombre de usuario es obligatorio para registrarse",
  },
});

Amplify.configure(outputs, {
  ssr: true,
});

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/"];

function CustomAuthenticatorLogic({ children }: { children: React.ReactNode }) {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      // Si el usuario está autenticado y está en una ruta de auth,
      // redirigir a la página principal
      if (PUBLIC_ROUTES.includes(pathname)) {
        router.push("/");
      }
    } else {
      // Si el usuario no está autenticado y no está en una ruta pública,
      // redirigir al login
      if (!PUBLIC_ROUTES.includes(pathname)) {
        router.push("/login");
      }
    }
  }, [user, router, pathname]);

  // Si no hay usuario y la ruta no es pública, mostrar el autenticador
  if (!user && !PUBLIC_ROUTES.includes(pathname)) {
    return <Authenticator formFields={formFields} />;
  }

  // En cualquier otro caso, mostrar el contenido
  return <>{children}</>;
}

const Auth = ({ children }: { children: React.ReactNode }) => {
  return (
    <Authenticator.Provider>
      <CustomAuthenticatorLogic>{children}</CustomAuthenticatorLogic>
    </Authenticator.Provider>
  );
};

export default Auth;
