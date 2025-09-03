import { a } from '@aws-amplify/backend';

export const orderModel = a
  .model({
    orderNumber: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    customerId: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]), // Puede ser userId o sessionId
    customerType: a.enum(['registered', 'guest']),
    customerEmail: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    items: a
      .hasMany('OrderItem', 'orderId')
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    subtotal: a
      .float()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    shippingCost: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    taxAmount: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    totalAmount: a
      .float()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    compareAtPrice: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]), // Precio total de comparación (descuento)
    currency: a
      .string()
      .default('COP')
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    status: a.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    paymentStatus: a.enum(['pending', 'paid', 'failed', 'refunded']),
    paymentMethod: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    paymentId: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]), // ID de la transacción del gateway de pago
    shippingAddress: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    billingAddress: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    customerInfo: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]), // Email, nombre, teléfono
    notes: a
      .string()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    storeOwner: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    store: a
      .belongsTo('UserStore', 'storeId')
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    notifications: a
      .hasMany('Notification', 'orderId')
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
  })
  .secondaryIndexes((index) => [
    index('storeId'),
    index('customerId'),
    index('orderNumber'),
    index('status'),
    index('storeOwner'),
    index('customerEmail'),
  ])
  .authorization((allow) => [
    allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
    allow.publicApiKey().to(['create', 'read']),
  ]);
