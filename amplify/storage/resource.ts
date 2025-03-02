import { defineStorage } from '@aws-amplify/backend'

export const storage = defineStorage({
  name: 'profilePictures',
  access: allow => ({
    'public/profile-pictures/{entity_id}/*': [
      // Anyone can read profile pictures
      allow.guest.to(['read']),
      // Authenticated users can upload
      allow.authenticated.to(['read', 'write']),
      // Owner has full control over their files
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'picture-submissions/*': [
      allow.authenticated.to(['read', 'write']),
      allow.guest.to(['read']),
      allow.entity('identity').to(['delete']),
    ],
  }),
})
