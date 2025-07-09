import { a } from '@aws-amplify/backend';

export const orderModel = a
  .model({
    orderNumber: a.string().required(),
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
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
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read']),
        allow.publicApiKey().to(['create', 'read']),
      ]),
    store: a.belongsTo('UserStore', 'storeId'),
  })
  .secondaryIndexes((index) => [
    index('storeId'),
    index('customerId'),
    index('orderNumber'),
    index('status'),
    index('storeOwner'),
  ])
  .authorization((allow) => [
    allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update']),
    allow.publicApiKey().to(['create', 'read']),
  ]);
