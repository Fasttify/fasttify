import { defineStorage } from '@aws-amplify/backend'

/**
 * Configuración de almacenamiento para fotos de perfil
 * Este bucket es el predeterminado para la aplicación
 */
export const storage = defineStorage({
  name: 'profilePictures',
  isDefault: true,
  access: allow => ({
    'public/profile-pictures/{entity_id}/*': [
      // Cualquier usuario puede leer las fotos de perfil
      allow.guest.to(['read']),
      // Los usuarios autenticados pueden subir archivos
      allow.authenticated.to(['read', 'write']),
      // El propietario tiene control total sobre sus archivos
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'picture-submissions/*': [
      // Los usuarios autenticados pueden leer y escribir
      allow.authenticated.to(['read', 'write']),
      // Los invitados solo pueden leer
      allow.guest.to(['read']),
      // Solo el propietario puede eliminar sus archivos
      allow.entity('identity').to(['delete']),
    ],
  }),
})

/**
 * Configuración de almacenamiento para imágenes de productos
 * Bucket dedicado para almacenar todas las imágenes relacionadas con productos
 */
export const productsImages = defineStorage({
  name: 'productsImages',
  access: allow => ({
    'products/{entity_id}/*': [
      // Cualquier usuario puede ver las imágenes de productos
      allow.guest.to(['read']),
      // Los usuarios autenticados pueden subir imágenes
      allow.authenticated.to(['read', 'write']),
      // El propietario tiene control total sobre sus archivos
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'picture-submissions/*': [
      // Los usuarios autenticados pueden leer y escribir
      allow.authenticated.to(['read', 'write']),
      // Los invitados solo pueden leer
      allow.guest.to(['read']),
      // Solo el propietario puede eliminar sus archivos
      allow.entity('identity').to(['delete']),
    ],
  }),
})

/**
 * Configuración de almacenamiento para logos de tiendas
 * Bucket dedicado para almacenar logos e imágenes de identidad de las tiendas
 */
export const storeLogo = defineStorage({
  name: 'storeLogo',
  access: allow => ({
    'store/{entity_id}/*': [
      // Cualquier usuario puede ver los logos de tiendas
      allow.guest.to(['read']),
      // Los usuarios autenticados pueden subir logos
      allow.authenticated.to(['read', 'write']),
      // El propietario tiene control total sobre sus archivos
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'picture-submissions/*': [
      // Los usuarios autenticados pueden leer y escribir
      allow.authenticated.to(['read', 'write']),
      // Los invitados solo pueden leer
      allow.guest.to(['read']),
      // Solo el propietario puede eliminar sus archivos
      allow.entity('identity').to(['delete']),
    ],
  }),
})
