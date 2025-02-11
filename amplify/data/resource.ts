import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";
import { webHookPlan } from "../functions/webHookPlan/resource";
import { cancelPlan } from "../functions/cancelPlan/resource";
import { planScheduler } from "../functions/planScheduler/resource";
const schema = a
  .schema({
    UserProfile: a
      .model({
        email: a.string(),
        profileOwner: a.string(),
      })
      .authorization((allow) => [allow.ownerDefinedIn("profileOwner")]),

    UserSubscription: a
      .model({
        userId: a.string().required(), // Llave primaria (external_reference)
        subscriptionId: a.string().required(), // Id de la suscripción
        planName: a.string().required(), // Nombre del plan (reason)
        nextPaymentDate: a.datetime(), // Próxima fecha de pago (opcional)
        pendingPlan: a.string(), // Nuevo plan pendiente (opcional)
        pendingStartDate: a.datetime(),
        planPrice: a.float(),
      })
      .authorization((allow) => [
        allow.ownerDefinedIn("userId"),
        allow.authenticated().to(["update", "create", "list"]),
      ]),
  })
  .authorization((allow) => [
    allow.resource(postConfirmation),
    allow.resource(webHookPlan),
    allow.resource(cancelPlan),
    allow.resource(planScheduler)
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
