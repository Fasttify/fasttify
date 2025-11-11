import { a } from '@aws-amplify/backend';

/**
 * Modelo: WebSocket Connection
 * Almacena conexiones WebSocket activas para soportar múltiples instancias de Lambda
 * GSI en storeIdTemplateType para búsquedas eficientes por storeId:templateType
 */
export const websocketConnectionModel = a
  .model({
    connectionId: a.id().required(),
    storeId: a.string().required(),
    templateType: a.string().required(),
    connectedAt: a.datetime().required(),
    storeIdTemplateType: a.string().required(), // GSI key: storeId#templateType
    ttl: a.integer(), // TTL para limpiar conexiones muertas automáticamente
  })
  .authorization((allow) => [
    allow.authenticated().to(['read', 'create', 'update', 'delete']),
    allow.publicApiKey().to(['read', 'create', 'update', 'delete']),
  ])
  .identifier(['connectionId'])
  .secondaryIndexes((index) => [
    index('storeIdTemplateType').queryField('listWebSocketConnectionByStoreIdTemplateType'),
  ]);
