import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend';
import { postConfirmation } from '../auth/post-confirmation/resource';
import { checkStoreDomain } from '../functions/checkStoreDomain/resource';
import { createStoreTemplate } from '../functions/createStoreTemplate/resource';
import { managePaymentKeys } from '../functions/managePaymentKeys/resource';
import { onboardingProgress } from '../functions/onboardingProgress/resource';
import { planScheduler } from '../functions/planScheduler/resource';
import { webHookPlan } from '../functions/webHookPlan/resource';
import { validateStoreLimits } from '../functions/validateStoreLimits/resource';

// Importacion de modelos
import { cartModel } from './models/cart';
import { cartItemModel } from './models/cart-item';
import { checkoutSessionModel } from './models/checkout-session';
import { collectionModel } from './models/collection';
import { navigationMenuModel } from './models/navigation-menu';
import { orderModel } from './models/order';
import { orderItemModel } from './models/order-item';
import { pageModel } from './models/page';
import { productModel } from './models/product';
import { storeCustomDomainModel } from './models/store-custom-domain';
import { storePaymentConfigModel } from './models/store-payment-config';
import { userProfileModel } from './models/user-profile';
import { userStoreModel } from './models/user-store';
import { userSubscriptionModel } from './models/user-subscription';
import { userThemeModel } from './models/user-theme';
import { notificationModel } from './models/notification';
import { notificationReturnModel } from './models/notification-return';
import { productDeleteReturnModel } from './models/product-delete-return';
import { orderDeleteReturnModel } from './models/order-delete-return';
import { checkoutDeleteReturnModel } from './models/checkout-delete-return';
import { storeAnalyticsModel } from './models/store-analytics';
import { CHAT_GENERATION_SYSTEM_PROMPT } from './functions/chat-generate/systemPrompt';

export const MODEL_ID = 'us.amazon.nova-pro-v1:0';

export const generateHaikuFunction = defineFunction({
  entry: './functions/chat-generate/generateHaiku.ts',
  resourceGroupName: 'ai-functions',
  timeoutSeconds: 30,
  environment: {
    MODEL_ID,
  },
});

export const generateProductDescriptionFunction = defineFunction({
  entry: './functions/description-generate/generateProductDescription.ts',
  resourceGroupName: 'ai-functions',
  timeoutSeconds: 30,
  environment: {
    MODEL_ID,
  },
});

export const generatePriceSuggestionFunction = defineFunction({
  entry: './functions/price-suggestion/generatePriceSuggestion.ts',
  resourceGroupName: 'ai-functions',
  timeoutSeconds: 30,
  environment: {
    MODEL_ID,
  },
});

export const createProduct = defineFunction({
  name: 'createProduct',
  entry: './functions/createProduct/createProduct.ts',
  timeoutSeconds: 30,
});

// Definir el tipo de entrada para la mutación de pago
const PaymentConfigInput = a.customType({
  storeId: a.string(),
  gatewayType: a.string(),
  publicKey: a.string(),
  privateKey: a.string(),
  isActive: a.boolean(),
});

// Definir el tipo de retorno para la mutación de pago
const PaymentConfigResult = a.customType({
  success: a.boolean().required(),
  message: a.string(),
});

// Schema solo para el store (sin funciones de IA)
export const storeSchema = a
  .schema({
    // Solo modelos del store
    UserProfile: userProfileModel,
    UserSubscription: userSubscriptionModel,
    UserStore: userStoreModel,
    Product: productModel,
    Collection: collectionModel,
    NavigationMenu: navigationMenuModel,
    Page: pageModel,
    Cart: cartModel,
    CartItem: cartItemModel,
    CheckoutSession: checkoutSessionModel,
    Order: orderModel,
    OrderItem: orderItemModel,
    StorePaymentConfig: storePaymentConfigModel,
    StoreCustomDomain: storeCustomDomainModel,
    UserTheme: userThemeModel,
    Notification: notificationModel,
    NotificationReturn: notificationReturnModel,
    StoreAnalytics: storeAnalyticsModel,
  })
  .authorization((allow) => [
    allow.resource(postConfirmation),
    allow.resource(webHookPlan),
    allow.resource(planScheduler),
    allow.resource(checkStoreDomain),
    allow.resource(createStoreTemplate),
    allow.resource(managePaymentKeys),
    allow.resource(onboardingProgress),
    allow.resource(validateStoreLimits),
  ]);

