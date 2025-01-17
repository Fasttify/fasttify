import { defineAuth, secret } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,

    externalProviders: {
      google: {
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),

        scopes: ["email", "profile", "openid"],
      },

      callbackUrls: ["https://dev.d3ec9adgouri1.amplifyapp.com/landing"],
      logoutUrls: ["https://dev.d3ec9adgouri1.amplifyapp.com/"],
    },
  },

  userAttributes: {
    preferredUsername: {
      mutable: true,
      required: false,
    },
  },
});
