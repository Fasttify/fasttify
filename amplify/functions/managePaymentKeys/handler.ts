import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/managePaymentKeys';
import { type StoreSchema } from '../../data/resource';

const kmsClient = new KMSClient();

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const clientSchema = generateClient<StoreSchema>();

interface PaymentConfigInput {
  storeId: string;
  gatewayType: 'mercadoPago' | 'wompi';
  publicKey: string;
  privateKey: string;
  isActive: boolean;
}

export const handler = async (event: any) => {
  const { action, input }: { action: 'create' | 'update' | 'decrypt'; input: PaymentConfigInput } = event.arguments;

  const kmsKeyAlias = process.env.KMS_KEY_ALIAS;

  if (!kmsKeyAlias) {
    return { success: false, message: 'KMS_KEY_ALIAS environment variable is not set.' };
  }

  try {
    switch (action) {
      case 'create':
      case 'update': {
        const { storeId, gatewayType, publicKey, privateKey, isActive } = input;

        // Encriptar las claves
        const encryptPublicKeyCommand = new EncryptCommand({
          KeyId: kmsKeyAlias,
          Plaintext: Buffer.from(publicKey || ''), // Asegura que no sea null
        });
        const encryptedPublicKeyResult = await kmsClient.send(encryptPublicKeyCommand);
        const publicKeyEncrypted = encryptedPublicKeyResult.CiphertextBlob
          ? Buffer.from(encryptedPublicKeyResult.CiphertextBlob).toString('base64')
          : '';

        const encryptPrivateKeyCommand = new EncryptCommand({
          KeyId: kmsKeyAlias,
          Plaintext: Buffer.from(privateKey || ''), // Asegura que no sea null
        });
        const encryptedPrivateKeyResult = await kmsClient.send(encryptPrivateKeyCommand);
        const privateKeyEncrypted = encryptedPrivateKeyResult.CiphertextBlob
          ? Buffer.from(encryptedPrivateKeyResult.CiphertextBlob).toString('base64')
          : '';

        // Guardar en DynamoDB usando clientSchema.models.StorePaymentConfig
        const item = {
          storeId,
          gatewayType,
          publicKeyEncrypted,
          privateKeyEncrypted,
          isActive,
        };

        // Intentar actualizar primero, si no existe, crear
        const { data: existingConfig } = await clientSchema.models.StorePaymentConfig.get({ storeId, gatewayType });

        if (existingConfig) {
          const { data, errors } = await clientSchema.models.StorePaymentConfig.update(item);
          if (errors) console.error('Error updating payment config:', errors);
          return { success: !errors, message: `${action} operation successful.`, data };
        } else {
          const { data, errors } = await clientSchema.models.StorePaymentConfig.create(item);
          if (errors) console.error('Error creating payment config:', errors);
          return { success: !errors, message: `${action} operation successful.`, data };
        }
      }
      case 'decrypt': {
        const { storeId, gatewayType } = input;

        // Obtener de DynamoDB usando clientSchema.models.StorePaymentConfig
        const { data: Item, errors } = await clientSchema.models.StorePaymentConfig.get({ storeId, gatewayType });

        if (errors) console.error('Error getting payment config for decryption:', errors);

        if (!Item || !Item.publicKeyEncrypted || !Item.privateKeyEncrypted) {
          throw new Error('Payment configuration not found or keys are missing.');
        }

        // Desencriptar las claves
        const decryptPublicKeyCommand = new DecryptCommand({
          CiphertextBlob: Buffer.from(Item.publicKeyEncrypted, 'base64'),
        });
        const decryptedPublicKeyResult = await kmsClient.send(decryptPublicKeyCommand);
        const publicKey = decryptedPublicKeyResult.Plaintext
          ? Buffer.from(decryptedPublicKeyResult.Plaintext).toString('utf8')
          : '';

        const decryptPrivateKeyCommand = new DecryptCommand({
          CiphertextBlob: Buffer.from(Item.privateKeyEncrypted, 'base64'),
        });
        const decryptedPrivateKeyResult = await kmsClient.send(decryptPrivateKeyCommand);
        const privateKey = decryptedPrivateKeyResult.Plaintext
          ? Buffer.from(decryptedPrivateKeyResult.Plaintext).toString('utf8')
          : '';

        return { success: true, publicKey, privateKey };
      }
      default:
        throw new Error('Action not supported.');
    }
  } catch (error) {
    console.error('Error in the Lambda function:', error);
    return { success: false, message: (error as Error).message };
  }
};
