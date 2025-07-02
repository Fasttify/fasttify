import { use } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>({
  authMode: 'userPool',
});

const STORE_LIMITS = {
  Imperial: 5,
  Majestic: 3,
  Royal: 1,
};

// Caché para almacenar promesas de datos
const storeCache = new Map();

/**
 * Función para obtener las tiendas de un usuario
 * Esta función es compatible con Suspense
 */
export function getUserStores(userId: string | null, userPlan?: string) {
  // Si no hay userId, devolver datos vacíos
  if (!userId) {
    return {
      stores: [],
      allStores: [],
      canCreateStore: false,
      error: null,
      storeCount: 0,
    };
  }

  // Crear una clave única para la caché
  const cacheKey = `${userId}-${userPlan || 'default'}`;

  // Si no existe en caché, crear una nueva promesa
  if (!storeCache.has(cacheKey)) {
    const promise = fetchUserStores(userId, userPlan);
    storeCache.set(cacheKey, promise);
  }
  // Usar la promesa de la caché
  return use(storeCache.get(cacheKey));
}

/**
 * Función que realiza la consulta a la base de datos
 */
async function fetchUserStores(userId: string, userPlan?: string) {
  try {
    // Obtener todas las tiendas del usuario (para verificar límites)
    const { data: allUserStores } = await client.models.UserStore.listUserStoreByUserId(
      {
        userId: userId,
      },
      {
        selectionSet: ['storeId', 'storeName', 'storeType', 'onboardingCompleted'],
      }
    );

    const completedStores = allUserStores || [];

    // Verificar límite de tiendas según el plan
    const currentCount = allUserStores?.length || 0;
    const limit = userPlan ? STORE_LIMITS[userPlan as keyof typeof STORE_LIMITS] || 0 : 0;

    return {
      stores: completedStores,
      allStores: allUserStores || [],
      canCreateStore: currentCount < limit,
      error: null,
      storeCount: allUserStores?.length || 0,
    };
  } catch (err) {
    console.error('getUserStores: Error fetching stores:', err);
    return {
      stores: [],
      allStores: [],
      canCreateStore: false,
      error: err,
      storeCount: 0,
    };
  }
}
