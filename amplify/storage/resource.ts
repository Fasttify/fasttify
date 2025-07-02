import { defineStorage } from '@aws-amplify/backend';

/**
 * Configuración de almacenamiento para almacenar archivos en S3
 * Este bucket es el predeterminado para la aplicación
 */
export const storage = defineStorage({
  name: 'fasttifyAssets',
  isDefault: true,
  access: (allow) => ({
    'profile-pictures/{entity_id}/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write']),
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'products/{entity_id}/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write']),
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'store-logos/{entity_id}/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write']),
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'templates/{entity_id}/*': [allow.guest.to(['read']), allow.authenticated.to(['read', 'write'])],
    'picture-submissions/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write']),
      allow.entity('identity').to(['delete']),
    ],
  }),
});
