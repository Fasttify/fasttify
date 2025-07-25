import { defineAuth, secret } from '@aws-amplify/backend';
import { customMessage } from './custom-message/resource';
import { webHookPlan } from '../functions/webHookPlan/resource';
import { postConfirmation } from './post-confirmation/resource';
import { planScheduler } from '../functions/planScheduler/resource';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  triggers: {
    customMessage,
    postConfirmation,
  },

  loginWith: {
    email: true,

    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),

        scopes: ['email', 'profile', 'openid'],
        attributeMapping: {
          email: 'email',
          nickname: 'name',
          profilePicture: 'picture',
        },
      },

      callbackUrls: ['http://localhost:3000', 'https://www.dev.fasttify.com/', 'https://www.fasttify.com/'],
      logoutUrls: [
        'http://localhost:3000/login',
        'https://www.dev.fasttify.com/login',
        'https://www.fasttify.com/login',
      ],
    },
  },

  userAttributes: {
    'custom:user_type': {
      mutable: true,
      dataType: 'String',
      maxLen: 50,
      minLen: 1,
    },
    'custom:store_id': {
      mutable: true,
      dataType: 'String',
      maxLen: 255,
      minLen: 1,
    },

    nickname: {
      mutable: true,
      required: false,
    },
    preferredUsername: {
      mutable: true,
      required: false,
    },
    'custom:plan': {
      mutable: true,
      dataType: 'String',
      maxLen: 255,
      minLen: 1,
    },

    'custom:bio': {
      mutable: true,
      dataType: 'String',
      maxLen: 255,
      minLen: 1,
    },
    'custom:phone': {
      mutable: true,
      dataType: 'String',
      maxLen: 255,
      minLen: 1,
    },
  },

  access: (allow) => [
    allow.resource(webHookPlan).to(['updateUserAttributes', 'getUser']),
    allow.resource(planScheduler).to(['updateUserAttributes', 'getUser']),
    allow.resource(postConfirmation).to(['updateUserAttributes', 'getUser']),
  ],
});
