import { a } from '@aws-amplify/backend';

export const couponUsageModel = a
  .model({
    couponId: a
      .string()
      .required()
      .authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]),
    storeId: a
      .string()
      .required()
      .authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]),
    orderId: a.string().authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]),
    customerId: a
      .string()
      .authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]), // userId o sessionId
    customerEmail: a
      .string()
      .authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]),
    discountAmount: a
      .float()
      .required()
      .authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]), // Monto real descontado
    orderSubtotal: a
      .float()
      .required()
      .authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]), // Subtotal al momento de uso
    couponCode: a
      .string()
      .required()
      .authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]), // Código desnormalizado para reporting
    storeOwner: a
      .string()
      .required()
      .authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]),

    // Relationships
    coupon: a
      .belongsTo('Coupon', 'couponId')
      .authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]),
    order: a
      .belongsTo('Order', 'orderId')
      .authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]),
    store: a
      .belongsTo('UserStore', 'storeId')
      .authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]),
  })
  .secondaryIndexes((index) => [
    index('couponId'),
    index('storeId'),
    index('orderId'),
    index('customerId'),
    index('storeOwner'),
  ])
  .authorization((allow) => [allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete'])]);
