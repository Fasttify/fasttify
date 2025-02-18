import { defineStorage } from '@aws-amplify/backend'

export const storage = defineStorage({
  name: 'amplifyTeamDrive',
  access: allow => ({
    'public/profile-pictures/{entity_id}/*': [
      allow.guest.to(['read']), // Permite a los invitados leer
      allow.entity('identity').to(['read', 'write', 'delete']), // Permite al propietario (basado en identity id) leer, escribir y eliminar
    ],
    'picture-submissions/*': [allow.authenticated.to(['read', 'write']), allow.guest.to(['read'])],
  }),
})
