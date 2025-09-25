import { a } from '@aws-amplify/backend';

export const storeAnalyticsModel = a
  .model({
    // Identificadores
    storeId: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),

    // Período de tiempo
    date: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // Formato: "2024-01-15"
    period: a.enum(['daily', 'weekly', 'monthly', 'yearly']),

    // Métricas de Ventas
    totalRevenue: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),
    totalOrders: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),
    averageOrderValue: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),

    // Métricas de Clientes
    newCustomers: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),
    returningCustomers: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),
    totalCustomers: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),

    // Métricas de Productos
    totalProductsSold: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),
    uniqueProductsSold: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),

    // Métricas de Conversión
    storeViews: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // Si implementas tracking de visitas
    conversionRate: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),

    // Métricas de Inventario
    lowStockAlerts: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),
    outOfStockProducts: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),

    // Métricas de Descuentos
    totalDiscounts: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),
    discountPercentage: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),

    // Métricas Geográficas
    countries: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // { "CO": 150, "US": 75, "MX": 25 }

    // Métricas de Sesiones por Ubicación
    sessionsByCountry: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // { "CO": 200, "US": 100, "MX": 50 }

    // Métricas de Visitantes Únicos por País
    uniqueVisitorsByCountry: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // { "CO": 150, "US": 75, "MX": 25 }

    // Métricas de Conversión por País
    conversionRateByCountry: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // { "CO": 5.2, "US": 3.8, "MX": 4.1 }

    // Métricas de Dispositivos
    sessionsByDevice: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // { "mobile": 300, "desktop": 150, "tablet": 50 }

    // Métricas de Navegadores
    sessionsByBrowser: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // { "chrome": 350, "safari": 100, "firefox": 50 }

    // Métricas de Referrers
    sessionsByReferrer: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // { "google": 200, "facebook": 100, "direct": 150 }

    // Métricas de Tiempo en Página
    avgTimeOnPage: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // Tiempo promedio en segundos

    // Métricas de Bounce Rate
    bounceRate: a
      .float()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // Porcentaje de rebote

    // Métricas de Visitantes Únicos
    uniqueVisitors: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // Visitantes únicos del día

    // Métricas de Sesiones
    totalSessions: a
      .integer()
      .default(0)
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // Total de sesiones del día

    // Métricas de Métodos de Pago
    paymentMethods: a
      .json()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]), // { "credit_card": 120, "paypal": 30 }

    // Relaciones
    store: a.belongsTo('UserStore', 'storeId'),
    storeOwner: a
      .string()
      .required()
      .authorization((allow) => [
        allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'delete']),
        allow.publicApiKey().to(['create', 'read', 'update']),
      ]),
  })
  .secondaryIndexes((index) => [
    index('storeId').queryField('analyticsByStore'),
    index('date').queryField('analyticsByDate'),
    index('period').queryField('analyticsByPeriod'),
    index('storeId').sortKeys(['date']).queryField('analyticsByStoreAndDate'),
    index('storeId').sortKeys(['period']).queryField('analyticsByStoreAndPeriod'),
  ])
  .authorization((allow) => [
    allow.ownerDefinedIn('storeOwner').to(['create', 'read', 'update', 'delete']),
    allow.publicApiKey().to(['create', 'read', 'update']),
  ]);
