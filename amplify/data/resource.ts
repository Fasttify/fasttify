import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend'
import { postConfirmation } from '../auth/post-confirmation/resource'
import { webHookPlan } from '../functions/webHookPlan/resource'
import { planScheduler } from '../functions/planScheduler/resource'
import { checkStoreName } from '../functions/checkStoreName/resource'
import { checkStoreDomain } from '../functions/checkStoreDomain/resource'
import { apiKeyManager } from '../functions/LambdaEncryptKeys/resource'
import { createStoreTemplate } from '../functions/createStoreTemplate/resource'

export const MODEL_ID = 'us.anthropic.claude-3-haiku-20240307-v1:0'

export const generateHaikuFunction = defineFunction({
  entry: './chat-generate/generateHaiku.ts',
  environment: {
    MODEL_ID,
  },
})

export const generateProductDescriptionFunction = defineFunction({
  entry: './description-generate/generateProductDescription.ts',
  environment: {
    MODEL_ID,
  },
})

export const generatePriceSuggestionFunction = defineFunction({
  entry: './price-suggestion/generatePriceSuggestion.ts',
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

    initializeStoreTemplate: a
      .mutation()
      .arguments({
        storeId: a.string().required(),
        domain: a.string().required(),
      })
      .returns(a.json())
      .authorization(allow => [allow.authenticated()])
      .handler(a.handler.function(createStoreTemplate)),

    UserProfile: a
      .model({
        email: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('profileOwner').to(['create']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        profileOwner: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('profileOwner').to(['create']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
      })
      .authorization(allow => [allow.ownerDefinedIn('profileOwner')]),

    UserSubscription: a
      .model({
        id: a
          .id()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
          ]),
        userId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['create', 'read', 'delete']),
          ]),
        subscriptionId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
          ]),
        planName: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
          ]),
        nextPaymentDate: a.datetime(),
        pendingPlan: a.string(),
        pendingStartDate: a.datetime(),
        planPrice: a.float(),
        lastFourDigits: a.integer(),
      })
      .identifier(['id'])
      .secondaryIndexes(index => [index('userId')])
      .authorization(allow => [
        allow.ownerDefinedIn('userId').to(['read', 'update', 'delete', 'create']),
        allow.authenticated().to(['create']),
      ]),

    UserStore: a
      .model({
        userId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['create', 'read', 'delete']),
            allow.authenticated().to(['create', 'read']),
            allow.publicApiKey().to(['read']),
            allow.guest().to(['read']),
          ]),
        storeId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
            allow.authenticated().to(['create', 'read']),
            allow.publicApiKey().to(['read']),
            allow.guest().to(['read']),
          ]),
        storeName: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
            allow.authenticated().to(['create', 'read', 'update']),
            allow.publicApiKey().to(['read']),
            allow.guest().to(['read']),
          ]),
        storeDescription: a.string(),
        storeLogo: a.string(),
        storeFavicon: a.string(),
        storeBanner: a.string(),
        storeTheme: a.string(),
        storeCurrency: a.string(),
        storeType: a.string(),
        storeStatus: a.boolean(),
        storePolicy: a.string(),
        storeAdress: a.string(),
        contactEmail: a.string(),
        contactPhone: a.float(),
        contactName: a.string(),
        conctactIdentification: a.string(),
        contactIdentificationType: a.string(),
        wompiConfig: a.json(),
        mercadoPagoConfig: a.json(),
        mastershopApiKey: a.string(),
        customDomain: a.string(),
        customDomainStatus: a.string(),
        customDomainVerifiedAt: a.datetime(),
        cloudFrontTenantId: a.string(),
        cloudFrontEndpoint: a.string(),
        onboardingCompleted: a
          .boolean()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
            allow.authenticated().to(['create', 'read', 'update']),
            allow.publicApiKey().to(['read']),
            allow.guest().to(['read']),
          ]),
        onboardingData: a.json(),
      })
      .identifier(['storeId'])
      .secondaryIndexes(index => [index('userId'), index('customDomain'), index('storeName')])
      .authorization(allow => [
        allow.authenticated().to(['read', 'update', 'delete', 'create']),
        allow.publicApiKey().to(['read']),
        allow.guest().to(['read']),
        allow.ownerDefinedIn('userId').to(['read', 'update', 'delete', 'create']),
      ]),

    Product: a
      .model({
        id: a
          .id()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        storeId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        name: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        description: a.string(),
        price: a.float(),
        compareAtPrice: a.float(),
        costPerItem: a.float(),
        sku: a.string(),
        barcode: a.string(),
        quantity: a.integer(),
        category: a.string(),
        images: a.json(),
        attributes: a.json(),
        status: a.string(),
        slug: a.string(),
        featured: a.boolean(),
        tags: a.json(),
        variants: a.json(),
        collectionId: a.string(),
        supplier: a.string(),
        collection: a.belongsTo('Collection', 'collectionId'),
        owner: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
      })
      .secondaryIndexes(index => [index('storeId'), index('collectionId')])
      .authorization(allow => [
        allow.ownerDefinedIn('owner').to(['update', 'delete', 'read', 'create']),
        allow.guest().to(['read']),
        allow.publicApiKey().to(['read']),
      ]),

    Collection: a
      .model({
        storeId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        title: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        description: a.string(),
        image: a.string(),
        slug: a.string(),
        isActive: a
          .boolean()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        sortOrder: a.integer(),
        owner: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        products: a.hasMany('Product', 'collectionId'),
      })
      .secondaryIndexes(index => [index('storeId'), index('title'), index('slug')])
      .authorization(allow => [
        allow.ownerDefinedIn('owner').to(['update', 'delete', 'read', 'create']),
        allow.guest().to(['read']),
        allow.publicApiKey().to(['read']),
      ]),

    NavigationMenu: a
      .model({
        id: a
          .id()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        storeId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        domain: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        name: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        handle: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        isMain: a
          .boolean()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        isActive: a
          .boolean()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        menuData: a
          .json()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        owner: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
      })
      .secondaryIndexes(index => [index('storeId'), index('handle'), index('domain')])
      .authorization(allow => [
        allow.ownerDefinedIn('owner').to(['update', 'delete', 'read', 'create']),
        allow.guest().to(['read']),
        allow.publicApiKey().to(['read']),
      ]),

    Page: a
      .model({
        id: a
          .id()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        storeId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        title: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        content: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        slug: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        metaTitle: a.string(),
        metaDescription: a.string(),
        status: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        isVisible: a
          .boolean()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        template: a.string(),
        owner: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
      })
      .secondaryIndexes(index => [index('storeId'), index('slug'), index('status')])
      .authorization(allow => [
        allow.ownerDefinedIn('owner').to(['update', 'delete', 'read', 'create']),
        allow.guest().to(['read']),
        allow.publicApiKey().to(['read']),
      ]),

    // Modelo para carritos de usuarios registrados
    Cart: a
      .model({
        userId: a
          .string()
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['create', 'read']),
            allow.publicApiKey().to(['read']),
          ]), // Para usuarios registrados
        sessionId: a
          .string()
          .authorization(allow => [allow.publicApiKey().to(['create', 'read', 'update'])]), // Para usuarios invitados
        storeId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['create', 'read']),
            allow.publicApiKey().to(['read']),
          ]),
        items: a.hasMany('CartItem', 'cartId'),
        totalAmount: a
          .float()
          .default(0)
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['read', 'update']),
            allow.publicApiKey().to(['read', 'update']),
          ]),
        itemCount: a
          .integer()
          .default(0)
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['read', 'update']),
            allow.publicApiKey().to(['read', 'update']),
          ]),
        currency: a
          .string()
          .default('COP')
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        expiresAt: a
          .datetime()
          .authorization(allow => [
            allow.ownerDefinedIn('userId').to(['read']),
            allow.publicApiKey().to(['read', 'update']),
          ]), // Para limpiar carritos abandonados
      })
      .secondaryIndexes(index => [
        index('userId'),
        index('sessionId'),
        index('storeId'),
        index('expiresAt'),
      ])
      .authorization(allow => [
        allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read', 'create', 'update']),
      ]),

    // Items individuales del carrito
    CartItem: a
      .model({
        cartId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read']),
            allow.publicApiKey().to(['read']),
          ]),
        cart: a.belongsTo('Cart', 'cartId'),
        productId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read']),
            allow.publicApiKey().to(['read']),
          ]),
        variantId: a
          .string()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read']),
            allow.publicApiKey().to(['read']),
          ]), // Para variantes del producto
        quantity: a
          .integer()
          .required()
          .default(1)
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update']),
            allow.publicApiKey().to(['read', 'update']),
          ]),
        unitPrice: a
          .float()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read']),
            allow.publicApiKey().to(['read']),
          ]),
        totalPrice: a
          .float()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update']),
            allow.publicApiKey().to(['read', 'update']),
          ]),
        productSnapshot: a
          .json()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read']),
            allow.publicApiKey().to(['read']),
          ]), // Snapshot del producto en el momento de agregarlo
        owner: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read']),
            allow.publicApiKey().to(['read']),
          ]),
      })
      .secondaryIndexes(index => [index('cartId'), index('productId')])
      .authorization(allow => [
        allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
        allow.publicApiKey().to(['read', 'create', 'update', 'delete']),
      ]),

    // Órdenes completadas
    Order: a
      .model({
        orderNumber: a.string().required(),
        storeId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
            allow.publicApiKey().to(['read']),
          ]),
        customerId: a.string(), // Puede ser userId o sessionId
        customerType: a.enum(['registered', 'guest']),
        items: a.hasMany('OrderItem', 'orderId'),
        subtotal: a.float().required(),
        shippingCost: a.float().default(0),
        taxAmount: a.float().default(0),
        totalAmount: a.float().required(),
        currency: a.string().default('USD'),
        status: a.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
        paymentStatus: a.enum(['pending', 'paid', 'failed', 'refunded']),
        paymentMethod: a.string(),
        paymentId: a.string(), // ID de la transacción del gateway de pago
        shippingAddress: a.json(),
        billingAddress: a.json(),
        customerInfo: a.json(), // Email, nombre, teléfono
        notes: a.string(),
        storeOwner: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
            allow.publicApiKey().to(['create', 'read']),
          ]),
      })
      .secondaryIndexes(index => [
        index('storeId'),
        index('customerId'),
        index('orderNumber'),
        index('status'),
        index('storeOwner'),
      ])
      .authorization(allow => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update']),
        allow.publicApiKey().to(['create', 'read']),
      ]),

    // Items de las órdenes
    OrderItem: a
      .model({
        orderId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
            allow.publicApiKey().to(['create', 'read']),
          ]),
        order: a.belongsTo('Order', 'orderId'),
        productId: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
            allow.publicApiKey().to(['create', 'read']),
          ]),
        variantId: a
          .string()
          .authorization(allow => [
            allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
            allow.publicApiKey().to(['create', 'read']),
          ]),
        quantity: a
          .integer()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
            allow.publicApiKey().to(['create', 'read']),
          ]),
        unitPrice: a
          .float()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
            allow.publicApiKey().to(['create', 'read']),
          ]),
        totalPrice: a
          .float()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
            allow.publicApiKey().to(['create', 'read']),
          ]),
        productSnapshot: a
          .json()
          .authorization(allow => [
            allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
            allow.publicApiKey().to(['create', 'read']),
          ]), // Snapshot completo del producto
        storeOwner: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
            allow.publicApiKey().to(['create', 'read']),
          ]),
      })
      .secondaryIndexes(index => [index('orderId'), index('productId')])
      .authorization(allow => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
  })
  .authorization(allow => [
    allow.resource(postConfirmation),
    allow.resource(webHookPlan),
    allow.resource(planScheduler),
    allow.resource(checkStoreName),
    allow.resource(checkStoreDomain),
    allow.resource(apiKeyManager),
    allow.resource(createStoreTemplate),
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
