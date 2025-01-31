import type { PostAuthenticationTriggerHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient();

export const handler: PostAuthenticationTriggerHandler = async (event) => {
  console.log("PostAuthentication event:", JSON.stringify(event, null, 2));

  // Solo proceder si es un inicio de sesión con Google
  const identitiesAttr = event.request.userAttributes["identities"];
  if (!identitiesAttr) {
    console.log(
      "El atributo 'identities' no está presente. Terminando ejecución."
    );
    return event;
  }

  const identities = JSON.parse(identitiesAttr);
  const isGoogleLogin = identities.some(
    (identity: any) => identity.providerName === "Google"
  );

  if (!isGoogleLogin) {
    console.log(
      "El usuario no inició sesión con Google. Terminando ejecución."
    );
    return event;
  }

  // Verificar si el email está verificado
  if (event.request.userAttributes["email_verified"] !== "true") {
    console.log("El email no está verificado. Verificando el email...");

    try {
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: event.userPoolId,
        Username: event.userName,
        UserAttributes: [
          {
            Name: "email_verified", 
            Value: "true",
          },
        ],
      });

      await client.send(command);
      console.log("Email verificado exitosamente.");
    } catch (error) {
      console.error("Error al verificar el email del usuario:", error);
    }
  }

  // Verificar si el usuario ya tiene un plan asignado
  if (event.request.userAttributes["custom:plan"]) {
    console.log("El usuario ya tiene un plan asignado. Terminando ejecución.");
    return event;
  }

  // Asignar plan 'free'
  try {
    console.log("Asignando plan 'free' al usuario...");
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: event.userPoolId,
      Username: event.userName,
      UserAttributes: [
        {
          Name: "custom:plan",
          Value: "free",
        },
      ],
    });

    await client.send(command);

    // Agregar el atributo al evento
    event.request.userAttributes["custom:plan"] = "free";
    console.log("Plan 'free' asignado exitosamente.");
  } catch (error) {
    console.error("Error actualizando atributos del usuario:", error);
  }

  return event;
};
