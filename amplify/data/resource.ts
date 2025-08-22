import { type ClientSchema, a, defineData, defineFunction } from '@aws-amplify/backend';
import { postConfirmation } from '../auth/post-confirmation/resource';
import { checkStoreDomain } from '../functions/checkStoreDomain/resource';
import { createStoreTemplate } from '../functions/createStoreTemplate/resource';
import { managePaymentKeys } from '../functions/managePaymentKeys/resource';
import { planScheduler } from '../functions/planScheduler/resource';
import { webHookPlan } from '../functions/webHookPlan/resource';

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

export const MODEL_ID = 'us.anthropic.claude-3-haiku-20240307-v1:0';

export const generateHaikuFunction = defineFunction({
  entry: './functions/chat-generate/generateHaiku.ts',
  environment: {
    MODEL_ID,
  },
});

export const generateProductDescriptionFunction = defineFunction({
  entry: './functions/description-generate/generateProductDescription.ts',
  environment: {
    MODEL_ID,
  },
});

export const generatePriceSuggestionFunction = defineFunction({
  entry: './functions/price-suggestion/generatePriceSuggestion.ts',
  environment: {
    MODEL_ID,
  },
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
  })
  .authorization((allow) => [
    allow.resource(postConfirmation),
    allow.resource(webHookPlan),
    allow.resource(planScheduler),
    allow.resource(checkStoreDomain),
    allow.resource(createStoreTemplate),
    allow.resource(managePaymentKeys),
  ]);

// Schema completo incluyendo funciones de IA
const fullSchema = a
  .schema({
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
  })
  .authorization((allow) => [
    allow.resource(postConfirmation),
    allow.resource(webHookPlan),
    allow.resource(planScheduler),
    allow.resource(checkStoreDomain),
    allow.resource(createStoreTemplate),
    allow.resource(managePaymentKeys),
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
