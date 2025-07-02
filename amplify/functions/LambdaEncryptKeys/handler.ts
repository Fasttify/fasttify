import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/apiKeyManager';
import { type Schema } from '../../data/resource';
import crypto from 'crypto';
import { getCorsHeaders } from '../shared/cors';
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

// Clave de cifrado desde variables de entorno
const ENCRYPTION_KEY = env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

/**
 * Cifra un texto usando AES-256-CBC
 */
function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Descifra un texto cifrado con AES-256-CBC
 */
function decrypt(encryptedText: string): string {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedData = textParts[1];

  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export const handler = async (event: any) => {
  const origin = event.headers?.origin || event.headers?.Origin;

  // Manejar peticiones OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    };
  }
  try {
    const {
      storeId,
      keyType,
      apiKey,
      keyField,
      operation,
      encryptedKey: inputEncryptedKey,
    } = event.body ? JSON.parse(event.body) : event;

    // Si la operación es descifrar, procesamos esa solicitud
    if (operation === 'decrypt' && inputEncryptedKey) {
      try {
        const decryptedKey = decrypt(inputEncryptedKey);
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, decryptedKey }),
          headers: getCorsHeaders(origin),
        };
      } catch (error) {
        console.error('Error al descifrar la clave:', error);
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, message: 'Error al descifrar la clave' }),
          headers: getCorsHeaders(origin),
        };
      }
    }

    // Validar parámetros para operación de cifrado (comportamiento predeterminado)
    if (!keyType || !apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Faltan parámetros requeridos' }),
        headers: getCorsHeaders(origin),
      };
    }

    // Si no hay storeId, solo cifrar y devolver (útil para cifrar antes de crear la tienda)
    if (!storeId) {
      const encryptedKey = encrypt(apiKey);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, encryptedKey }),
        headers: getCorsHeaders(origin),
      };
    }

    // Si hay storeId, cifrar y guardar en la tienda
    const { data: stores } = await client.models.UserStore.get({
      storeId: storeId,
    });

    if (!stores) {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: 'Tienda no encontrada' }),
        headers: getCorsHeaders(origin),
      };
    }

    const store = stores;

    // Cifrar la API Key
    const encryptedKey = encrypt(apiKey);

    // Actualizar la tienda según el tipo de clave
    const updateData: Record<string, string | boolean> = {};

    switch (keyType) {
      case 'mastershop':
        updateData.mastershopApiKey = encryptedKey;
        break;
      case 'wompi':
        // Para Wompi, actualizar el objeto JSON
        let wompiConfig: Record<string, string | boolean> = { isActive: true };

        if (store.wompiConfig) {
          try {
            const parsedConfig = JSON.parse(store.wompiConfig as string);
            if (typeof parsedConfig === 'object' && parsedConfig !== null) {
              wompiConfig = {
                ...wompiConfig,
                ...parsedConfig,
              };
            }
          } catch (e) {
            // Si no es un JSON válido, usar el objeto por defecto
          }
        }

        // Actualizar el campo específico (publicKey o signature)
        if (keyField === 'publicKey') {
          wompiConfig.publicKey = encryptedKey;
        } else if (keyField === 'signature') {
          wompiConfig.signature = encryptedKey;
        } else {
          // Si no se especifica, asumir publicKey
          wompiConfig.publicKey = encryptedKey;
        }

        updateData.wompiConfig = JSON.stringify(wompiConfig);
        break;
      case 'mercadopago':
        // Para Mercado Pago, actualizar el objeto JSON
        let mercadoPagoConfig: Record<string, string | boolean> = { isActive: true };

        if (store.mercadoPagoConfig) {
          try {
            const parsedConfig = JSON.parse(store.mercadoPagoConfig as string);
            if (typeof parsedConfig === 'object' && parsedConfig !== null) {
              mercadoPagoConfig = {
                ...mercadoPagoConfig,
                ...parsedConfig,
              };
            }
          } catch (e) {
            // Si no es un JSON válido, usar el objeto por defecto
          }
        }

        // Actualizar el campo específico (privateKey o publicKey)
        if (keyField === 'privateKey') {
          mercadoPagoConfig.privateKey = encryptedKey;
        } else if (keyField === 'publicKey') {
          mercadoPagoConfig.publicKey = encryptedKey;
        } else {
          // Si no se especifica, asumir privateKey
          mercadoPagoConfig.privateKey = encryptedKey;
        }

        updateData.mercadoPagoConfig = JSON.stringify(mercadoPagoConfig);
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, message: 'Tipo de clave API no soportado' }),
          headers: getCorsHeaders(origin),
        };
    }

    // Actualizar la tienda
    await client.models.UserStore.update({
      storeId: store.storeId,
      ...updateData,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, encryptedKey }),
      headers: getCorsHeaders(origin),
    };
  } catch (error) {
    console.error('Error en apiKeyManager:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Error interno del servidor' }),
      headers: getCorsHeaders(origin),
    };
  }
};