// Schema completo incluyendo funciones de IA
const fullSchema = a
  .schema({
    chat: a
      .conversation({
        aiModel: {
          resourcePath: MODEL_ID,
        },
        systemPrompt: CHAT_GENERATION_SYSTEM_PROMPT,
        tools: [
          a.ai.dataTool({
            // The name of the tool as it will be referenced in the message to the LLM
            name: 'ProductQuery',
            // The description of the tool provided to the LLM.
            // Use this to help the LLM understand when to use the tool.
            description: 'Searches for Product records',
            // A reference to the `a.model()` that the tool will use
            model: a.ref('Product'),
            // The operation to perform on the model
            modelOperation: 'list',
          }),
          a.ai.dataTool({
            // The name of the tool as it will be referenced in the LLM prompt
            name: 'create_product',
            // The description of the tool provided to the LLM.
            // Use this to help the LLM understand when to use the tool.
            description:
              'Creates a new product in the store. Use this when the user wants to add a new product to their inventory.',
            // A reference to the `a.query()` that the tool will invoke.
            query: a.ref('createProduct'),
          }),
        ],
      })
      .authorization((allow) => allow.owner().to(['create', 'read', 'update', 'delete'])),

    // Funciones de IA
    generateHaiku: a
      .query()
      .arguments({ prompt: a.string().required() })
      .returns(a.string())
      .authorization((allow) => [allow.publicApiKey()])
      .handler(a.handler.function(generateHaikuFunction)),

    generateProductDescription: a
      .query()
      .arguments({
        productName: a.string().required(),
        category: a.string(),
      })
      .returns(a.string())
      .authorization((allow) => [allow.publicApiKey()])
      .handler(a.handler.function(generateProductDescriptionFunction)),

    generatePriceSuggestion: a
      .query()
      .arguments({
        productName: a.string().required(),
        category: a.string(),
      })
      .returns(a.json())
      .authorization((allow) => [allow.publicApiKey()])
      .handler(a.handler.function(generatePriceSuggestionFunction)),

    createProduct: a
      .query()
      .arguments({
        name: a.string().required(),
        nameLowercase: a.string().required(),
        description: a.string(),
        price: a.float(),
        quantity: a.integer(),
        category: a.string().required(),
        images: a.json(),
        attributes: a.json(),
        status: a.string().required(),
        slug: a.string(),
        featured: a.boolean(),
        tags: a.json(),
        variants: a.json(),
        supplier: a.string(),
        storeId: a.string(),
        owner: a.string(),
      })
      .returns(
        a.customType({
          success: a.boolean().required(),
          product: a.json(),
          message: a.string(),
        })
      )
      .authorization((allow) => allow.authenticated())
      .handler(a.handler.function(createProduct)),

    initializeStoreTemplate: a
      .mutation()
      .arguments({
        storeId: a.string().required(),
        domain: a.string().required(),
      })
      .returns(a.json())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(createStoreTemplate)),

    processStorePaymentConfig: a
      .mutation()
      .arguments({ action: a.string(), input: PaymentConfigInput })
      .returns(PaymentConfigResult)
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(managePaymentKeys)),

    trackOnboardingProgress: a
      .mutation()
      .arguments({
        storeId: a.string().required(),
        taskId: a.integer().required(),
        taskTitle: a.string().required(),
        action: a.enum(['completed', 'uncompleted']),
        userId: a.string(),
        timestamp: a.string(),
      })
      .returns(a.json())
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(onboardingProgress)),

    BatchMarkNotificationsAsRead: a
      .mutation()
      .arguments({
        notificationIds: a.string().array().required(),
      })
      .returns(a.ref('NotificationReturn').array())
      .authorization((allow) => [allow.authenticated()])
      .handler(
        a.handler.custom({
          dataSource: a.ref('Notification'),
          entry: './functions/batchs/BatchMarkNotificationsAsReadHandler.js',
        })
      ),

    BatchDeleteProducts: a
      .mutation()
      .arguments({
        productIds: a.string().array().required(),
      })
      .returns(a.ref('ProductDeleteReturn').array())
      .authorization((allow) => [allow.authenticated()])
      .handler(
        a.handler.custom({
          dataSource: a.ref('Product'),
          entry: './functions/batchs/BatchDeleteProductsHandler.js',
        })
      ),

    BatchDeleteOrders: a
      .mutation()
      .arguments({
        orderIds: a.string().array().required(),
      })
      .returns(a.ref('OrderDeleteReturn').array())
      .authorization((allow) => [allow.authenticated()])
      .handler(
        a.handler.custom({
          dataSource: a.ref('Order'),
          entry: './functions/batchs/BatchDeleteOrdersHandler.js',
        })
      ),

    BatchDeleteCheckouts: a
      .mutation()
      .arguments({
        checkoutIds: a.string().array().required(),
      })
      .returns(a.ref('CheckoutDeleteReturn').array())
      .authorization((allow) => [allow.authenticated()])
      .handler(
        a.handler.custom({
          dataSource: a.ref('CheckoutSession'),
          entry: './functions/batchs/BatchDeleteCheckoutsHandler.js',
        })
      ),

    // Modelos del store
    UserProfile: userProfileModel,
    UserSubscription: userSubscriptionModel,
    UserStore: userStoreModel,
    Product: productModel,
    Collection: collectionModel,
    NavigationMenu: navigationMenuModel,
    Page: pageModel,
    Cart: cartModel,
    CartItem: cartItemModel,
    CheckoutSession: checkoutSessionModel,
    Order: orderModel,
    OrderItem: orderItemModel,
    StorePaymentConfig: storePaymentConfigModel,
    StoreCustomDomain: storeCustomDomainModel,
    UserTheme: userThemeModel,
    Notification: notificationModel,
    NotificationReturn: notificationReturnModel,
    ProductDeleteReturn: productDeleteReturnModel,
    OrderDeleteReturn: orderDeleteReturnModel,
    CheckoutDeleteReturn: checkoutDeleteReturnModel,
    StoreAnalytics: storeAnalyticsModel,
  })
  .authorization((allow) => [
    allow.resource(postConfirmation),
    allow.resource(webHookPlan),
    allow.resource(planScheduler),
    allow.resource(checkStoreDomain),
    allow.resource(createStoreTemplate),
    allow.resource(managePaymentKeys),
    allow.resource(onboardingProgress),
    allow.resource(validateStoreLimits),
  ]);

// Tipos separados para mejorar rendimiento del linter
export type StoreSchema = ClientSchema<typeof storeSchema>;
export type FullSchema = ClientSchema<typeof fullSchema>;

// Para compatibilidad, mantenemos Schema como el completo
export type Schema = FullSchema;

export const data = defineData({
  schema: fullSchema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
