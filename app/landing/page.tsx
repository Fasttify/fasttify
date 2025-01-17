"use client";

import { useEffect } from "react";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { DocsLanding } from "@/app/landing/components/DocsLanding";
import "aws-amplify/auth/enable-oauth-listener";


export default function LandingPage() {
  useEffect(() => {
    // Comienza a escuchar los eventos de autenticación
    const hubListenerCancelToken = Hub.listen("auth", async ({ payload }) => {
      switch (payload.event) {
        case "signInWithRedirect":
          try {
            const user = await getCurrentUser();
            const userAttributes = await fetchUserAttributes();
            console.log({ user, userAttributes });
          } catch (error) {
            console.error("Error al obtener la sesión del usuario:", error);
          }
          break;
        case "signInWithRedirect_failure":
          console.error(
            "Error en el inicio de sesión con redirección:",
            payload.data
          );
          break;
        case "customOAuthState":
          const state = payload.data;
          console.log("Estado personalizado:", state);
          break;
      }
    });

    // Cleanup: cancelar la suscripción al evento cuando el componente se desmonte
    return () => {
      hubListenerCancelToken(); // Detiene la escucha de eventos
    };
  }, []);

  return <DocsLanding />;
}
