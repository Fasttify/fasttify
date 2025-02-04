import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/utils/amplify-utils";

export async function subscriptionMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  const session = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        return await fetchAuthSession(contextSpec, {});
      } catch (error) {
        console.error("Error fetching user session:", error);
        return null;
      }
    },
  });

  const userPlan: string | undefined = session?.tokens?.idToken?.payload?.[
    "custom:plan"
  ] as string | undefined;

  const allowedPlans = ["Royal", "Majestic", "Imperial"];

  if (!userPlan || !allowedPlans.includes(userPlan)) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  return response;
}
