import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend'
import { postConfirmation } from '../auth/post-confirmation/resource'
import { webHookPlan } from '../functions/webHookPlan/resource'
import { cancelPlan } from '../functions/cancelPlan/resource'
import { planScheduler } from '../functions/planScheduler/resource'
import { checkStoreName } from '../functions/checkStoreName/resource'
import { checkStoreDomain } from '../functions/checkStoreDomain/resource'
import { apiKeyManager } from '../functions/LambdaEncryptKeys/resource'

export const MODEL_ID = 'us.anthropic.claude-3-haiku-20240307-v1:0'

export const generateHaikuFunction = defineFunction({
  entry: './generateHaiku.ts',
  environment: {
    MODEL_ID,
  },
})

export const generateProductDescriptionFunction = defineFunction({
  entry: './generateProductDescription.ts',
  environment: {
    MODEL_ID,
  },
})

export const generatePriceSuggestionFunction = defineFunction({
  entry: './generatePriceSuggestion.ts',
  environment: {
    MODEL_ID,
  },
})

const schema = a
  .schema({
    generateHaiku: a
      .query()
      .arguments({ prompt: a.string().required() })
      .returns(a.string())
      .authorization(allow => [allow.publicApiKey()])
      .handler(a.handler.function(generateHaikuFunction)),

    generateProductDescription: a
      .query()
      .arguments({
        productName: a.string().required(),
        category: a.string(),
      })
      .returns(a.string())
      .authorization(allow => [allow.publicApiKey()])
      .handler(a.handler.function(generateProductDescriptionFunction)),

    generatePriceSuggestion: a
      .query()
      .arguments({
        productName: a.string().required(),
        category: a.string(),
      })
      .returns(a.json())
      .authorization(allow => [allow.publicApiKey()])
      .handler(a.handler.function(generatePriceSuggestionFunction)),

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
        storeLogo: a.string(), // URL de la imagen del logo de la tienda
        storeFavicon: a.string(), // URL de la imagen del favicon de la tienda
        storeBanner: a.string(), // URL de la imagen del banner de la tienda
        storeTheme: a.string(), // Tema de la tienda (opcional)
        storeCurrency: a.string(), // Moneda de la tienda
        storeType: a.string(), // Tipo de tienda (física, virtual, etc.)
        storeStatus: a.string(), // Estado de la tienda (activa, inactiva, etc.)
        storePolicy: a.string(), // Política de la tienda (opcional)
        storeAdress: a.string(), // Dirección de la tienda
        contactEmail: a.email(),
        contactPhone: a.float(),
        contactName: a.string(),
        conctactIdentification: a.string(),
        contactIdentificationType: a.string(),
        wompiConfig: a.json(),
        mercadoPagoConfig: a.json(),
        mastershopApiKey: a.string(),
        customDomain: a.string(),
        onboardingCompleted: a.boolean().required(),
        onboardingData: a.json(),
      })
      .authorization(allow => [allow.authenticated().to(['read', 'update', 'delete', 'create'])]),

    Product: a
      .model({
        id: a.id().required(),
        storeId: a.string().required(), // Relaciona el producto con la tienda
        name: a.string().required(), // Nombre del producto
        description: a.string(), // Descripción del producto
        price: a.float(), // Precio del producto
        compareAtPrice: a.float(), // Precio de comparación (opcional)
        costPerItem: a.float(), // Costo por artículo (opcional)
        sku: a.string(), // SKU del producto (opcional)
        barcode: a.string(), // Código de barras (opcional)
        quantity: a.integer(), // Cantidad en inventario
        category: a.string(), // Categoría del producto
        images: a.json(), // Array de imágenes [{url: string, alt: string}]
        attributes: a.json(), // Array de atributos [{name: string, values: string[]}]
        status: a.string(), // Estado: ACTIVE, INACTIVE, PENDING, DRAFT
        slug: a.string(), // URL amigable del producto
        featured: a.boolean(), // Producto destacado
        tags: a.json(), // Array de etiquetas
        variants: a.json(), // Variantes del producto
        supplier: a.string(), // Proveedor del producto
        owner: a.string().required(), // Usuario que creo el producto
      })
      .authorization(allow => [
        allow.ownerDefinedIn('owner').to(['update', 'delete', 'read', 'create']), // Solo el creador puede editar y eliminar
        allow.guest().to(['read']),
      ]),
  })
  .authorization(allow => [
    allow.resource(postConfirmation),
    allow.resource(webHookPlan),
    allow.resource(cancelPlan),
    allow.resource(planScheduler),
    allow.resource(checkStoreName),
    allow.resource(checkStoreDomain),
    allow.resource(apiKeyManager),
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
