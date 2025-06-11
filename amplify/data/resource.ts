import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend'
import { postConfirmation } from '../auth/post-confirmation/resource'
import { webHookPlan } from '../functions/webHookPlan/resource'
import { cancelPlan } from '../functions/cancelPlan/resource'
import { planScheduler } from '../functions/planScheduler/resource'
import { checkStoreName } from '../functions/checkStoreName/resource'
import { checkStoreDomain } from '../functions/checkStoreDomain/resource'
import { apiKeyManager } from '../functions/LambdaEncryptKeys/resource'
import { getStoreProducts } from '../functions/getStoreProducts/resource'
import { getStoreData } from '../functions/getStoreData/resource'
import { getStoreCollections } from '../functions/getStoreCollections/resource'
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
        storeStatus: a.string(),
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
      .secondaryIndexes(index => [index('storeId'), index('title')])
      .authorization(allow => [
        allow.ownerDefinedIn('owner').to(['update', 'delete', 'read', 'create']),
        allow.guest().to(['read']),
        allow.publicApiKey().to(['read']),
      ]),

    StoreTemplate: a
      .model({
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
        templateKey: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'update', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
        templateData: a
          .json()
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
        lastUpdated: a.datetime(),
        owner: a
          .string()
          .required()
          .authorization(allow => [
            allow.ownerDefinedIn('owner').to(['create', 'read', 'delete']),
            allow.guest().to(['read']),
            allow.publicApiKey().to(['read']),
          ]),
      })
      .identifier(['storeId'])
      .secondaryIndexes(index => [index('domain')])
      .authorization(allow => [
        allow.ownerDefinedIn('owner').to(['update', 'delete', 'read', 'create']),
        allow.guest().to(['read']),
        allow.publicApiKey().to(['read']),
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
    allow.resource(getStoreProducts),
    allow.resource(getStoreData),
    allow.resource(getStoreCollections),
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
