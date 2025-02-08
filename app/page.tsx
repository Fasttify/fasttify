"use client";

import { useEffect } from "react";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { ConsoleLogger, Hub } from "aws-amplify/utils";
import { DocsLanding } from "@/app/landing/components/DocsLanding";
import "aws-amplify/auth/enable-oauth-listener";

const logger = new ConsoleLogger("HomePage");

export default function Home() {
  useEffect(() => {
    const hubListenerCancelToken = Hub.listen("auth", async ({ payload }) => {
      switch (payload.event) {
        case "signInWithRedirect":
          try {
            const user = await getCurrentUser();
            const userAttributes = await fetchUserAttributes();
            logger.log({ user, userAttributes });
          } catch (error) {
            logger.error("Error al obtener la sesión del usuario:", error);
          }
          break;
        case "signInWithRedirect_failure":
          logger.error(
            "Error en el inicio de sesión con redirección:",
            payload.data
          );
          break;
        case "customOAuthState":
          const state = payload.data;
          logger.log("Estado personalizado:", state);
          break;
      }
    });

    return () => hubListenerCancelToken();
  }, []);

  return <DocsLanding />;
}
