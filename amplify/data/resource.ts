import { type ClientSchema, a, defineData } from '@aws-amplify/backend'
import { postConfirmation } from '../auth/post-confirmation/resource'
import { webHookPlan } from '../functions/webHookPlan/resource'
import { cancelPlan } from '../functions/cancelPlan/resource'
import { planScheduler } from '../functions/planScheduler/resource'

const schema = a
  .schema({
    UserProfile: a
      .model({
        email: a.string(),
        profileOwner: a.string(),
      })
      .authorization(allow => [allow.ownerDefinedIn('profileOwner')]),

    UserSubscription: a
      .model({
        userId: a.string().required(), // Llave primaria (external_reference)
        subscriptionId: a.string().required(), // Id de la suscripción
        planName: a.string().required(), // Nombre del plan (reason)
        nextPaymentDate: a.datetime(), // Próxima fecha de pago (opcional)
        pendingPlan: a.string(), // Nuevo plan pendiente (opcional)
        pendingStartDate: a.datetime(), // Fecha del plan pendiente a activar
        planPrice: a.float(), // Precio del plan
        lastFourDigits: a.integer(), // Últimos 4 dígitos de la tarjeta
      })
      .authorization(allow => [
        allow.ownerDefinedIn('userId').to(['read', 'update', 'delete']),
        allow.authenticated().to(['create']),
      ]),

    UserStore: a
      .model({
        userId: a.string().required(), // Relaciona la tienda con el usuario
        storeId: a.string().required(), // Identificador único de la tienda
        storeName: a.string().required(), // Nombre de la tienda
        storeDescription: a.string(), // Descripción opcional de la tienda
        storeURL: a.string(), // URL o dominio asignado a la tienda (opcional)
        storeLocation: a.string(), // Ubicación de la tienda (opcional)
        storeLogo: a.string(), // URL de la imagen del logo de la tienda
        storeBanner: a.string(), // URL de la imagen del banner de la tienda
        storeTheme: a.string(), // Tema de la tienda (opcional)
        storeCurrency: a.string(), // Moneda de la tienda
        storeType: a.string(), // Tipo de tienda (física, virtual, etc.)
        storeStatus: a.string(), // Estado de la tienda (activa, inactiva, etc.)
        storePolicy: a.string(), // Política de la tienda (opcional)

        // Datos de contacto
        contactEmail: a.email(),
        contactPhone: a.phone(),
        contactName: a.string(),
        conctactIdentification: a.string(),
        contactIdentificationType: a.string(),

        // Almacena la dirección completa como JSON.
        // Ejemplo: { street: "Calle Falsa 123", city: "Ciudad", state: "Estado", zip: "12345", country: "País" }
        address: a.json(),

        // Configuración para integración con PayU, almacenada como JSON.
        // Ejemplo: { payuMerchantId: "merchant_001", payuApiKey: "apikey_abc", payuApiSecret: "secret_xyz", payuCurrency: "COP" }
        wompiConfig: a.json(),

        // Campo para el dominio propio personalizado (opcional)
        customDomain: a.string(),

        // Indica si el usuario completó el flujo de onboarding.
        onboardingCompleted: a.boolean().required(),
      })
      .authorization(allow => [
        // Solo el dueño (definido en 'userId') puede leer, actualizar o eliminar la tienda.
        allow.ownerDefinedIn('userId').to(['read', 'update', 'delete']),
        // Usuarios autenticados pueden crear el registro.
        allow.authenticated().to(['create']),
      ]),
  })
  .authorization(allow => [
    allow.resource(postConfirmation),
    allow.resource(webHookPlan),
    allow.resource(cancelPlan),
    allow.resource(planScheduler),
  ])

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
})
