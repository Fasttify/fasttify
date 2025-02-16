import { defineStorage } from '@aws-amplify/backend'

export const storage = defineStorage({
  name: 'amplifyTeamDrive',
  access: allow => ({
    'profile-pictures/{entity_id}/*': [
      allow.guest.to(['read']), // Permite a los invitados leer
      allow.entity('identity').to(['read', 'write', 'delete']), // Permite al propietario leer, escribir y eliminar
    ],
    'picture-submissions/*': [
      allow.authenticated.to(['read', 'write']), // Permite a los usuarios autenticados leer y escribir
      allow.guest.to(['read', 'write']), // Permite a los invitados leer y escribir
    ],
  }),
})
