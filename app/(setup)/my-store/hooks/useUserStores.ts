import { use } from 'react';
import { client } from '@/lib/clients/amplify-client';
import type { Store, UseUserStoresResult } from '../types/store.types';

const STORE_LIMITS = {
  Imperial: 5,
  Majestic: 3,
  Royal: 1,
};

const storeCache = new Map();

/**
 * Hook para obtener las tiendas de un usuario
 * Esta función es compatible con Suspense
 */
export function useUserStores(userId: string | null, userPlan?: string): UseUserStoresResult {
  // Si no hay userId, devolver datos vacíos
  if (!userId) {
    return {
      stores: [],
      activeStores: [],
      inactiveStores: [],
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
async function fetchUserStores(userId: string, userPlan?: string): Promise<UseUserStoresResult> {
  try {
    // Obtener todas las tiendas del usuario (para verificar límites)
    const { data: allUserStores } = await client.models.UserStore.listUserStoreByUserId(
      {
        userId: userId,
      },
      {
        selectionSet: ['storeId', 'storeName', 'storeType', 'defaultDomain', 'storeStatus', 'onboardingCompleted'],
      }
    );

    const completedStores = (allUserStores || []) as Store[];

    // Separar tiendas activas e inactivas
    const activeStores = completedStores.filter((store) => store.storeStatus !== false);
    const inactiveStores = completedStores.filter((store) => store.storeStatus === false);

    // Verificar límite de tiendas según el plan
    const currentCount = allUserStores?.length || 0;
    const limit = userPlan ? STORE_LIMITS[userPlan as keyof typeof STORE_LIMITS] || 0 : 0;

    return {
      stores: completedStores,
      activeStores,
      inactiveStores,
      canCreateStore: currentCount < limit,
      error: null,
      storeCount: allUserStores?.length || 0,
    };
  } catch (err) {
    console.error('getUserStores: Error fetching stores:', err);
    return {
      stores: [],
      activeStores: [],
      inactiveStores: [],
      canCreateStore: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
      storeCount: 0,
    };
  }
}
