import { defineAuth, secret } from "@aws-amplify/backend";
import { customMessage } from "./custom-message/resource";
import { postAuthentication } from "./post-authentication/resource";
import { webHookPlan } from "../functions/webHookPlan/resource";
import { postConfirmation } from "./post-confirmation/resource";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  triggers: {
    customMessage,
    postConfirmation,
    preTokenGeneration: postAuthentication,
  },

  loginWith: {
    email: true,

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
    nickname: {
      mutable: true,
      required: false,
    },
    preferredUsername: {
      mutable: true,
      required: false,
    },
    "custom:plan": {
      mutable: true,
      dataType: "String",
      maxLen: 255,
      minLen: 1,
    },

    "custom:bio": {
      mutable: true,
      dataType: "String",
      maxLen: 255,
      minLen: 1,
    },
    "custom:phone": {
      mutable: true,
      dataType: "String",
      maxLen: 255,
      minLen: 1,
    },
  },

  access: (allow) => [
    allow.resource(postAuthentication).to(["updateUserAttributes"]),
    allow.resource(webHookPlan).to(["updateUserAttributes", "getUser"]),
  ],
});
