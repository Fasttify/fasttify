// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/utils/amplify-utils";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const hasValidPlan = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec, {});
        // Verificar que el token exista y extraer el atributo "custom:plan"
        const userPlan: string | undefined =
          session.tokens?.idToken?.payload?.["custom:plan"] as string | undefined;
        const allowedPlans = ["Royal", "Majestic", "Imperial"];

        // Retorna true solo si el usuario tiene un plan válido
        return !!userPlan && allowedPlans.includes(userPlan);
      } catch (error) {
        console.error("Error fetching user session:", error);
        return false;
      }
    },
  });

  if (hasValidPlan) {
    // Si el usuario tiene un plan permitido, se continúa con la solicitud
    return response;
  }

  // Si no, se redirige a la página de inicio
  return NextResponse.redirect(new URL("/pricing", request.url));
}

export const config = {
  // Este middleware se ejecuta únicamente para la ruta /subscription-success
  matcher: "/subscription-success",
};
