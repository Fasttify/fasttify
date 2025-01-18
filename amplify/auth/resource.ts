import { defineAuth, secret } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Bienvenido!",
      verificationEmailBody: (createCode) =>
        `Usa este codigo para confirmar tu cuenta: ${createCode()}`,
    },

    externalProviders: {
      google: {
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),

        scopes: ["email", "profile", "openid"],
        attributeMapping: {
          email: "email",
          nickname: "name",
          profilePicture: "picture",
        },
      },

      callbackUrls: ["http://localhost:3000"],
      logoutUrls: ["http://localhost:3000/login"],
    },
  },

  userAttributes: {
    preferredUsername: {
      mutable: true,
      required: false,
    },
  },
});
