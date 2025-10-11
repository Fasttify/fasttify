import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { Amplify } from 'aws-amplify';
import { getCorsHeaders } from '../shared/cors';
import { generateClient } from 'aws-amplify/data';
import { env } from '$amplify/env/validate-store-limits';
import type { StoreSchema } from '../../data/resource';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<StoreSchema>();
const cognitoClient = new CognitoIdentityProviderClient();
const userPoolId = env.USER_POOL_ID;

// Límites de tiendas por plan
const STORE_LIMITS = {
  Imperial: 5,
  Majestic: 3,
  Royal: 1,
  free: 0,
} as const;

interface ValidateStoreLimitsInput {
  userId: string;
  userPoolId?: string;
  headers?: {
    origin?: string;
    Origin?: string;
  };
  httpMethod?: string;
  body?: string;
}

interface ValidateStoreLimitsResult {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
}

/**
 * Handler para validar límites de creación de tiendas por plan
 */
export const handler = async (event: ValidateStoreLimitsInput): Promise<ValidateStoreLimitsResult> => {
  const origin = event.headers?.origin || event.headers?.Origin;
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    };
  }

  let userId: string;

  try {
    if (event.body) {
      // Parsear el body que puede estar doblemente codificado
      let bodyData;
      try {
        bodyData = JSON.parse(event.body);
        // Si el resultado sigue siendo una cadena, parsearlo de nuevo
        if (typeof bodyData === 'string') {
          bodyData = JSON.parse(bodyData);
        }
      } catch {
        // Si falla, intentar parsear directamente
        bodyData = JSON.parse(event.body);
      }
      userId = bodyData.userId;
    } else {
      userId = event.userId;
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    userId = event.userId;
  }
  try {
    const poolId = userPoolId;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          canCreateStore: false,
          currentCount: 0,
          limit: 0,
          plan: 'unknown',
          error: 'userId is required',
        }),
        headers: getCorsHeaders(origin),
      };
    }

    // Obtener plan del usuario desde Cognito
    const userPlan = await getUserPlan(userId, poolId);

    if (!userPlan || userPlan === 'free') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          canCreateStore: false,
          currentCount: 0,
          limit: STORE_LIMITS.free,
          plan: userPlan || 'free',
          message: 'Free plan does not allow creating stores',
        }),
        headers: getCorsHeaders(origin),
      };
    }

    // Obtener número actual de tiendas del usuario
    const currentCount = await getUserStoreCount(userId);

    // Verificar límite
    const limit = STORE_LIMITS[userPlan as keyof typeof STORE_LIMITS] || 0;
    const canCreateStore = currentCount < limit;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        canCreateStore,
        currentCount,
        limit,
        plan: userPlan,
        message: canCreateStore
          ? `Can create store (${currentCount}/${limit})`
          : `Limit reached (${currentCount}/${limit})`,
      }),
      headers: getCorsHeaders(origin),
    };
  } catch (error) {
    console.error('Error validating store limits:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        canCreateStore: false,
        currentCount: 0,
        limit: 0,
        plan: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      headers: getCorsHeaders(origin),
    };
  }
};

/**
 * Obtiene el plan del usuario desde Cognito
 */
async function getUserPlan(userId: string, userPoolId: string): Promise<string | null> {
  try {
    const response = await cognitoClient.send(
      new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: userId,
      })
    );

    const planAttribute = response.UserAttributes?.find((attr) => attr.Name === 'custom:plan');
    return planAttribute?.Value || null;
  } catch (error) {
    console.error('Error getting user plan:', error);
    throw new Error('Failed to get user plan');
  }
}

/**
 * Obtiene el número actual de tiendas del usuario
 */
async function getUserStoreCount(userId: string): Promise<number> {
  try {
    const response = await client.models.UserStore.listUserStoreByUserId({
      userId,
    });

    return response.data?.length || 0;
  } catch (error) {
    console.error('Error getting user store count:', error);
    throw new Error('Failed to get user store count');
  }
}
